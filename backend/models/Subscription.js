const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a service name'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['Entertainment', 'Cloud Services', 'Fitness', 'Music', 'Education', 'Productivity', 'Other'],
    default: 'Entertainment',
  },
  cost: {
    type: Number,
    required: [true, 'Please add a cost amount'],
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly',
  },
  nextRenewal: {
    type: Date,
    required: [true, 'Please specify the next renewal date'],
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days from now
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Credit Card', 'Debit Card', 'Razorpay', 'Net Banking'],
    default: 'UPI',
  },
  status: {
    type: String,
    enum: ['Active', 'Paused', 'Cancelled'],
    default: 'Active',
  },
  confidence: {
    type: Number,
    default: 98, // Detection confidence percentage
  },
  notifyBefore: {
    type: Boolean,
    default: true,
  },
  unusedDays: {
    type: Number,
    default: 0, // Rare usage day count triggers (e.g. "Spotify unused for 21 days")
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
