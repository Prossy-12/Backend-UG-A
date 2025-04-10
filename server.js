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

// Database Connection
mongoose.connect(process.env.DATABASE_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection
  .once("open", () => console.log(" Connected to MongoDB"))
  .on("error", (err) => console.error(` Database connection error: ${err.message}`));

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
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(" Email error:", error);
        return res.status(500).json({ message: "Error sending email" });
      }
      
      // Send confirmation to the person who submitted the form
      const confirmationEmail = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "We've received your message - UG Anfield",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d32f2f;">Thank You for Contacting UG Anfield</h2>
            <p>Dear ${name},</p>
            <p>We have received your message and will get back to you ${preferredContact === 'phone' ? 'with a call' : 'by email'} as soon as possible.</p>
            <p>For your reference, here's a summary of your message:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Subject:</strong> ${subject || 'Website Inquiry'}</p>
              <p><strong>Message:</strong> ${message}</p>
            </div>
            <p>If you need immediate assistance, please contact us directly at <a href="tel:+256123456789">+256 123 456 789</a>.</p>
            <p><strong>Best regards,</strong><br>The UG Anfield Team</p>
          </div>
        `
      };
      
      // Send confirmation email
      transporter.sendMail(confirmationEmail, (confirmError) => {
        if (confirmError) {
          console.error(" Confirmation email error:", confirmError);
        }
        
        res.status(200).json({ message: "Message sent & stored successfully" });
      });
    });
  } catch (error) {
    console.error(" Server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 404 Error Handling
app.use((req, res) => {
  res.status(404).render("notFoundPage");
});

// Start the Server
server.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));

// Handle Unexpected Errors
process.on("unhandledRejection", (err) => {
  console.error(" Unhandled Rejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error(" Uncaught Exception:", err);
  process.exit(1);
});