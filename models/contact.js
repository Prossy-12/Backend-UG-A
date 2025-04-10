const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Message Schema definition
const messageSchema = new Schema({
  recipient: {
    type: String,
    required: [true, 'Recipient email is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  phone: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message content is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'resolved'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },
  notes: {
    type: String
  }
});

// Indexing for faster queries
messageSchema.index({ status: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ email: 1 });

// Create a virtual property for response time calculation
messageSchema.virtual('responseTime').get(function() {
  if (this.respondedAt && this.createdAt) {
    // Return response time in hours
    return (this.respondedAt - this.createdAt) / (1000 * 60 * 60);
  }
  return null;
});

// Ensure virtuals are included when converting to JSON
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

// Create and export the model
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;