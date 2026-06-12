import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Info, Repeat, User } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AddExpenseSheet = ({ isOpen, onClose, onSave, expenseToEdit, categories = [] }) => {
  const [type, setType] = useState('expense'); // expense vs income
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [remark, setRemark] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [merchant, setMerchant] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('none');
  const [loading, setLoading] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  // Load user currency symbol
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
  }, [isOpen]);

  // Filter categories by type (expense or income)
  const filteredCategories = categories.filter((cat) => {
    const catType = cat.transactionType || 'expense';
    return catType === type;
  });

  // Initialize fields on open or edit change
  useEffect(() => {
    if (expenseToEdit) {
      setType(expenseToEdit.type || 'expense');
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      
      const expDate = new Date(expenseToEdit.date);
      const year = expDate.getFullYear();
      const month = String(expDate.getMonth() + 1).padStart(2, '0');
      const day = String(expDate.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      
      setRemark(expenseToEdit.remark || '');
      setPaymentMode(expenseToEdit.paymentMode || 'Cash');
      setMerchant(expenseToEdit.merchant || '');
      setTagsInput(Array.isArray(expenseToEdit.tags) ? expenseToEdit.tags.join(', ') : '');
      setIsRecurring(!!expenseToEdit.isRecurring);
      setRecurrenceFrequency(expenseToEdit.recurrenceFrequency || 'none');
    } else {
      setType('expense');
      setAmount('');
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      setRemark('');
      setPaymentMode('Cash');
      setMerchant('');
      setTagsInput('');
      setIsRecurring(false);
      setRecurrenceFrequency('none');
    }
  }, [expenseToEdit, isOpen]);

  // Set default category when list changes
  useEffect(() => {
    if (!expenseToEdit && filteredCategories.length > 0) {
      // Find matches or pick first
      const hasSelected = filteredCategories.some(c => c.name === category);
      if (!hasSelected) {
        setCategory(filteredCategories[0].name);
      }
    }
  }, [type, filteredCategories, expenseToEdit, category]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date) {
      toast.error('Date is required');
      return;
    }
    if (!category || category === '') {
      toast.error('Category is required');
      return;
    }
    if (!amount) {
      toast.error('Amount is required');
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }

    // Process tags
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    let nextDueDate = null;
    if (isRecurring && recurrenceFrequency !== 'none') {
      const d = new Date(date);
      if (recurrenceFrequency === 'daily') d.setDate(d.getDate() + 1);
      else if (recurrenceFrequency === 'weekly') d.setDate(d.getDate() + 7);
      else if (recurrenceFrequency === 'monthly') d.setMonth(d.getMonth() + 1);
      else if (recurrenceFrequency === 'yearly') d.setFullYear(d.getFullYear() + 1);
      nextDueDate = d;
    }

    try {
      setLoading(true);
      const payload = {
        type,
        date,
        category,
        amount: parsedAmount,
        remark,
        paymentMode,
        merchant,
        tags,
        isRecurring,
        recurrenceFrequency: isRecurring ? recurrenceFrequency : 'none',
        nextDueDate
      };

      if (expenseToEdit) {
        const res = await api.put(`/transactions/${expenseToEdit._id}`, payload);
        toast.success('Transaction updated successfully');
        
        const budgetStatus = res.data.budgetStatus;
        if (budgetStatus && budgetStatus.overall.exceeded) {
          toast.error(`Exceeded overall monthly budget limit! Limit: ${currencySymbol}${budgetStatus.overall.limit}`);
        }
      } else {
        const res = await api.post('/transactions', payload);
        toast.success('Transaction logged successfully');
        
        const budgetStatus = res.data.budgetStatus;
        if (budgetStatus) {
          if (budgetStatus.overall.exceeded) {
            toast.error(`Exceeded overall monthly budget limit! Limit: ${currencySymbol}${budgetStatus.overall.limit}`);
          } else if (budgetStatus.overall.warning) {
            toast.custom((t) => (
              <div className="bg-amber-50 dark:bg-slate-900 border border-amber-300 dark:border-slate-800 rounded-2xl p-3.5 shadow-lg flex gap-2.5 text-amber-800 dark:text-amber-400 text-xs font-semibold">
                <span className="text-base">⚠️</span>
                <div>
                  <p className="font-bold">Budget Warning!</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">You have crossed 80% of your overall monthly budget limit.</p>
                </div>
              </div>
            ), { duration: 4500 });
          }
        }
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Submit transaction error:', error);
      toast.error(error.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const paymentModes = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Wallet', 'Other'];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-darkCard rounded-t-[32px] border-t border-slate-100 dark:border-darkBorder shadow-2xl p-5 pb-8 animate-slide-up max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col justify-between">
        
        {/* Visual Drag Handle Indicator */}
        <div className="mx-auto w-16 h-1.5 bg-slate-300 dark:bg-slate-650 rounded-full mb-3.5 cursor-pointer" onClick={onClose} />
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight font-sans">
            {expenseToEdit ? 'Edit Transaction' : 'Log New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Transaction Type Segmented Control */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/50 dark:border-darkBorder/25 mb-4 shrink-0">
          <button
            type="button"
            onClick={() => { setType('expense'); setCategory(''); }}
            className={`h-11 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center ${
              type === 'expense'
                ? 'bg-white dark:bg-darkCard text-rose-600 dark:text-rose-455 shadow-sm border border-slate-200/30 dark:border-darkBorder/10'
                : 'text-slate-550 dark:text-slate-400'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => { setType('income'); setCategory(''); }}
            className={`h-11 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center ${
              type === 'income'
                ? 'bg-white dark:bg-darkCard text-emerald-600 dark:text-emerald-455 shadow-sm border border-slate-200/30 dark:border-darkBorder/10'
                : 'text-slate-550 dark:text-slate-400'
            }`}
          >
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pb-6">
          
          {/* Amount input */}
          <div className="bg-slate-50/60 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-150/40 dark:border-darkBorder/30">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                Enter Amount
              </span>
              <div className="flex items-center justify-center font-sans">
                <span className="text-2xl font-black text-slate-450 dark:text-slate-500 mr-1.5">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-48 text-center text-3xl font-black text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 focus:border-none focus:outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                  autoFocus={!expenseToEdit}
                />
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-455 uppercase tracking-widest mb-1.5">
              Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full pl-10 pr-4 h-12 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/85 dark:border-darkBorder/60 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                required
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-455 uppercase tracking-widest mb-1.5">
              Category
            </label>
            {filteredCategories.length === 0 ? (
              <p className="text-[10px] text-slate-450 font-bold p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">No categories configured. Go to Profile & Settings to add one.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto no-scrollbar border border-slate-100 dark:border-darkBorder/20 rounded-2xl p-2 bg-slate-50/20 dark:bg-slate-900/20">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`h-[56px] px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 border ${
                      category === cat.name
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm scale-102 font-bold'
                        : 'bg-white border-slate-200/50 dark:bg-darkCard dark:border-darkBorder/40 text-slate-600 dark:text-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">{cat.icon || '🏷️'}</span>
                    <span className="text-[8px] font-extrabold truncate w-full text-center leading-none">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Mode Selector */}
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-455 uppercase tracking-widest mb-1.5">
              Payment Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-darkBorder/30">
              {paymentModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`h-11 rounded-xl text-[9px] font-bold transition-all duration-200 active:scale-95 flex items-center justify-center ${
                    paymentMode === mode
                      ? 'bg-white dark:bg-darkCard text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-darkBorder/20'
                      : 'text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Merchant and Tags Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-455 uppercase tracking-widest mb-1.5">
                Merchant / Payee
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-3.5 w-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="Uber, Zomato, etc."
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="block w-full pl-9 pr-3 h-12 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-[11px] font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-455 uppercase tracking-widest mb-1.5">
                Tags (Comma Separated)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Tag className="h-3.5 w-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="office, trip, food"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="block w-full pl-9 pr-3 h-12 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-[11px] font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Remark Input */}
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-455 uppercase tracking-widest mb-1.5">
              Remark / Note
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Info className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Details of transaction..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="block w-full pl-10 pr-4 h-12 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
            </div>
          </div>

          {/* Recurring Transaction Toggle */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/45 rounded-2xl border border-slate-150/40 dark:border-darkBorder/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Repeat className="h-4 w-4 text-indigo-500" />
                Recurring Payment?
              </span>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4.5 w-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
            </div>

            {isRecurring && (
              <div className="space-y-1">
                <label className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Select Frequency
                </label>
                <select
                  value={recurrenceFrequency}
                  onChange={(e) => setRecurrenceFrequency(e.target.value)}
                  className="w-full h-11 px-2.5 bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-705 dark:text-slate-350 focus:outline-none"
                >
                  <option value="none">-- Select frequency --</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-extrabold rounded-2xl shadow-sm active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none text-xs uppercase tracking-widest flex items-center justify-center"
          >
            {loading ? 'Saving...' : expenseToEdit ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseSheet;
