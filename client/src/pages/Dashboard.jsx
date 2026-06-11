import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Calendar, Tag, Trash2, Edit2, Plus, AlertCircle, ArrowUpRight } from 'lucide-react';
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
      setFilteredExpenses(summary.recentExpenses);
    } else {
      setFilteredExpenses(
        summary.recentExpenses.filter((exp) => exp.category === selectedCategory)
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
    if (name.includes('auto') || name.includes('metro') || name.includes('travel') || name.includes('coming') || name.includes('return')) {
      return '🚗';
    }
    if (name.includes('lunch') || name.includes('dinner') || name.includes('food') || name.includes('tea') || name.includes('snacks')) {
      return '🍔';
    }
    return '💳';
  };

  const getCategoryBgColor = (catName) => {
    const name = catName.toLowerCase();
    if (name.includes('auto') || name.includes('metro') || name.includes('travel')) {
      return 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400';
    }
    if (name.includes('lunch') || name.includes('dinner') || name.includes('food')) {
      return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400';
    }
    if (name.includes('tea') || name.includes('snacks')) {
      return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400';
    }
    return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        {/* User profile skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
        
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>

        {/* Progress list Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>

        {/* List Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[70vh]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Error Loading Dashboard</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-md transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Greetings block */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hi, {user ? user.name.split(' ')[0] : 'Guest'} 👋
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Welcome back to Spendly app
          </p>
        </div>
        <button
          onClick={() => onOpenAddSheet(null)}
          className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-lg hover:shadow-primary-500/20 active:scale-95 transition flex items-center justify-center"
          aria-label="Quick Add"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Metrics Card Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Today Card */}
        <div className="bg-white dark:bg-darkCard p-4 rounded-3xl border border-slate-100 dark:border-darkBorder/40 shadow-premium dark:shadow-premium-dark relative overflow-hidden">
          <div className="absolute right-0 top-0 h-16 w-16 bg-primary-500/5 dark:bg-primary-400/5 rounded-bl-full flex items-center justify-center text-primary-500 dark:text-primary-400 pl-4 pb-4">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Today
          </p>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-baseline font-sans">
            <span className="text-sm font-semibold mr-0.5">₹</span>
            {summary.todayTotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
            Today's total expenses
          </span>
        </div>

        {/* This Month Card */}
        <div className="bg-white dark:bg-darkCard p-4 rounded-3xl border border-slate-100 dark:border-darkBorder/40 shadow-premium dark:shadow-premium-dark relative overflow-hidden">
          <div className="absolute right-0 top-0 h-16 w-16 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-bl-full flex items-center justify-center text-indigo-500 dark:text-indigo-400 pl-4 pb-4">
            <ArrowUpRight className="h-4.5 w-4.5" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            This Month
          </p>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-baseline font-sans">
            <span className="text-sm font-semibold mr-0.5">₹</span>
            {summary.monthTotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
            June's total expenses
          </span>
        </div>
      </div>

      {/* Category distribution panel */}
      {categoryTotals.length > 0 && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-4 border border-slate-100 dark:border-darkBorder/40 shadow-premium dark:shadow-premium-dark">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">
            Top Categories
          </h3>
          <div className="space-y-3.5">
            {categoryTotals.slice(0, 3).map((item, idx) => {
              // Calculate percentages
              const maxVal = categoryTotals[0]?.value || 1;
              const percent = (item.value / maxVal) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.name}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{item.value.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 dark:from-primary-500 dark:to-indigo-400 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent expenses block */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Recent Spending
          </h3>
          
          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[60%]">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                selectedCategory === 'All'
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white dark:bg-darkCard border-slate-200 dark:border-darkBorder/30 text-slate-500 dark:text-slate-400'
              }`}
            >
              All
            </button>
            {categories.slice(0, 3).map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition whitespace-nowrap ${
                  selectedCategory === cat.name
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white dark:bg-darkCard border-slate-200 dark:border-darkBorder/30 text-slate-500 dark:text-slate-400'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 bg-slate-550/5 dark:bg-slate-400/5 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mb-3">
              <Tag className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">No expenses recorded</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Tap the '+' button in the bottom navigation to add your first expense!
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl divide-y divide-slate-100 dark:divide-darkBorder/35 shadow-premium dark:shadow-premium-dark overflow-hidden">
            {filteredExpenses.map((expense) => (
              <div
                key={expense._id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Category icon avatar */}
                  <div
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${getCategoryBgColor(
                      expense.category
                    )}`}
                  >
                    {getCategoryIcon(expense.category)}
                  </div>
                  {/* Details */}
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {expense.category}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {expense.remark || 'No remark'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                        {expense.paymentMode}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount and Operations */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white font-sans mr-2">
                    ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenAddSheet(expense)}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition"
                      aria-label="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(expense)}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
