import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, Calendar, Tag, ChevronRight, TrendingUp, TrendingDown, RefreshCw, BarChart2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Calculator = ({ categories = [] }) => {
  const [category, setCategory] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    // Default to current month range
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    setFrom(`${year}-${month}-01`);
    setTo(`${year}-${month}-${day}`);
  }, []);

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();

    if (!from || !to) {
      toast.error('Both From and To dates are required');
      return;
    }

    if (new Date(from) > new Date(to)) {
      toast.error('From date cannot be after To date');
      return;
    }

    try {
      setLoading(true);
      const params = {
        from,
        to,
        category: category === 'All' ? 'All' : category,
      };

      const response = await api.get('/analytics/custom-total', { params });
      setResults(response.data);
      toast.success('Calculations computed successfully!');
    } catch (error) {
      console.error('Calculate error:', error);
      toast.error(error.response?.data?.message || 'Failed to compute custom total');
    } finally {
      setLoading(false);
    }
  };

  // Run calculation initially when dates are set
  useEffect(() => {
    if (from && to) {
      handleCalculate();
    }
  }, [from, to, category]);

  return (
    <div className="p-4 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
          Custom Calculator
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Detailed category statistics over time
        </p>
      </div>

      {/* Query selectors form card */}
      <div className="bg-white dark:bg-darkCard p-5 border border-slate-100 dark:border-darkBorder/40 rounded-3xl shadow-premium dark:shadow-premium-dark">
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            {/* From Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="block w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            {/* To Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="block w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Target Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              required
            >
              <option value="All" className="bg-white dark:bg-darkCard text-slate-900 dark:text-white">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name} className="bg-white dark:bg-darkCard text-slate-900 dark:text-white">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Compute Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Calculating...' : 'Recalculate Statistics'}
          </button>
        </form>
      </div>

      {/* Calculator Results Renders */}
      {results && (
        <div className="space-y-4 animate-fade-in">
          {results.totalEntries === 0 ? (
            <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
              <BarChart2 className="h-10 w-10 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">No entries for this selection</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                No expenses matched this category and date range. Try widening your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Primary Total Card */}
              <div className="bg-gradient-to-tr from-primary-600 to-indigo-500 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-y-3 translate-x-3 text-white/5 font-bold text-7xl select-none font-sans">
                  ₹
                </div>
                <span className="text-[10px] uppercase font-bold text-indigo-100 tracking-wider">
                  Total Spending
                </span>
                <h3 className="text-3xl font-extrabold mt-1 font-sans">
                  ₹{results.totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10 text-xs text-indigo-50">
                  <span>Entries Count: <strong>{results.totalEntries}</strong></span>
                  <span>Daily Avg: <strong>₹{results.averagePerDay.toLocaleString('en-IN')}</strong></span>
                </div>
              </div>

              {/* Peak & Low Entries Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Highest Expense */}
                {results.highestExpense && (
                  <div className="bg-white dark:bg-darkCard p-4 rounded-3xl border border-slate-100 dark:border-darkBorder/40 shadow-premium dark:shadow-premium-dark space-y-1 relative">
                    <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider mb-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Highest
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-sans">
                      ₹{results.highestExpense.amount.toLocaleString('en-IN')}
                    </h4>
                    <p className="text-[10px] text-slate-800 dark:text-slate-200 font-semibold truncate">
                      {results.highestExpense.category}
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">
                      {results.highestExpense.remark || 'No remark'}
                    </p>
                    <span className="text-[8px] text-slate-400 block pt-1 border-t border-slate-100 dark:border-darkBorder/20">
                      {new Date(results.highestExpense.date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Lowest Expense */}
                {results.lowestExpense && (
                  <div className="bg-white dark:bg-darkCard p-4 rounded-3xl border border-slate-100 dark:border-darkBorder/40 shadow-premium dark:shadow-premium-dark space-y-1 relative">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">
                      <TrendingDown className="h-3.5 w-3.5" />
                      Lowest
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-sans">
                      ₹{results.lowestExpense.amount.toLocaleString('en-IN')}
                    </h4>
                    <p className="text-[10px] text-slate-800 dark:text-slate-200 font-semibold truncate">
                      {results.lowestExpense.category}
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">
                      {results.lowestExpense.remark || 'No remark'}
                    </p>
                    <span className="text-[8px] text-slate-400 block pt-1 border-t border-slate-100 dark:border-darkBorder/20">
                      {new Date(results.lowestExpense.date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calculator;
