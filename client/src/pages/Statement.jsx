import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, Calendar, Tag, RefreshCw, Trash2, Edit2, X, PlusCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import StatementEmptyIllustration from '../components/illustrations/StatementEmptyIllustration';

const Statement = ({ onOpenAddSheet, triggerRerender, categories = [] }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  // Filters State
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('All');
  const [paymentMode, setPaymentMode] = useState('All');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All'); // 'All', 'expense', 'income'

  // Delete State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);

  // Load User Currency
  useEffect(() => {
    const savedUser = localStorage.getItem('spendly_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.currencySymbol) setCurrencySymbol(u.currencySymbol);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [from, to, category, paymentMode, minAmount, maxAmount, search, type, triggerRerender]);

  const fetchTransactions = async () => {
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
      if (type && type !== 'All') params.type = type;

      const response = await api.get('/transactions', { params });
      setTransactions(response.data);
    } catch (error) {
      console.error('Fetch statement error:', error);
      toast.error('Failed to load statement transactions');
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
    setType('All');
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
      if (type && type !== 'All') params.type = type;

      const response = await api.get('/export/excel', {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      link.setAttribute('download', `spendly-statement-${year}-${month}.xlsx`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Excel exported successfully!', { id: 'excel-export' });
    } catch (err) {
      console.error('Export excel error:', err);
      toast.error('Failed to export statement', { id: 'excel-export' });
    }
  };

  const handleExportCSV = () => {
    try {
      if (transactions.length === 0) {
        toast.error('No transactions to export');
        return;
      }
      
      const headers = ['Date', 'Type', 'Category', 'Amount', 'Remark', 'Payment Mode', 'Merchant', 'Tags'];
      const rows = transactions.map((tx) => [
        new Date(tx.date).toLocaleDateString('en-IN'),
        tx.type ? tx.type.toUpperCase() : 'EXPENSE',
        tx.category,
        tx.amount,
        tx.remark || '',
        tx.paymentMode,
        tx.merchant || '',
        Array.isArray(tx.tags) ? tx.tags.join('; ') : ''
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `spendly-statement-${new Date().toISOString().slice(0, 7)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV statement downloaded!');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    }
  };

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
      fetchTransactions();
    } catch (err) {
      console.error('Delete transaction error:', err);
      toast.error('Failed to delete transaction');
    }
  };

  const paymentModesList = ['All', 'Cash', 'UPI', 'Card', 'Bank Transfer', 'Wallet', 'Other'];

  const getCategoryDetails = (catName) => {
    if (!catName) return { icon: '🏷️', color: '#8395a7' };
    const found = categories.find((c) => c.name && c.name.toLowerCase() === catName.toLowerCase());
    if (found) {
      return {
        icon: found.icon || '🏷️',
        color: found.color || '#8395a7',
      };
    }
    return { icon: '🏷️', color: '#8395a7' };
  };

  // Calculate totals for filtered subset
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="p-4 space-y-5 bg-slate-50 dark:bg-darkBg transition-colors duration-300 min-h-full pb-8">
      
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
            Statement
          </h2>
          <p className="text-[10px] text-slate-455 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">
            Your Finance Ledger
          </p>
        </div>
        
        <div className="flex gap-1.5">
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-300 disabled:opacity-50 font-bold rounded-xl flex items-center gap-1 transition-all text-[9px] uppercase tracking-wider"
          >
            CSV
          </button>
          <button
            onClick={handleExportExcel}
            disabled={transactions.length === 0}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-405 dark:disabled:text-slate-605 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all text-[9px] uppercase tracking-wider active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            Excel
          </button>
        </div>
      </div>

      {/* Ledger Net Sheet */}
      <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-4.5 shadow-sm grid grid-cols-3 gap-2 divide-x divide-slate-100 dark:divide-darkBorder/30">
        <div className="space-y-0.5 pl-1">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Filtered In</span>
          <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-sans truncate">
            {currencySymbol}{totalIncome.toLocaleString()}
          </h4>
        </div>
        <div className="space-y-0.5 pl-3">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Filtered Out</span>
          <h4 className="text-xs font-black text-rose-600 dark:text-rose-400 font-sans truncate">
            {currencySymbol}{totalExpenses.toLocaleString()}
          </h4>
        </div>
        <div className="space-y-0.5 pl-3">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Net balance</span>
          <h4 className={`text-xs font-black font-sans truncate ${netBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-650'}`}>
            {netBalance >= 0 ? '+' : ''}{currencySymbol}{netBalance.toLocaleString()}
          </h4>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450 dark:text-slate-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search notes, merchants, tags..."
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

      {/* Quick Category Filter Pills */}
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
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm'
                  : 'bg-white border-slate-100 dark:bg-darkCard dark:border-darkBorder/40 text-slate-500 dark:text-slate-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Quick Payment Mode Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 border-b border-slate-250/20 dark:border-darkBorder/25 pb-2.5">
          <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">Mode:</span>
          {paymentModesList.map((mode) => (
            <button
              key={mode}
              onClick={() => setPaymentMode(mode)}
              className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold border whitespace-nowrap transition-all ${
                paymentMode === mode
                  ? 'bg-indigo-650 border-indigo-650 text-white dark:bg-indigo-500 dark:border-indigo-500 shadow-sm'
                  : 'bg-white border-slate-100 dark:bg-darkCard dark:border-darkBorder/40 text-slate-500 dark:text-slate-400'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table Layout */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="flex items-center justify-center mb-1 shrink-0">
            <StatementEmptyIllustration className="w-36 h-36" />
          </div>
          <p className="text-xs font-black text-slate-900 dark:text-white">No ledger matches</p>
          <p className="text-[10px] text-slate-455 dark:text-slate-450 mt-1 max-w-xs leading-relaxed">
            Adjust filters or write another search keyword to query your transactions history.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {transactions.map((tx) => {
            const catDetails = getCategoryDetails(tx.category);
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx._id}
                className="bg-white dark:bg-darkCard p-3 rounded-2xl border border-slate-100 dark:border-darkBorder/30 shadow-sm flex items-center justify-between hover:scale-[1.002] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm animate-pulse-slow"
                    style={{ backgroundColor: `${catDetails.color}15`, color: catDetails.color }}
                  >
                    {catDetails.icon}
                  </div>
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
                        <span className="text-[8px] text-slate-500 font-bold max-w-[80px] truncate">
                          @{tx.merchant}
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

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black font-sans mr-1.5 ${
                    isIncome ? 'text-emerald-650 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {isIncome ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
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

      {/* Expanded filters Bottom Sheet Drawer */}
      {showFiltersSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setShowFiltersSheet(false)} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-darkCard rounded-t-[32px] border-t border-slate-100 dark:border-darkBorder shadow-2xl p-5 pb-8 animate-slide-up max-h-[85vh] overflow-y-auto no-scrollbar">
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
              {/* Transaction Type Filter */}
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-455 uppercase tracking-widest mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-darkBorder/35">
                  {['All', 'expense', 'income'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-1.5 rounded-xl text-[10px] font-extrabold capitalize transition ${
                        type === t
                          ? 'bg-white dark:bg-darkCard text-slate-900 dark:text-white shadow-sm border border-slate-100/50 dark:border-darkBorder/20'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {t === 'All' ? 'All' : t === 'expense' ? 'Expenses Only' : 'Income Only'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-450 uppercase tracking-widest mb-1.5">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="block w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-455 uppercase tracking-widest mb-1.5">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="block w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white focus:outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Amount Bounds */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-455 uppercase tracking-widest mb-1.5">
                    Min Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="block w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-455 uppercase tracking-widest mb-1.5">
                    Max Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="block w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white focus:outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-3">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-3 border border-slate-250/50 dark:border-darkBorder/40 rounded-2xl text-xs font-extrabold text-slate-600 dark:text-slate-350 hover:bg-slate-50/50 transition flex items-center justify-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset Filters
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

export default Statement;
