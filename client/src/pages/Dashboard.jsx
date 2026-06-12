import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, AlertCircle, ArrowUpRight, ArrowDownLeft, Wallet, Repeat, Flame, Sparkles, Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import DashboardEmptyIllustration from '../components/illustrations/DashboardEmptyIllustration';

const Dashboard = ({ onOpenAddSheet, triggerRerender, categories = [] }) => {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({
    todayTotal: 0,
    monthTotal: 0,
    monthIncomeTotal: 0,
    netBalance: 0,
    recentTransactions: [],
    topSpendingCategory: 'None',
    topCategoryAmount: 0,
    averageDailySpend: 0,
    upcomingRecurring: [],
    momPercentage: 0,
    lastMonthTotal: 0,
    biggestTransaction: null,
    foodMomChange: 0,
    hasBudgetWarning: false,
    budgetExceeded: false,
    currencySymbol: '₹',
    currencyCode: 'INR',
    monthlyBudget: 0
  });
  
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Deletion state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);

  // Quick Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('spendly_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchDashboardData();
  }, [triggerRerender]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [summaryRes, categoryTotalsRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/category-total')
      ]);

      setSummary(summaryRes.data);
      setCategoryTotals(categoryTotalsRes.data);
      setFilteredTransactions(summaryRes.data.recentTransactions || []);
    } catch (err) {
      console.error('Fetch dashboard error:', err);
      setError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  // Filter local transactions when category filter is clicked
  useEffect(() => {
    const list = summary.recentTransactions || [];
    if (selectedCategory === 'All') {
      setFilteredTransactions(list);
    } else {
      setFilteredTransactions(
        list.filter((tx) => tx.category.toLowerCase() === selectedCategory.toLowerCase())
      );
    }
  }, [selectedCategory, summary.recentTransactions]);

  const handleDeleteRequest = (tx) => {
    setTxToDelete(tx);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!txToDelete) return;
    try {
      await api.delete(`/transactions/${txToDelete._id}`);
      toast.success('Transaction deleted successfully');
      setIsConfirmOpen(false);
      setTxToDelete(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Delete transaction error:', err);
      toast.error('Failed to delete transaction');
    }
  };

  // Helper to dynamically get category styling from Category DB records
  const getCategoryDetails = (catName) => {
    if (!catName) return { icon: '🏷️', color: '#8395a7' };
    const found = categories.find((c) => c.name && c.name.toLowerCase() === catName.toLowerCase());
    if (found) {
      return {
        icon: found.icon || '🏷️',
        color: found.color || '#8395a7',
      };
    }
    
    // Static Fallbacks for common category strings (in case category collection query hasn't loaded)
    const name = catName.toLowerCase();
    if (name.includes('food') || name.includes('dining') || name.includes('lunch') || name.includes('dinner')) {
      return { icon: '🍔', color: '#ff9f43' };
    }
    if (name.includes('transport') || name.includes('auto') || name.includes('metro') || name.includes('travel')) {
      return { icon: '🚗', color: '#54a0ff' };
    }
    if (name.includes('salary') || name.includes('income')) {
      return { icon: '💰', color: '#10ac84' };
    }
    return { icon: '🏷️', color: '#8395a7' };
  };

  const cSym = summary.currencySymbol || '₹';
  const totalSpentMonth = summary.monthTotal || 0;
  const monthlyBudgetLimit = summary.monthlyBudget || 0;
  
  // Calculate budget remaining and percentage
  const budgetRemaining = Math.max(0, monthlyBudgetLimit - totalSpentMonth);
  const budgetPercentage = monthlyBudgetLimit > 0 ? Math.min(100, (totalSpentMonth / monthlyBudgetLimit) * 100) : 0;

  if (loading) {
    return (
      <div className="p-5 space-y-6 animate-pulse bg-slate-50 dark:bg-darkBg min-h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-3 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-[28px]" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[70vh] bg-slate-50 dark:bg-darkBg">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Error Loading Dashboard</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:text-slate-950 text-white rounded-2xl font-bold shadow-md transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 bg-slate-50 dark:bg-darkBg transition-colors duration-300 min-h-full pb-8">
      
      {/* Greeting Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Hi, {user ? user.name.split(' ')[0] : 'Guest'} 👋
          </h2>
          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">
            Wallet overview
          </p>
        </div>
        
        <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 text-[10px] font-extrabold text-slate-655 dark:text-slate-350 shadow-sm flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-indigo-500" />
          {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Spendly Active Wallet Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-[28px] p-5 shadow-lg shadow-indigo-950/20">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-indigo-500/15 blur-xl pointer-events-none" />

        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-1">
              <Wallet className="h-3 w-3 text-emerald-400" />
              Net Balance
            </span>
            <h3 className="text-2xl font-black font-sans leading-none pt-1">
              {cSym}{summary.netBalance.toLocaleString()}
            </h3>
            <span className="text-[9px] font-medium text-indigo-200/80 block pt-0.5">
              Current Monthly Balance (Inflow vs Outflow)
            </span>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            {summary.currencyCode}
          </div>
        </div>

        {/* Overall Budget Progress */}
        {monthlyBudgetLimit > 0 && (
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-bold text-indigo-200">
              <span>{budgetPercentage.toFixed(0)}% Spent</span>
              <span>{cSym}{totalSpentMonth.toLocaleString()} / {cSym}{monthlyBudgetLimit.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPercentage > 85
                    ? 'bg-rose-500'
                    : budgetPercentage > 60
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Threshold Alerts */}
      {summary.budgetExceeded && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-center gap-2.5 text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="text-[10px] font-bold">
            Budget limit exceeded! You have spent {cSym}{totalSpentMonth.toLocaleString()} this month, crossing your set limit of {cSym}{monthlyBudgetLimit.toLocaleString()}.
          </div>
        </div>
      )}
      {!summary.budgetExceeded && summary.hasBudgetWarning && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center gap-2.5 text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="text-[10px] font-bold">
            Budget Warning! You have crossed 80% of your monthly budget allowance. Keep an eye on your expenses.
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-darkCard p-3 rounded-2xl border border-slate-100 dark:border-darkBorder/30 shadow-sm flex flex-col justify-between">
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Today's spend</span>
          <div className="mt-2.5">
            <h4 className="text-sm font-black text-rose-600 dark:text-rose-400 font-sans leading-none">
              {cSym}{summary.todayTotal.toLocaleString()}
            </h4>
          </div>
        </div>
        <div className="bg-white dark:bg-darkCard p-3 rounded-2xl border border-slate-100 dark:border-darkBorder/30 shadow-sm flex flex-col justify-between">
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">This Month spend</span>
          <div className="mt-2.5">
            <h4 className="text-sm font-black text-rose-600 dark:text-rose-400 font-sans leading-none">
              {cSym}{totalSpentMonth.toLocaleString()}
            </h4>
          </div>
        </div>
        <div className="bg-white dark:bg-darkCard p-3 rounded-2xl border border-slate-100 dark:border-darkBorder/30 shadow-sm flex flex-col justify-between">
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Income</span>
          <div className="mt-2.5">
            <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-sans leading-none">
              {cSym}{summary.monthIncomeTotal.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>

      {/* Smart Insights Panel */}
      <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/30 rounded-[24px] p-4 space-y-3 shadow-sm">
        <h4 className="text-[9px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Smart Financial Insights
        </h4>
        
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700 dark:text-slate-350">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Average Daily Spend</span>
            <p className="font-extrabold text-slate-900 dark:text-white text-xs">{cSym}{summary.averageDailySpend}</p>
            <p className="text-[8px] text-slate-400">per day this month</p>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Top Category</span>
            <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">{summary.topSpendingCategory}</p>
            <p className="text-[8px] text-slate-400">Total: {cSym}{summary.topCategoryAmount}</p>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1 col-span-2 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Month-over-Month Trend</span>
              <p className="font-extrabold text-slate-900 dark:text-white">
                {summary.momPercentage > 0 ? `+${summary.momPercentage}%` : `${summary.momPercentage}%`}
              </p>
            </div>
            <div className="text-[8px] text-slate-400 max-w-[65%] text-right font-semibold">
              {summary.momPercentage > 0 
                ? `You spent ${summary.momPercentage}% more than last month.` 
                : `Awesome! You spent less than last month.`}
            </div>
          </div>

          {summary.foodMomChange !== 0 && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl col-span-2 flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500 shrink-0" />
              <p className="text-[8px] leading-relaxed text-slate-500 dark:text-slate-400">
                You spent <span className="font-bold text-slate-800 dark:text-white">{summary.foodMomChange}% more</span> on food & dining category this month compared to last month.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Recurring Payments list */}
      {summary.upcomingRecurring && summary.upcomingRecurring.length > 0 && (
        <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/30 rounded-[24px] p-4 space-y-2.5 shadow-sm">
          <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Repeat className="h-3.5 w-3.5 text-indigo-500" />
            Upcoming Subscriptions / Bills
          </h4>
          <div className="space-y-2">
            {summary.upcomingRecurring.map((item) => (
              <div key={item._id} className="flex justify-between items-center text-[10px] p-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100/50 dark:border-darkBorder/20">
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">{item.category}</p>
                  <p className="text-[8px] text-slate-400">Due: {new Date(item.nextDueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 dark:text-white">{cSym}{item.amount}</p>
                  <span className="text-[7px] px-1 py-0.25 bg-slate-200/60 dark:bg-slate-805 text-slate-600 dark:text-slate-400 rounded font-bold uppercase">{item.recurrenceFrequency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Ledger Transactions */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Recent Ledger
          </h3>
          
          {/* Quick Filter Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth max-w-[65%] py-0.5">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1 rounded-xl text-[9px] font-bold border transition-all duration-200 active:scale-95 ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm'
                  : 'bg-white border-slate-100 dark:bg-darkCard dark:border-darkBorder/40 text-slate-500 dark:text-slate-400'
              }`}
            >
              All
            </button>
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.name || '')}
                className={`px-3 py-1 rounded-xl text-[9px] font-bold border transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  selectedCategory.toLowerCase() === (cat.name ? cat.name.toLowerCase() : '')
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm'
                    : 'bg-white border-slate-100 dark:bg-darkCard dark:border-darkBorder/40 text-slate-500 dark:text-slate-400'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions list */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-8 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="flex items-center justify-center mb-1 shrink-0">
              <DashboardEmptyIllustration className="w-36 h-36" />
            </div>
            <p className="text-xs font-black text-slate-900 dark:text-white">No transactions recorded</p>
            <p className="text-[10px] text-slate-455 dark:text-slate-450 mt-1 max-w-xs leading-relaxed">
              Add your first transaction! Use the '+' action button to log any expense or salary.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTransactions.map((tx) => {
              const catDetails = getCategoryDetails(tx.category);
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx._id}
                  className="bg-white dark:bg-darkCard p-3 rounded-2xl border border-slate-100 dark:border-darkBorder/30 shadow-sm flex items-center justify-between hover:scale-[1.005] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Category Icon */}
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm"
                      style={{ backgroundColor: `${catDetails.color}15`, color: catDetails.color }}
                    >
                      {catDetails.icon}
                    </div>
                    {/* Metadata */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {tx.category}
                        </h4>
                        {tx.isRecurring && (
                          <span className="text-[6px] px-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/30 text-indigo-650 dark:text-indigo-400 font-bold uppercase rounded">R</span>
                        )}
                      </div>
                      {tx.remark && (
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate font-semibold mt-0.5">
                          {tx.remark}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-900/50 text-slate-550 dark:text-slate-400 font-bold border border-slate-100/50 dark:border-darkBorder/20">
                          {tx.paymentMode}
                        </span>
                        {tx.merchant && (
                          <span className="text-[8px] text-slate-500 truncate font-bold max-w-[80px]">
                            @ {tx.merchant}
                          </span>
                        )}
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold">
                          {new Date(tx.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black font-sans mr-1.5 ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {isIncome ? '+' : '-'}{cSym}{tx.amount.toLocaleString()}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenAddSheet(tx)}
                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-100/30 dark:border-transparent transition-all active:scale-90"
                        aria-label="Edit"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(tx)}
                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-rose-500 border border-slate-100/30 dark:border-transparent transition-all active:scale-90"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setTxToDelete(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
