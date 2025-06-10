const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  membershipType: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

// This line is important - it prevents the model from being redefined
module.exports = mongoose.models.Membership || mongoose.model('Membership', MembershipSchema);