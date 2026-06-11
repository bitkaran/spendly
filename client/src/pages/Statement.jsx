import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, Calendar, Tag, DollarSign, RefreshCw, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const Statement = ({ onOpenAddSheet, triggerRerender, categories = [] }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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

  return (
    <div className="p-4 space-y-5">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
            Statement
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Search, filter and export data
          </p>
        </div>
        
        <button
          onClick={handleExportExcel}
          disabled={expenses.length === 0}
          className="px-4 py-2 bg-emeraldPrimary-600 hover:bg-emeraldPrimary-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-650 text-white font-bold rounded-2xl shadow-md flex items-center gap-1.5 transition text-xs"
        >
          <Download className="h-4 w-4" />
          Export Excel
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search remark or category name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-12 py-3 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition shadow-sm"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute inset-y-1.5 right-1.5 px-3 rounded-xl flex items-center gap-1 text-xs font-bold transition ${
            showFilters
              ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 border border-primary-200/20'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-150'
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          Filter
        </button>
      </div>

      {/* Expanded Filters Drawer */}
      {showFilters && (
        <div className="bg-white dark:bg-darkCard p-4 rounded-3xl border border-slate-150/70 dark:border-darkBorder/40 shadow-premium dark:shadow-premium-dark space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-3.5">
            {/* From Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="block w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            {/* To Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="block w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Category selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Payment Mode selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="block w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {paymentModesList.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode === 'All' ? 'All Modes' : mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Min Amount */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Min Amount (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="block w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            {/* Max Amount */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Max Amount (₹)
              </label>
              <input
                type="number"
                placeholder="No max"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="block w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Reset Filters Trigger */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center gap-1 border border-slate-200/50 dark:border-darkBorder/30"
            >
              <RefreshCw className="h-3 w-3" />
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Data loading or empty render block */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-3">
            <Filter className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">No matches found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Try adjusting your search keywords, category filters, or select a different date range.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* 1. Bank-Style Narrative statement rows */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Narrative Logs
            </h3>
            <div className="space-y-2.5">
              {expenses.slice(0, 10).map((exp) => {
                const dateStr = new Date(exp.date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <div
                    key={exp._id}
                    className="p-3 bg-indigo-50/40 dark:bg-indigo-950/5 border border-indigo-100/30 dark:border-indigo-900/10 rounded-2xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    On <strong className="text-slate-900 dark:text-white font-semibold">{dateStr}</strong>,{' '}
                    <strong className="text-primary-600 dark:text-primary-400 font-bold">₹{exp.amount.toFixed(2)}</strong>{' '}
                    was spent in <span className="font-semibold text-slate-800 dark:text-slate-200">{exp.category}</span>.
                    {exp.remark && (
                      <span>
                        {' '}
                        Remark: <span className="italic text-slate-500 dark:text-slate-400">"{exp.remark}"</span>.
                      </span>
                    )}
                  </div>
                );
              })}
              {expenses.length > 10 && (
                <div className="text-center text-[10px] text-slate-400 font-medium italic pt-1">
                  Showing first 10 narrative lines...
                </div>
              )}
            </div>
          </div>

          {/* 2. Structured Data Grid Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Data Ledger Table
            </h3>
            
            <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-darkBorder/40 bg-white dark:bg-darkCard shadow-premium dark:shadow-premium-dark">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-darkBorder/40">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remark</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-darkBorder/30">
                  {expenses.map((exp) => (
                    <tr
                      key={exp._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-xs text-slate-700 dark:text-slate-350"
                    >
                      <td className="px-4 py-3 whitespace-nowrap font-medium">
                        {new Date(exp.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {exp.category}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white">
                        ₹{exp.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium">
                          {exp.paymentMode}
                        </span>
                      </td>
                      <td className="px-4 py-3 truncate max-w-[120px]" title={exp.remark}>
                        {exp.remark || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenAddSheet(exp)}
                            className="p-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Edit"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(exp)}
                            className="p-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-650 hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="text-[10px] text-slate-400 font-medium text-right px-2">
              Showing {expenses.length} transaction entries
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
