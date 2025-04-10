const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// Import the Contact model from your main server file
// Since your Contact model is defined in server.js, we need to access it
const Contact = mongoose.model("Contact");

// GET route to render the contact page
router.get("/contact", (req, res) => {
  res.render("contact", {
    title: "UG Anfield - Contact Us",
    activePage: "contact"
  });
});

// POST route to handle form submission
// Note: The main submit-form route is already defined in your server.js
// This is included here for reference, but can be removed if you prefer keeping it in server.js
router.post("/submit-form", async (req, res) => {
  try {
    const { recipient, name, email, message, date } = req.body;
    
    // Basic validation
    if (!recipient || !name || !email || !message) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Create new contact document
    const newContact = new Contact({
      recipient,
      name,
      email,
      message,
      date: date || new Date()
    });

    // Save to database
    await newContact.save();

    // Get transporter from the app
    const transporter = req.app.get('emailTransporter');
    
    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #d32f2f;">New Message from UG Anfield Website</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message}
          </div>
          <p>You can reply directly to this email to respond to the sender.</p>
          <p>- UG Anfield Website</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(" Email error:", error);
        return res.status(500).json({ message: "Error sending email" });
      }
      res.status(200).json({ message: "Message sent & stored successfully" });
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET route to access sent messages (admin only - would need authentication)
router.get("/admin/messages", async (req, res) => {
  try {
    // In a production app, you would add authentication middleware here
    const messages = await Contact.find().sort({ date: -1 });
    res.render("admin/messages", { 
      title: "UG Anfield - Contact Messages",
      messages 
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).render("error", { 
      message: "Error fetching contact messages" 
    });
  }
});

module.exports = router;