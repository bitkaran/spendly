import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

// Helper to check budget threshold and return warnings
const checkBudgetStatus = async (userId, category, date, addAmount = 0, excludeTransactionId = null) => {
  try {
    const txDate = new Date(date);
    const month = txDate.getMonth() + 1;
    const year = txDate.getFullYear();

    // Fetch category-specific budget and Overall budget
    const [catBudget, overallBudget] = await Promise.all([
      Budget.findOne({ userId, category, month, year }),
      Budget.findOne({ userId, category: 'Overall', month, year })
    ]);

    const result = {
      category: { warning: false, exceeded: false, limit: 0, current: 0 },
      overall: { warning: false, exceeded: false, limit: 0, current: 0 }
    };

    // Calculate current spending for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const baseQuery = {
      userId,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    };
    if (excludeTransactionId) {
      baseQuery._id = { $ne: excludeTransactionId };
    }

    // Category spending query
    const catQuery = { ...baseQuery, category };
    const catExpenses = await Transaction.find(catQuery);
    const currentCatSpend = catExpenses.reduce((sum, tx) => sum + tx.amount, 0) + addAmount;

    // Overall spending query
    const overallExpenses = await Transaction.find(baseQuery);
    const currentOverallSpend = overallExpenses.reduce((sum, tx) => sum + tx.amount, 0) + addAmount;

    // Check category budget
    if (catBudget) {
      result.category.limit = catBudget.amount;
      result.category.current = currentCatSpend;
      if (currentCatSpend > catBudget.amount) {
        result.category.exceeded = true;
      } else if (currentCatSpend >= catBudget.amount * 0.8) {
        result.category.warning = true;
      }
    }

    // Check overall budget
    if (overallBudget) {
      result.overall.limit = overallBudget.amount;
      result.overall.current = currentOverallSpend;
      if (currentOverallSpend > overallBudget.amount) {
        result.overall.exceeded = true;
      } else if (currentOverallSpend >= overallBudget.amount * 0.8) {
        result.overall.warning = true;
      }
    }

    return result;
  } catch (error) {
    console.error('Check budget status error:', error);
    return null;
  }
};

// @desc    Get all transactions with filters
// @route   GET /api/transactions
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { from, to, category, paymentMode, minAmount, maxAmount, search, type, isRecurring } = req.query;

    const query = { userId };

    // Transaction Type Filter (expense/income)
    if (type && type !== 'All') {
      query.type = type;
    }

    // Date Range Filter
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) {
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

    // Recurring Filter
    if (isRecurring !== undefined) {
      query.isRecurring = isRecurring === 'true';
    }

    // Text search (Remark, Category, Merchant, Tags)
    if (search && search.trim() !== '') {
      const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // escape regex chars
      query.$or = [
        { remark: { $regex: escapedSearch, $options: 'i' } },
        { category: { $regex: escapedSearch, $options: 'i' } },
        { merchant: { $regex: escapedSearch, $options: 'i' } },
        { tags: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    console.error('Get transaction by ID error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
export const createTransaction = async (req, res) => {
  try {
    const {
      type,
      date,
      category,
      amount,
      remark,
      paymentMode,
      merchant,
      tags,
      isRecurring,
      recurrenceFrequency,
      nextDueDate,
      autoCreate,
      attachment
    } = req.body;

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

    const txType = type || 'expense';

    // Calculate budget status BEFORE saving the expense (only for expenses)
    let budgetStatus = null;
    if (txType === 'expense') {
      budgetStatus = await checkBudgetStatus(req.user._id, category.trim(), date, numAmount);
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type: txType,
      date: new Date(date),
      category: category.trim(),
      amount: numAmount,
      remark: remark ? remark.trim() : '',
      paymentMode: paymentMode || 'Cash',
      merchant: merchant ? merchant.trim() : '',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      isRecurring: !!isRecurring,
      recurrenceFrequency: recurrenceFrequency || 'none',
      nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      autoCreate: !!autoCreate,
      attachment: attachment || ''
    });

    return res.status(201).json({
      transaction,
      budgetStatus
    });
  } catch (error) {
    console.error('Create transaction error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
export const updateTransaction = async (req, res) => {
  try {
    const {
      type,
      date,
      category,
      amount,
      remark,
      paymentMode,
      merchant,
      tags,
      isRecurring,
      recurrenceFrequency,
      nextDueDate,
      autoCreate,
      attachment
    } = req.body;

    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (type) transaction.type = type;
    if (date) transaction.date = new Date(date);
    
    if (category) {
      if (category.trim() === '') {
        return res.status(400).json({ message: 'Category is required' });
      }
      transaction.category = category.trim();
    }

    if (amount !== undefined && amount !== null) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }
      transaction.amount = numAmount;
    }

    if (remark !== undefined) transaction.remark = remark.trim();
    if (paymentMode) transaction.paymentMode = paymentMode;
    if (merchant !== undefined) transaction.merchant = merchant.trim();
    if (tags !== undefined) transaction.tags = Array.isArray(tags) ? tags : [tags];
    if (isRecurring !== undefined) transaction.isRecurring = !!isRecurring;
    if (recurrenceFrequency !== undefined) transaction.recurrenceFrequency = recurrenceFrequency;
    if (nextDueDate !== undefined) transaction.nextDueDate = nextDueDate ? new Date(nextDueDate) : null;
    if (autoCreate !== undefined) transaction.autoCreate = !!autoCreate;
    if (attachment !== undefined) transaction.attachment = attachment;

    // Check budget status with updated amount
    let budgetStatus = null;
    if (transaction.type === 'expense') {
      budgetStatus = await checkBudgetStatus(
        req.user._id,
        transaction.category,
        transaction.date,
        transaction.amount,
        transaction._id
      );
    }

    const updatedTransaction = await transaction.save();

    return res.status(200).json({
      transaction: updatedTransaction,
      budgetStatus
    });
  } catch (error) {
    console.error('Update transaction error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
export const deleteTransaction = async (req, res) => {
  try {
    const result = await Transaction.deleteOne({ _id: req.params.id, userId: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
