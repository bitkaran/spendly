import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import User from '../models/User.js';

// @desc    Get dashboard summary (Today's spend, Month's spend, Month's income, Budget, Insights, Recent transactions)
// @route   GET /api/analytics/summary
export const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const currencySym = user ? user.currencySymbol : '₹';
    const monthlyBudgetLimit = user ? user.monthlyBudget : 0;

    const now = new Date();
    
    // Start & End of Today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Start & End of This Month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Start & End of Last Month
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // 1. Today's Spend (expense only)
    const todayExpenses = await Transaction.aggregate([
      { $match: { userId, type: 'expense', date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const todayTotal = todayExpenses.length > 0 ? todayExpenses[0].total : 0;

    // 2. This Month's Spend (expense only)
    const thisMonthExpenses = await Transaction.aggregate([
      { $match: { userId, type: 'expense', date: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const monthTotal = thisMonthExpenses.length > 0 ? thisMonthExpenses[0].total : 0;

    // 3. Last Month's Spend (expense only)
    const lastMonthExpenses = await Transaction.aggregate([
      { $match: { userId, type: 'expense', date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const lastMonthTotal = lastMonthExpenses.length > 0 ? lastMonthExpenses[0].total : 0;

    // 4. This Month's Income (income only)
    const thisMonthIncomeAgg = await Transaction.aggregate([
      { $match: { userId, type: 'income', date: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const monthIncomeTotal = thisMonthIncomeAgg.length > 0 ? thisMonthIncomeAgg[0].total : 0;

    // 5. Recent Transactions (both expense and income)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(10);

    // 6. Top spending category this month
    const topCategoryAgg = await Transaction.aggregate([
      { $match: { userId, type: 'expense', date: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]);
    const topSpendingCategory = topCategoryAgg.length > 0 ? topCategoryAgg[0]._id : 'None';
    const topCategoryAmount = topCategoryAgg.length > 0 ? topCategoryAgg[0].total : 0;

    // 7. Average daily spend this month
    const daysInMonthSoFar = Math.max(1, now.getDate());
    const averageDailySpend = Math.round(monthTotal / daysInMonthSoFar);

    // 8. Upcoming recurring payments (isRecurring true, nextDueDate in future or today)
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const upcomingRecurring = await Transaction.find({
      userId,
      isRecurring: true,
      nextDueDate: { $gte: startOfToday }
    })
      .sort({ nextDueDate: 1 })
      .limit(5);

    // 9. MoM percentage comparison
    let momPercentage = 0;
    if (lastMonthTotal > 0) {
      momPercentage = Math.round(((monthTotal - lastMonthTotal) / lastMonthTotal) * 100);
    } else if (monthTotal > 0) {
      momPercentage = 100;
    }

    // 10. Biggest transaction this month
    const biggestTx = await Transaction.findOne({
      userId,
      date: { $gte: thisMonthStart, $lte: thisMonthEnd }
    }).sort({ amount: -1 });

    // 11. Calculate category-specific month-over-month change for food vs other things
    // Let's check Food specifically
    const thisMonthFoodAgg = await Transaction.aggregate([
      { $match: { userId, type: 'expense', category: /food|dining/i, date: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const lastMonthFoodAgg = await Transaction.aggregate([
      { $match: { userId, type: 'expense', category: /food|dining/i, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const thisMonthFood = thisMonthFoodAgg.length > 0 ? thisMonthFoodAgg[0].total : 0;
    const lastMonthFood = lastMonthFoodAgg.length > 0 ? lastMonthFoodAgg[0].total : 0;
    let foodMomChange = 0;
    if (lastMonthFood > 0) {
      foodMomChange = Math.round(((thisMonthFood - lastMonthFood) / lastMonthFood) * 100);
    }

    // 12. Alert if user has crossed 80% budget
    const hasBudgetWarning = monthlyBudgetLimit > 0 && monthTotal >= (monthlyBudgetLimit * 0.8);
    const budgetExceeded = monthlyBudgetLimit > 0 && monthTotal > monthlyBudgetLimit;

    // Fetch active budgets for this month (for progress trackers)
    const activeBudgets = await Budget.find({
      userId,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    });

    return res.status(200).json({
      todayTotal,
      monthTotal,
      monthIncomeTotal,
      netBalance: monthIncomeTotal - monthTotal,
      recentExpenses: recentTransactions, // keep same key for backward compatibility
      recentTransactions,
      topSpendingCategory,
      topCategoryAmount,
      averageDailySpend,
      upcomingRecurring,
      momPercentage,
      lastMonthTotal,
      biggestTransaction: biggestTx,
      foodMomChange,
      hasBudgetWarning,
      budgetExceeded,
      currencySymbol: currencySym,
      currencyCode: user ? user.currencyCode : 'INR',
      monthlyBudget: monthlyBudgetLimit,
      activeBudgets
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
    const { type } = req.query; // 'expense' or 'income'

    const filter = { userId };
    if (type) {
      filter.type = type;
    } else {
      filter.type = 'expense'; // default to expense for pie charts
    }

    const categoryTotals = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: '$category', value: { $sum: '$amount' } } },
      { $sort: { value: -1 } },
    ]);

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

// @desc    Get monthly trend (last 6 months totals: expense vs income)
// @route   GET /api/analytics/monthly
export const getMonthlyTrend = async (req, res) => {
  try {
    const userId = req.user._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyData = await Transaction.aggregate([
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
            type: '$type'
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const result = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();

      const expenseMatch = monthlyData.find(
        (m) => m._id.year === year && m._id.month === monthIndex + 1 && m._id.type === 'expense'
      );
      const incomeMatch = monthlyData.find(
        (m) => m._id.year === year && m._id.month === monthIndex + 1 && m._id.type === 'income'
      );

      result.push({
        month: `${monthNames[monthIndex]} ${year.toString().slice(-2)}`,
        expense: expenseMatch ? expenseMatch.total : 0,
        income: incomeMatch ? incomeMatch.total : 0,
        net: (incomeMatch ? incomeMatch.total : 0) - (expenseMatch ? expenseMatch.total : 0)
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
    const { category, from, to, type } = req.query;

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

    if (type) {
      query.type = type;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const transactions = await Transaction.find(query).sort({ amount: 1 });

    if (transactions.length === 0) {
      return res.status(200).json({
        totalAmount: 0,
        totalExpense: 0, // compatibility
        totalEntries: 0,
        averagePerDay: 0,
        highestTransaction: null,
        lowestTransaction: null,
      });
    }

    const totalAmount = transactions.reduce((acc, tx) => acc + tx.amount, 0);
    const totalEntries = transactions.length;

    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const averagePerDay = parseFloat((totalAmount / diffDays).toFixed(2));

    const lowestTransaction = transactions[0];
    const highestTransaction = transactions[transactions.length - 1];

    return res.status(200).json({
      totalAmount,
      totalExpense: totalAmount, // compatibility
      totalEntries,
      averagePerDay,
      highestTransaction,
      lowestTransaction,
      highestExpense: highestTransaction, // compatibility
      lowestExpense: lowestTransaction, // compatibility
    });
  } catch (error) {
    console.error('Get custom total error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
