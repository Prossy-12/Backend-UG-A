// server.js or app.js (Your main Express file)
const express = require('express');
const router = express.Router();
const Membership = require('../models/Membership');
const nodemailer = require('nodemailer');

// Set up Nodemailer transporter (replace with your real credentials or use environment variables)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'desireasiimwe01@gmail.com', // Replace with your email
    pass: 'ckbwryvcwnxagaoq'   // Replace with your email password or app password
  }
});

// Route for displaying the membership form
router.get('/membership', (req, res) => {
  res.render('membershipPage'); // Updated to match the actual filename
});

// Handle form submission
router.post('/membership', async (req, res) => {
  try {
    const { fullName, email, phone, membershipType } = req.body;

    // Basic validation
    if (!fullName || !email || !phone || !membershipType) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required!' 
      });
    }

    // Create a new membership record
    const newMembership = new Membership({
      fullName,
      email,
      phone,
      membershipType,
    });

    // Save to the database
    await newMembership.save();

    // Send email notification
    const mailOptions = {
      from: 'desireasiimwe01@gmail.com',
      to: 'desireasiimwe01@gmail.com',
      subject: 'New Membership Application',
      text: `New membership application received:
        
Full Name: ${fullName}
Email: ${email}
Phone: ${phone}
Membership Type: ${membershipType}`
    };

    await transporter.sendMail(mailOptions);

    // Send success response
    return res.json({ 
      success: true, 
      message: 'Membership application submitted successfully!' 
    });

  } catch (err) {
    console.error('Error processing membership:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again.' 
    });
  }
});

module.exports = router;
