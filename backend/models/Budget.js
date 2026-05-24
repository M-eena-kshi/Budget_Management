const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  limit: {
    type: Number,
    required: [true, 'Please add a limit'],
  },
  month: {
    type: String, // Format: YYYY-MM
    required: true,
  },
}, {
  timestamps: true,
});

// Ensure unique budget per category per month for a user
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
