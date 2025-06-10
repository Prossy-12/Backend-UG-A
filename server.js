// 





// Dependencies
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const nodemailer = require("nodemailer");
require("dotenv").config();

// App & Server Initialization
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

/// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Set View Engine & Views Directory
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public"))); // Serves static files (CSS, JS, images)
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data (form submissions)
app.use(express.json()); // Parses JSON payloads

// Contact Schema & Model (unchanged)
const ContactSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  preferredContact: { type: String, default: 'email' },
  subject: String,
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  urgency: { type: String, default: 'normal' },
  status: { type: String, enum: ['new', 'read', 'replied', 'resolved'], default: 'new' },
  newsletter: { type: Boolean, default: false }
});
const Contact = mongoose.model("Contact", ContactSchema);

// Membership Schema & Model (new)
const MembershipSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  membershipType: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Membership = mongoose.model("Membership", MembershipSchema);

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email (e.g., uganfield0@gmail.com)
    pass: process.env.EMAIL_PASS, // App-specific password
  },
});

// Verify email transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter setup failed:', error);
  } else {
    console.log('Email transporter is ready');
  }
});

// Make transporter available to route handlers
app.set('emailTransporter', transporter);

// Routes Import
const pageRoutes = require("./routes/pageRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Use Routes
app.use("/", pageRoutes);
app.use("/", membershipRoutes);
app.use("/", contactRoutes);

// Contact Form Submission Route (unchanged)
app.post("/submit-form", async (req, res) => {
  try {
    const { 
      recipient, 
      name, 
      email, 
      phone, 
      preferredContact,
      subject,
      message, 
      date,
      urgency,
      newsletter
    } = req.body;
    
    const newContact = new Contact({ 
      recipient, 
      name, 
      email, 
      phone: phone || '',
      preferredContact: preferredContact || 'email',
      subject: subject || 'Website Contact Form',
      message,
      date: date || new Date(),
      urgency: urgency || 'normal',
      newsletter: newsletter === 'on'
    });
    
    await newContact.save();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: `New Contact Form Submission: ${subject || 'Website Inquiry'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
            </tr>
            ${phone ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Preferred Contact:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${preferredContact || 'Email'}</td>
            </tr>
            ${subject ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Subject:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${subject}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Message:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${message}</td>
            </tr>
            ${date ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Preferred Response Date:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date(date).toLocaleDateString()}</td>
            </tr>` : ''}
            ${urgency ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Urgency:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${urgency}</td>
            </tr>` : ''}
          </table>
          <p>Message ID: <strong>${newContact._id}</strong> (for reference)</p>
          <p>You can reply directly to the sender at: <a href="mailto:${email}">${email}</a></p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    
    res.redirect("/");
  } catch (err) {
    console.error("Error submitting form:", err);
    res.status(500).send("An error occurred while submitting the form.");
  }
});

// Membership Registration Route (new)
app.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, membershipType } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !membershipType) {
      return res.status(400).render('error', { message: 'All fields are required' });
    }

    // Save to MongoDB (will fail if connection is not resolved)
    const newMember = new Membership({
      fullName,
      email,
      phone,
      membershipType,
    });
    await newMember.save();
    console.log('Member saved to MongoDB:', newMember);

    // Send email to uganfield0@gmail.com
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'uganfield0@gmail.com', // Fixed recipient as per your requirement
      subject: 'New Member Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">New Member Registration</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Full Name:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Membership Type:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${membershipType}</td>
            </tr>
          </table>
          <p>Member ID: <strong>${newMember._id}</strong> (for reference)</p>
          <p>You can contact the member at: <a href="mailto:${email}">${email}</a></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Registration email sent to uganfield0@gmail.com');

    // Redirect to success page (Pug-rendered)
    res.redirect('/success');
  } catch (err) {
    console.error("Error registering member:", err);
    res.status(500).render('error', { message: 'Error registering member. Please try again later.' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something broke!' });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});