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
      return 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/30 dark:border-blue-900/20';
    }
    if (name.includes('lunch') || name.includes('dinner') || name.includes('food')) {
      return 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/20';
    }
    if (name.includes('tea') || name.includes('snacks')) {
      return 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 border border-amber-100/30 dark:border-amber-900/20';
    }
    return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/30';
  };

  if (loading) {
    return (
      <div className="p-5 space-y-6 animate-pulse">
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
        
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>

        {/* Progress list Skeleton */}
        <div className="space-y-3 bg-white dark:bg-darkCard p-5 rounded-3xl border border-slate-100 dark:border-darkBorder/40">
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-16 bg-slate-100 dark:bg-slate-900/40 rounded-2xl" />
        </div>

        {/* List Skeleton */}
        <div className="space-y-3">
          <div className="h-3.5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[70vh]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Error Loading Dashboard</h3>
        <p className="text-xs text-slate-500 dark:text-slate-450 mb-6">{error}</p>
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
    <div className="p-5 space-y-6 bg-slate-50/50 dark:bg-darkBg transition-colors duration-300 min-h-full">
      
      {/* Premium Greeting Widget */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-[18px] bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-500/10">
            {user ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'S'}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Hi, {user ? user.name.split(' ')[0] : 'Guest'} 👋
            </h2>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 font-extrabold uppercase tracking-wider">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        {/* Quick Add Button */}
        <button
          onClick={() => onOpenAddSheet(null)}
          className="h-10 w-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition flex items-center justify-center shadow-sm"
          aria-label="Add Expense"
          title="Add Expense"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Today */}
        <div className="bg-white dark:bg-darkCard p-4 rounded-3xl border border-slate-100 dark:border-darkBorder/40 shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 text-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 p-1.5 rounded-lg">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Today
          </p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2 flex items-baseline font-sans">
            <span className="text-xs font-bold mr-0.5 text-slate-500 dark:text-slate-400">₹</span>
            {(summary.todayTotal || 0).toLocaleString('en-IN')}
          </h3>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 block">
            Spent since midnight
          </span>
        </div>

        {/* This Month */}
        <div className="bg-white dark:bg-darkCard p-4 rounded-3xl border border-slate-100 dark:border-darkBorder/40 shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 text-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 p-1.5 rounded-lg">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
          <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            This Month
          </p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2 flex items-baseline font-sans">
            <span className="text-xs font-bold mr-0.5 text-slate-500 dark:text-slate-400">₹</span>
            {(summary.monthTotal || 0).toLocaleString('en-IN')}
          </h3>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 block">
            Current billing cycle
          </span>
        </div>
      </div>

      {/* Top Categories Distribution */}
      {((categoryTotals || []).length > 0) && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-5 border border-slate-100 dark:border-darkBorder/40 shadow-sm">
          <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-4">
            Top Categories
          </h3>
          <div className="space-y-3.5">
            {(categoryTotals || []).slice(0, 3).map((item, idx) => {
              const maxVal = (categoryTotals || [])[0]?.value || 1;
              const percent = (item.value / maxVal) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">
                      {item.name}
                    </span>
                    <span className="text-slate-900 dark:text-white font-extrabold">
                      ₹{item.value.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-full overflow-hidden">
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

      {/* Recent Spending with Scrollable Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
            Recent Spending
          </h3>
          
          {/* Quick Filters - Horizontal Scrollable Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[65%] scroll-smooth py-0.5">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1 rounded-xl text-[9px] font-bold border whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm'
                  : 'bg-white border-slate-100 dark:bg-darkCard dark:border-darkBorder/40 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All
            </button>
            {(categories || []).slice(0, 5).map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1 rounded-xl text-[9px] font-bold border whitespace-nowrap transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm'
                    : 'bg-white border-slate-100 dark:bg-darkCard dark:border-darkBorder/40 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses List */}
        {(!filteredExpenses || filteredExpenses.length === 0) ? (
          <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
            <div className="h-11 w-11 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-darkBorder/30 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mb-3">
              <Tag className="h-4.5 w-4.5" />
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white">No expenses recorded</p>
            <p className="text-[10px] text-slate-455 dark:text-slate-450 mt-1 max-w-xs leading-relaxed">
              Tap the '+' button in the header or use the bottom navigation bar to record an expense!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {(filteredExpenses || []).map((expense) => (
              <div
                key={expense._id}
                className="bg-white dark:bg-darkCard p-3 rounded-2xl border border-slate-100 dark:border-darkBorder/30 shadow-sm flex items-center justify-between hover:scale-[1.005] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Category icon avatar */}
                  <div
                    className={`h-10 w-10 rounded-[14px] flex items-center justify-center text-lg shrink-0 shadow-sm ${getCategoryBgColor(
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
                    {expense.remark && (
                      <p className="text-[9px] text-slate-450 dark:text-slate-400 truncate font-semibold mt-0.5">
                        {expense.remark}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold border border-slate-100 dark:border-darkBorder/15">
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

                {/* Amount and Operations */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white font-sans mr-1.5">
                    ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenAddSheet(expense)}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-100/50 dark:border-transparent transition-all"
                      aria-label="Edit"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(expense)}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-red-500 border border-slate-100/50 dark:border-transparent transition-all"
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
