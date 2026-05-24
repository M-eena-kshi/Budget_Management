const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an expense
// @route   POST /api/expenses
exports.createExpense = async (req, res) => {
  try {
    const { amount, category, merchant, date, notes, type } = req.body;

    const expense = await Expense.create({
      user: req.user.id,
      amount,
      category,
      merchant,
      date,
      notes,
      type: type || 'expense',
    });

    // Budget Engine Check
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const budget = await Budget.findOne({
      user: req.user.id,
      category,
      month: currentMonth,
    });

    if (budget) {
      // Calculate total expenses for this category and month
      const expenses = await Expense.find({
        user: req.user.id,
        category,
        date: {
          $gte: new Date(`${currentMonth}-01`),
          $lte: new Date(new Date(`${currentMonth}-01`).setMonth(new Date(`${currentMonth}-01`).getMonth() + 1)),
        },
      });

      const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      if (totalSpent > budget.limit) {
        console.log(`ALERT: Budget exceeded for ${category}. Limit: ${budget.limit}, Spent: ${totalSpent}`);
        // TODO: Send email notification using Nodemailer
      }
    }

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure user owns expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await expense.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
