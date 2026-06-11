import Expense from '../models/Expense.js';

// @desc    Get dashboard summary (Today's total, This Month's total, Recent expenses)
// @route   GET /api/analytics/summary
export const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Start & End of Today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Start & End of This Month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date();
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);

    // Aggregate Today's total
    const todayExpenses = await Expense.aggregate([
      { $match: { userId, date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const todayTotal = todayExpenses.length > 0 ? todayExpenses[0].total : 0;

    // Aggregate This Month's total
    const monthExpenses = await Expense.aggregate([
      { $match: { userId, date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const monthTotal = monthExpenses.length > 0 ? monthExpenses[0].total : 0;

    // Get 5 recent expenses
    const recentExpenses = await Expense.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      todayTotal,
      monthTotal,
      recentExpenses,
    });
  } catch (error) {
    console.error('Get summary error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get category-wise totals (for Pie/Doughnut charts)
// @route   GET /api/analytics/category-total
export const getCategoryTotals = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate by category
    const categoryTotals = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', value: { $sum: '$amount' } } },
      { $sort: { value: -1 } },
    ]);

    // Map _id to name for recharts readability
    const formattedData = categoryTotals.map((item) => ({
      name: item._id,
      value: item.value,
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Get category totals error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get monthly trend (last 6 months totals)
// @route   GET /api/analytics/monthly
export const getMonthlyTrend = async (req, res) => {
  try {
    const userId = req.user._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyData = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Format last 6 months list dynamically to ensure months with 0 spending are included
    const result = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth(); // 0-indexed

      // Find matching item in monthlyData
      const match = monthlyData.find(
        (m) => m._id.year === year && m._id.month === monthIndex + 1
      );

      result.push({
        month: `${monthNames[monthIndex]} ${year.toString().slice(-2)}`,
        total: match ? match.total : 0,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get monthly trend error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get custom category/date-range calculations
// @route   GET /api/analytics/custom-total
export const getCustomTotal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'From and To dates are required' });
    }

    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const query = {
      userId,
      date: { $gte: fromDate, $lte: toDate },
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    const expenses = await Expense.find(query).sort({ amount: 1 });

    if (expenses.length === 0) {
      return res.status(200).json({
        totalExpense: 0,
        totalEntries: 0,
        averagePerDay: 0,
        highestExpense: null,
        lowestExpense: null,
      });
    }

    // Calculate details
    const totalExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const totalEntries = expenses.length;

    // Calculate calendar days in range
    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const averagePerDay = parseFloat((totalExpense / diffDays).toFixed(2));

    const lowestExpense = expenses[0];
    const highestExpense = expenses[expenses.length - 1];

    return res.status(200).json({
      totalExpense,
      totalEntries,
      averagePerDay,
      highestExpense,
      lowestExpense,
    });
  } catch (error) {
    console.error('Get custom total error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
