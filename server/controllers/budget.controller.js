import Budget from '../models/Budget.js';

// @desc    Get all budgets for current month
// @route   GET /api/budgets
export const getBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();

    const budgets = await Budget.find({ userId, month, year });
    return res.status(200).json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Create or update a budget
// @route   POST /api/budgets
export const createBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, amount, month, year } = req.body;

    if (amount === undefined || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }
    if (!month || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid month (1-12)' });
    }
    if (!year) {
      return res.status(400).json({ message: 'Year is required' });
    }

    const categoryName = category ? category.trim() : 'Overall';

    // Upsert budget to avoid duplicates
    const budget = await Budget.findOneAndUpdate(
      { userId, category: categoryName, month, year },
      { amount },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(201).json(budget);
  } catch (error) {
    console.error('Create budget error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Update a budget by ID
// @route   PUT /api/budgets/:id
export const updateBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;

    if (amount === undefined || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const budget = await Budget.findOne({ _id: req.params.id, userId });
    if (!budget) {
      return res.status(404).json({ message: 'Budget limit not found' });
    }

    budget.amount = amount;
    await budget.save();

    return res.status(200).json(budget);
  } catch (error) {
    console.error('Update budget error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Delete a budget limit
// @route   DELETE /api/budgets/:id
export const deleteBudget = async (req, res) => {
  try {
    const userId = req.user._id;

    const budget = await Budget.findOne({ _id: req.params.id, userId });
    if (!budget) {
      return res.status(404).json({ message: 'Budget limit not found' });
    }

    await Budget.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: 'Budget limit deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
