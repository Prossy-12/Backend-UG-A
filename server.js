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

// Contact Schema & Model with expanded fields
const ContactSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  preferredContact: {
    type: String,
    default: 'email'
  },
  subject: String,
  message: {
    type: String,
    required: true
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  urgency: {
    type: String,
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'resolved'],
    default: 'new'
  },
  newsletter: {
    type: Boolean,
    default: false
  }
});

const Contact = mongoose.model("Contact", ContactSchema);

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password
  },
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


// Contact Form Submission Route
// This can also be moved entirely to contactRoutes.js if preferred
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
    
    // Save form data to MongoDB with expanded fields
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
    
    // Send Email Notification with improved formatting
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient, // Send email to selected recipient
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

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});