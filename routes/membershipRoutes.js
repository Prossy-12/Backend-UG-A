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
    pass: '@Asiimwe24'   // Replace with your email password or app password
  }
});

// Route for displaying the membership form
router.get('/membership', (req, res) => {
  res.render('membershipPage'); // Updated to match the actual filename
});

// Handle form submission
router.post('/membership', (req, res) => {
  const { name, email, phone, membershipType } = req.body;

  // Basic validation
  if (!name || !email || !phone || !membershipType) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required!' 
    });
  }

  // Create a new membership record
  const newMembership = new Membership({
    name,
    email,
    phone,
    membershipType,
  });

  // Save to the database
  newMembership.save()
    .then(() => {
      // Send email notification
      const mailOptions = {
        from: 'desireasiimwe01@gmail.com', // Replace with your email
        to: 'desireasiimwe01@gmail.com',
        subject: 'New Membership Application',
        text: `New membership application received:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMembership Type: ${membershipType}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
          return res.json({ success: true, message: 'Membership application submitted, but email failed to send.' });
        } else {
          console.log('Email sent:', info.response);
          return res.json({ success: true, message: 'Membership application submitted successfully!' });
        }
      });
    })
    .catch(err => {
      console.log('Error saving membership: ', err);
      res.status(500).json({ 
        success: false, 
        message: 'Server error, please try again.' 
      });
    });
});

module.exports = router;
