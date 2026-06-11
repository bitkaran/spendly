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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Tap outside container to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-darkCard rounded-t-3xl border-t border-slate-100 dark:border-darkBorder shadow-2xl p-6 pb-8 animate-slide-up max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Pull Indicator Bar */}
        <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4 cursor-pointer" onClick={onClose} />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
            {expenseToEdit ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Amount (₹)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <IndianRupee className="h-5 w-5" />
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                required
                autoFocus={!expenseToEdit}
              />
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Calendar className="h-5 w-5" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                required
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Tag className="h-5 w-5" />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition appearance-none"
                required
              >
                <option value="" disabled>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Mode Selector (Segmented buttons) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Payment Mode
            </label>
            <div className="grid grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200/40 dark:border-darkBorder/30">
              {paymentModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    paymentMode === mode
                      ? 'bg-white dark:bg-darkCard text-primary-600 dark:text-primary-400 shadow-sm border border-slate-100 dark:border-darkBorder/20'
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
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Remark / Note (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Info className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="e.g. Metro ride to sector 62, Auto fare"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-tr from-primary-600 to-indigo-500 hover:from-primary-500 hover:to-indigo-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            {loading ? 'Processing...' : expenseToEdit ? 'Update Expense' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseSheet;
