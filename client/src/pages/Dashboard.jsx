import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Calendar, Tag, Trash2, Edit2, Plus, AlertCircle, ArrowUpRight, Wallet, ArrowDownLeft } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const Dashboard = ({ onOpenAddSheet, triggerRerender, categories = [] }) => {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({ todayTotal: 0, monthTotal: 0, recentExpenses: [] });
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Deletion state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Quick Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  // Mock Budget Limit (Can be configured or custom)
  const monthlyBudget = 25000;

  useEffect(() => {
    // Load current user
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
      setFilteredExpenses(summaryRes.data.recentExpenses);
    } catch (err) {
      console.error('Fetch dashboard error:', err);
      setError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  // Recalculate filtering for recent expenses when quick category filter changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredExpenses(summary.recentExpenses || []);
    } else {
      setFilteredExpenses(
        (summary.recentExpenses || []).filter((exp) => exp.category === selectedCategory)
      );
    }
  }, [selectedCategory, summary.recentExpenses]);

  const handleDeleteRequest = (expense) => {
    setExpenseToDelete(expense);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await api.delete(`/expenses/${expenseToDelete._id}`);
      toast.success('Expense deleted successfully');
      setIsConfirmOpen(false);
      setExpenseToDelete(null);
      fetchDashboardData(); // Reload
    } catch (err) {
      console.error('Delete expense error:', err);
      toast.error('Failed to delete expense');
    }
  };

  // Get icons based on category
  const getCategoryIcon = (catName) => {
    const name = catName.toLowerCase();
    if (name.includes('auto') || name.includes('travel') || name.includes('return auto')) {
      return '🛺';
    }
    if (name.includes('metro')) {
      return '🚇';
    }
    if (name.includes('lunch') || name.includes('food')) {
      return '🍱';
    }
    if (name.includes('dinner')) {
      return '🍲';
    }
    if (name.includes('tea') || name.includes('snacks')) {
      return '☕';
    }
    return '💳';
  };

  const getCategoryBgColor = (catName) => {
    const name = catName.toLowerCase();
    if (name.includes('auto') || name.includes('travel') || name.includes('return auto')) {
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/30 dark:border-blue-900/20';
    }
    if (name.includes('metro')) {
      return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-100/30 dark:border-cyan-900/20';
    }
    if (name.includes('lunch') || name.includes('food')) {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/20';
    }
    if (name.includes('dinner')) {
      return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20';
    }
    if (name.includes('tea') || name.includes('snacks')) {
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 border border-amber-100/30 dark:border-amber-900/20';
    }
    return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/30';
  };

  // Get total for specifically Travel, Food and others for mini cards
  const getSpecificCategoryTotal = (catKeywords) => {
    return categoryTotals
      .filter((item) =>
        catKeywords.some((keyword) => item.name.toLowerCase().includes(keyword))
      )
      .reduce((sum, item) => sum + item.value, 0);
  };

  const travelTotal = getSpecificCategoryTotal(['auto', 'metro', 'travel']);
  const foodTotal = getSpecificCategoryTotal(['lunch', 'dinner', 'snacks', 'tea', 'food']);
  
  // Calculate remaining budget details
  const totalSpentMonth = summary.monthTotal || 0;
  const budgetRemaining = Math.max(0, monthlyBudget - totalSpentMonth);
  const budgetPercentage = Math.min(100, (totalSpentMonth / monthlyBudget) * 100);

  if (loading) {
    return (
      <div className="p-5 space-y-6 animate-pulse bg-slate-50 dark:bg-darkBg min-h-full">
        {/* User profile skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="space-y-1.5">
              <div className="h-4.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-3 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        
        {/* Wallet Skeleton */}
        <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-3xl" />

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[70vh] bg-slate-50 dark:bg-darkBg">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Error Loading Dashboard</h3>
        <p className="text-xs text-slate-550 dark:text-slate-400 mb-6">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-md transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 bg-slate-50 dark:bg-darkBg transition-colors duration-300 min-h-full pb-8">
      
      {/* Premium Greeting Card */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Hi, {user ? user.name.split(' ')[0] : 'Guest'} 👋
          </h2>
          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">
            Let's manage your budget
          </p>
        </div>
        
        {/* Calendar widget info */}
        <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 text-[10px] font-extrabold text-slate-600 dark:text-slate-350 shadow-sm flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary-500" />
          {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Spendly Wallet/Budget Visual Card (Swiggy / Mobile Card look) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-primary-850 to-emerald-900 text-white rounded-[28px] p-5 shadow-lg shadow-indigo-950/15">
        {/* Background visual geometric accents */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-1">
              <Wallet className="h-3 w-3 text-emerald-400" />
              Spendly Active Wallet
            </span>
            <h3 className="text-2xl font-black font-sans leading-none pt-1">
              ₹{budgetRemaining.toLocaleString('en-IN')}
            </h3>
            <span className="text-[9px] font-medium text-indigo-200/80 block pt-0.5">
              Remaining Monthly Budget (Limit: ₹{monthlyBudget.toLocaleString('en-IN')})
            </span>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            Active Status
          </div>
        </div>

        {/* Budget Progress bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between items-center text-[9px] font-bold text-indigo-200">
            <span>{budgetPercentage.toFixed(0)}% Spent</span>
            <span>₹{totalSpentMonth.toLocaleString('en-IN')} / ₹{monthlyBudget.toLocaleString('en-IN')}</span>
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
      </div>

      {/* Today Total, Monthly Total & Mini Category Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today Total Card */}
        <div className="bg-white dark:bg-darkCard p-3.5 rounded-2xl border border-slate-100 dark:border-darkBorder/30 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-2 top-2 bg-emerald-500/5 dark:bg-emerald-500/10 p-1 rounded-lg text-emerald-500">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Today
          </span>
          <div className="mt-3.5">
            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-none font-sans">
              ₹{summary.todayTotal.toLocaleString('en-IN')}
            </h4>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1 block">
              Spent today
            </span>
          </div>
        </div>

        {/* This Month Card */}
        <div className="bg-white dark:bg-darkCard p-3.5 rounded-2xl border border-slate-100 dark:border-darkBorder/30 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-2 top-2 bg-indigo-500/5 dark:bg-indigo-500/10 p-1 rounded-lg text-indigo-500">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            This Month
          </span>
          <div className="mt-3.5">
            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-none font-sans">
              ₹{summary.monthTotal.toLocaleString('en-IN')}
            </h4>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1 block">
              Spent this cycle
            </span>
          </div>
        </div>

        {/* Travel Mini Card */}
        <div className="bg-white dark:bg-darkCard p-3.5 rounded-2xl border border-slate-100 dark:border-darkBorder/30 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-2 top-2 bg-blue-500/5 dark:bg-blue-500/10 p-1 rounded-lg text-blue-500 text-xs">
            🛺
          </div>
          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Travel
          </span>
          <div className="mt-3.5">
            <h4 className="text-base font-black text-slate-900 dark:text-white leading-none font-sans">
              ₹{travelTotal.toLocaleString('en-IN')}
            </h4>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1 block">
              Auto/Metro logs
            </span>
          </div>
        </div>

        {/* Food Mini Card */}
        <div className="bg-white dark:bg-darkCard p-3.5 rounded-2xl border border-slate-100 dark:border-darkBorder/30 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-2 top-2 bg-amber-500/5 dark:bg-amber-500/10 p-1 rounded-lg text-amber-500 text-xs">
            🍱
          </div>
          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Food & Dining
          </span>
          <div className="mt-3.5">
            <h4 className="text-base font-black text-slate-900 dark:text-white leading-none font-sans">
              ₹{foodTotal.toLocaleString('en-IN')}
            </h4>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1 block">
              Lunch/Dinner/Tea
            </span>
          </div>
        </div>
      </div>

      {/* Category Chips Selector - Animated horizontal list */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Recent Spending
          </h3>
          
          {/* Animated pills scroll */}
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
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1 rounded-xl text-[9px] font-bold border transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  selectedCategory === cat.name
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm'
                    : 'bg-white border-slate-100 dark:bg-darkCard dark:border-darkBorder/40 text-slate-500 dark:text-slate-400'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses List / Mobile Transaction Cards */}
        {(!filteredExpenses || filteredExpenses.length === 0) ? (
          /* SVG/CSS Empty state illustration */
          <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-8 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50/80 dark:bg-slate-900/80 flex items-center justify-center mb-4 border border-indigo-100/30 dark:border-darkBorder/15">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" className="w-10 h-10 text-primary-500/80">
                <rect x="20" y="30" width="60" height="40" rx="10" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
                <circle cx="70" cy="50" r="6" fill="currentColor" />
                <path d="M40 45 L50 45 L50 55" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs font-black text-slate-900 dark:text-white">No expenses recorded</p>
            <p className="text-[10px] text-slate-455 dark:text-slate-450 mt-1 max-w-xs leading-relaxed">
              You haven't added any spending records yet. Tap the floating '+' button below to save your first expense!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredExpenses.map((expense) => (
              <div
                key={expense._id}
                className="bg-white dark:bg-darkCard p-3 rounded-2xl border border-slate-100 dark:border-darkBorder/30 shadow-sm flex items-center justify-between hover:scale-[1.005] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Category icon avatar */}
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm ${getCategoryBgColor(
                      expense.category
                    )}`}
                  >
                    {getCategoryIcon(expense.category)}
                  </div>
                  {/* Details */}
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {expense.category}
                    </h4>
                    {expense.remark && (
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate font-semibold mt-0.5">
                        {expense.remark}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-900/50 text-slate-550 dark:text-slate-400 font-bold border border-slate-100/50 dark:border-darkBorder/20">
                        {expense.paymentMode}
                      </span>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold">
                        {expense.date ? new Date(expense.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        }) : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount & Quick Actions */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white font-sans mr-1.5">
                    ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenAddSheet(expense)}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-100/30 dark:border-transparent transition-all active:scale-90"
                      aria-label="Edit"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(expense)}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-red-500 border border-slate-100/30 dark:border-transparent transition-all active:scale-90"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Overlay */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setExpenseToDelete(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
