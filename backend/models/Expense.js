const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    default: 'Uncategorized',
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense',
  },
  merchant: {
    type: String,
    default: 'Unknown',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Expense', expenseSchema);
