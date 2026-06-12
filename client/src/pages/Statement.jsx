import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, Calendar, Tag, IndianRupee, RefreshCw, Trash2, Edit2, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const Statement = ({ onOpenAddSheet, triggerRerender, categories = [] }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);

  // Filters State
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('All');
  const [paymentMode, setPaymentMode] = useState('All');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [search, setSearch] = useState('');

  // Delete State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, [from, to, category, paymentMode, minAmount, maxAmount, search, triggerRerender]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (category && category !== 'All') params.category = category;
      if (paymentMode && paymentMode !== 'All') params.paymentMode = paymentMode;
      if (minAmount) params.minAmount = minAmount;
      if (maxAmount) params.maxAmount = maxAmount;
      if (search) params.search = search;

      const response = await api.get('/expenses', { params });
      setExpenses(response.data);
    } catch (error) {
      console.error('Fetch statement error:', error);
      toast.error('Failed to load statement expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFrom('');
    setTo('');
    setCategory('All');
    setPaymentMode('All');
    setMinAmount('');
    setMaxAmount('');
    setSearch('');
    toast.success('Filters reset successfully');
  };

  const handleExportExcel = async () => {
    try {
      toast.loading('Generating Excel statement...', { id: 'excel-export' });
      
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (category && category !== 'All') params.category = category;
      if (paymentMode && paymentMode !== 'All') params.paymentMode = paymentMode;
      if (minAmount) params.minAmount = minAmount;
      if (maxAmount) params.maxAmount = maxAmount;
      if (search) params.search = search;

      const response = await api.get('/export/excel', {
        params,
        responseType: 'blob',
      });

      // Construct file link
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      link.setAttribute('download', `expense-statement-${year}-${month}.xlsx`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Excel exported successfully!', { id: 'excel-export' });
    } catch (err) {
      console.error('Export excel error:', err);
      toast.error('Failed to export statement', { id: 'excel-export' });
    }
  };

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
      fetchExpenses();
    } catch (err) {
      console.error('Delete expense error:', err);
      toast.error('Failed to delete expense');
    }
  };

  const paymentModesList = ['All', 'Cash', 'UPI', 'Card', 'Other'];

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

  // Calculate total amount of filtered expenses
  const totalFilteredAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="p-4 space-y-5 bg-slate-50 dark:bg-darkBg transition-colors duration-300 min-h-full pb-8">
      
      {/* Title & Excel Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
            Statement
          </h2>
          <p className="text-[10px] text-slate-455 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">
            Your Finance Ledger
          </p>
        </div>
        
        <button
          onClick={handleExportExcel}
          disabled={expenses.length === 0}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all text-[10px] uppercase tracking-wider active:scale-95"
        >
          <Download className="h-3.5 w-3.5" />
          Export Excel
        </button>
      </div>

      {/* Summary Header Card */}
      <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-4.5 shadow-sm flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-primary-500/5 rounded-bl-full pointer-events-none" />
        <div className="space-y-0.5">
          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Filtered Spending
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-sans flex items-baseline leading-none pt-1">
            <span className="text-xs font-bold mr-0.5 text-slate-500 dark:text-slate-400">₹</span>
            {totalFilteredAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </h3>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-150/40 dark:border-darkBorder/30 rounded-2xl px-3 py-2 text-right">
          <span className="text-[14px] font-black text-slate-900 dark:text-white block font-sans">
            {expenses.length}
          </span>
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Transactions
          </span>
        </div>
      </div>

      {/* Search & Bottom-Sheet Filter Trigger */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450 dark:text-slate-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search remarks, tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-24 py-3 bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder/40 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-405 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition shadow-sm"
        />
        <button
          onClick={() => setShowFiltersSheet(true)}
          className="absolute inset-y-1.5 right-1.5 px-3 rounded-xl flex items-center gap-1 text-[10px] font-extrabold transition-all border bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-darkBorder/40 text-slate-600 dark:text-slate-350 hover:bg-slate-100"
        >
          <Filter className="h-3 w-3" />
          Filters
        </button>
      </div>

      {/* Dynamic Pills Filters scroll at top */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          <button
            onClick={() => setCategory('All')}
            className={`px-3 py-1 rounded-xl text-[9px] font-bold border whitespace-nowrap transition-all ${
              category === 'All'
                ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm'
                : 'bg-white border-slate-100 dark:bg-darkCard dark:border-darkBorder/40 text-slate-500 dark:text-slate-400'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setCategory(cat.name)}
              className={`px-3 py-1 rounded-xl text-[9px] font-bold border whitespace-nowrap transition-all ${
                category === cat.name
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-955 shadow-sm'
                  : 'bg-white border-slate-100 dark:bg-darkCard dark:border-darkBorder/40 text-slate-500 dark:text-slate-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Quick Payment Mode selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 border-b border-slate-200/20 dark:border-darkBorder/25 pb-2.5">
          <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">Mode:</span>
          {paymentModesList.map((mode) => (
            <button
              key={mode}
              onClick={() => setPaymentMode(mode)}
              className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold border whitespace-nowrap transition-all ${
                paymentMode === mode
                  ? 'bg-primary-600 border-primary-600 text-white dark:bg-primary-500 dark:border-primary-500 shadow-sm'
                  : 'bg-white border-slate-100 dark:bg-darkCard dark:border-darkBorder/40 text-slate-500 dark:text-slate-400'
              }`}
            >
              {mode === 'All' ? 'All' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main transaction list cards */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      ) : expenses.length === 0 ? (
        /* Customized empty state illustration */
        <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="h-12 w-12 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-darkBorder/30 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mb-3">
            <Filter className="h-4.5 w-4.5" />
          </div>
          <p className="text-xs font-black text-slate-900 dark:text-white">No ledger matches</p>
          <p className="text-[10px] text-slate-455 dark:text-slate-450 mt-1 max-w-xs leading-relaxed">
            Try adjusting your search keywords, category filters, or select a different date range.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {expenses.map((expense) => (
            <div
              key={expense._id}
              className="bg-white dark:bg-darkCard p-3 rounded-2xl border border-slate-100 dark:border-darkBorder/30 shadow-sm flex items-center justify-between hover:scale-[1.002] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Category Icon */}
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

              {/* Amount and Actions */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white font-sans mr-1.5">
                  ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenAddSheet(expense)}
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-850 dark:hover:text-white border border-slate-100/30 dark:border-transparent transition-all active:scale-90"
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

      {/* Expanded Filters Bottom Sheet */}
      {showFiltersSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          {/* Tap outside to close */}
          <div className="absolute inset-0" onClick={() => setShowFiltersSheet(false)} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-darkCard rounded-t-[32px] border-t border-slate-100 dark:border-darkBorder shadow-2xl p-5 pb-8 animate-slide-up max-h-[85vh] overflow-y-auto no-scrollbar">
            {/* pull indicator */}
            <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4 cursor-pointer" onClick={() => setShowFiltersSheet(false)} />
            
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Filter Ledger Records
              </h3>
              <button
                onClick={() => setShowFiltersSheet(false)}
                className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-650"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* From Date */}
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-450 uppercase tracking-widest mb-1.5">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="block w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                {/* To Date */}
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-455 uppercase tracking-widest mb-1.5">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="block w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Min Amount */}
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-455 uppercase tracking-widest mb-1.5">
                    Min Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="block w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white placeholder-slate-405 focus:outline-none"
                  />
                </div>
                {/* Max Amount */}
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-455 uppercase tracking-widest mb-1.5">
                    Max Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="block w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white placeholder-slate-405 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action buttons inside sheet */}
              <div className="flex gap-2.5 pt-3">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-3 border border-slate-250/50 dark:border-darkBorder/40 rounded-2xl text-xs font-extrabold text-slate-600 dark:text-slate-350 hover:bg-slate-50/50 transition flex items-center justify-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <button
                  onClick={() => setShowFiltersSheet(false)}
                  className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-905 rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
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

export default Statement;
