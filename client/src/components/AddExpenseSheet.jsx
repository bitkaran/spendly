import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Info, IndianRupee } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AddExpenseSheet = ({ isOpen, onClose, onSave, expenseToEdit, categories = [] }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [remark, setRemark] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [loading, setLoading] = useState(false);

  // Initialize fields on open or edit change
  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      // Format Date object to YYYY-MM-DD
      const expDate = new Date(expenseToEdit.date);
      const year = expDate.getFullYear();
      const month = String(expDate.getMonth() + 1).padStart(2, '0');
      const day = String(expDate.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      setRemark(expenseToEdit.remark || '');
      setPaymentMode(expenseToEdit.paymentMode || 'Cash');
    } else {
      // Defaults for new expense
      setAmount('');
      setCategory(categories[0]?.name || '');
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      setRemark('');
      setPaymentMode('Cash');
    }
  }, [expenseToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
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

    try {
      setLoading(true);
      const payload = {
        date,
        category,
        amount: parsedAmount,
        remark,
        paymentMode,
      };

      if (expenseToEdit) {
        await api.put(`/expenses/${expenseToEdit._id}`, payload);
        toast.success('Expense updated successfully');
      } else {
        await api.post('/expenses', payload);
        toast.success('Expense added successfully');
      }
      onSave(); // Rerender page
      onClose(); // Hide sheet
    } catch (error) {
      console.error('Submit expense error:', error);
      toast.error(error.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const paymentModes = ['Cash', 'UPI', 'Card', 'Other'];

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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Tap outside container to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-darkCard rounded-t-[32px] border-t border-slate-100 dark:border-darkBorder shadow-2xl p-5 pb-8 animate-slide-up max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col justify-between">
        
        {/* Pull Indicator Bar */}
        <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-3.5 cursor-pointer" onClick={onClose} />
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight font-sans">
            {expenseToEdit ? 'Edit Expense Record' : 'Create Expense Entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Prominent Large Calculator Amount Input */}
          <div className="bg-slate-50/60 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-150/40 dark:border-darkBorder/30">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                Enter Amount
              </span>
              <div className="flex items-center justify-center font-sans">
                <span className="text-2xl font-black text-slate-400 dark:text-slate-500 mr-1.5">₹</span>
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
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-450 uppercase tracking-widest mb-2">
              Select Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                required
              />
            </div>
          </div>

          {/* Category Icon Grid Selector */}
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-450 uppercase tracking-widest mb-2">
              Select Category
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-[170px] overflow-y-auto no-scrollbar border border-slate-100 dark:border-darkBorder/20 rounded-2xl p-2.5 bg-slate-50/20 dark:bg-slate-900/20">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 border ${
                    category === cat.name
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm scale-102 font-bold'
                      : 'bg-white border-slate-200/50 dark:bg-darkCard dark:border-darkBorder/40 text-slate-600 dark:text-slate-350 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">{getCategoryIcon(cat.name)}</span>
                  <span className="text-[8px] font-extrabold truncate w-full text-center leading-none">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Mode Segmented Control */}
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-450 uppercase tracking-widest mb-2">
              Payment Mode
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-darkBorder/30">
              {paymentModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 rounded-xl text-[10px] font-extrabold transition-all duration-200 active:scale-95 ${
                    paymentMode === mode
                      ? 'bg-white dark:bg-darkCard text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-darkBorder/20'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Remark Input */}
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-450 uppercase tracking-widest mb-2">
              Remark / Note (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Info className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. Metro fare, Lunch at office"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
            </div>
          </div>

          {/* Submit Fixed Save button at bottom */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-extrabold rounded-2xl shadow-sm active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none text-[10px] uppercase tracking-widest"
          >
            {loading ? 'Saving Changes...' : expenseToEdit ? 'Update Expense' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseSheet;
