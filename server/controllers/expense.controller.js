import Expense from '../models/Expense.js';

// @desc    Get all user expenses with filters
// @route   GET /api/expenses
export const getExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { from, to, category, paymentMode, minAmount, maxAmount, search } = req.query;

    const query = { userId };

    // Date Range Filter
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) {
        // Adjust 'to' date to include the entire day
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
    }

    // Category Filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Payment Mode Filter
    if (paymentMode && paymentMode !== 'All') {
      query.paymentMode = paymentMode;
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    // Text search (on Remark or Category)
    if (search && search.trim() !== '') {
      const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // escape regex chars
      query.$or = [
        { remark: { $regex: escapedSearch, $options: 'i' } },
        { category: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    // Fetch and sort: date descending, then createdAt descending
    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });
    return res.status(200).json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.status(200).json(expense);
  } catch (error) {
    console.error('Get expense ID error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
export const createExpense = async (req, res) => {
  try {
    const { date, category, amount, remark, paymentMode } = req.body;

    // Validate inputs
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    if (!category || category.trim() === '') {
      return res.status(400).json({ message: 'Category is required' });
    }
    if (amount === undefined || amount === null) {
      return res.status(400).json({ message: 'Amount is required' });
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      date: new Date(date),
      category: category.trim(),
      amount: numAmount,
      remark: remark ? remark.trim() : '',
      paymentMode: paymentMode || 'Cash',
    });

    return res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
  try {
    const { date, category, amount, remark, paymentMode } = req.body;
    
    // Find expense and verify ownership
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Validate inputs if provided
    if (date) {
      expense.date = new Date(date);
    }
    if (category) {
      if (category.trim() === '') {
        return res.status(400).json({ message: 'Category is required' });
      }
      expense.category = category.trim();
    }
    if (amount !== undefined && amount !== null) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }
      expense.amount = numAmount;
    }
    if (remark !== undefined) {
      expense.remark = remark.trim();
    }
    if (paymentMode) {
      if (!['Cash', 'UPI', 'Card', 'Other'].includes(paymentMode)) {
        return res.status(400).json({ message: 'Invalid payment mode' });
      }
      expense.paymentMode = paymentMode;
    }

    const updatedExpense = await expense.save();
    return res.status(200).json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const result = await Expense.deleteOne({ _id: req.params.id, userId: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
