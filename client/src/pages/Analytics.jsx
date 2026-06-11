import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'];

// Mock ResizeObserver for headless browser testing environments (e.g. Playwright, Puppeteer)
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const Analytics = ({ triggerRerender }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [triggerRerender]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [categoryRes, monthlyRes, expensesRes] = await Promise.all([
        api.get('/analytics/category-total'),
        api.get('/analytics/monthly'),
        api.get('/expenses') // Fetch last expenses to compute travel vs food and daily trends
      ]);

      setCategoryData(categoryRes.data);
      setMonthlyData(monthlyRes.data);

      const allExpenses = expensesRes.data;

      // 1. Travel vs Food vs Other Grouping
      let travelTotal = 0;
      let foodTotal = 0;
      let otherTotal = 0;

      allExpenses.forEach((exp) => {
        const cat = exp.category.toLowerCase();
        if (
          cat.includes('auto') ||
          cat.includes('metro') ||
          cat.includes('travel') ||
          cat.includes('cab') ||
          cat.includes('coming') ||
          cat.includes('return')
        ) {
          travelTotal += exp.amount;
        } else if (
          cat.includes('lunch') ||
          cat.includes('dinner') ||
          cat.includes('snack') ||
          cat.includes('tea') ||
          cat.includes('food') ||
          cat.includes('cafeteria')
        ) {
          foodTotal += exp.amount;
        } else {
          otherTotal += exp.amount;
        }
      });

      setComparisonData([
        { name: 'Travel', amount: travelTotal, fill: '#3b82f6' },
        { name: 'Food', amount: foodTotal, fill: '#10b981' },
        { name: 'Other', amount: otherTotal, fill: '#f59e0b' },
      ]);

      // 2. Daily spending trend (last 10 days with expenses, chronological)
      const sortedExpenses = [...allExpenses].sort((a, b) => new Date(a.date) - new Date(b.date));
      const dailyTrendList = [];
      const dailyMap = {};

      sortedExpenses.forEach((exp) => {
        if (!exp.date) return;
        const dateObj = new Date(exp.date);
        const dayStr = dateObj.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' });
        
        if (!dailyMap[dayStr]) {
          dailyMap[dayStr] = 0;
          dailyTrendList.push(dayStr);
        }
        dailyMap[dayStr] += exp.amount;
      });

      const dailyTrend = dailyTrendList.map((day) => ({
        day,
        amount: dailyMap[day],
      })).slice(-10);

      setDailyData(dailyTrend);
    } catch (error) {
      console.error('Fetch analytics error:', error);
      toast.error('Failed to load charts statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const isDataEmpty = categoryData.length === 0 && monthlyData.every((m) => m.total === 0);

  if (isDataEmpty) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[70vh]">
        <div className="h-14 w-14 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-3">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Analytics Available</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
          Please log some expenses to see visual spending patterns, categorical distributions, and daily trends.
        </p>
      </div>
    );
  }

  // Custom tooltips for nice mobile layout
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-700/30 p-2.5 rounded-xl shadow-lg text-xs">
          <p className="font-semibold text-slate-300">{payload[0].name || payload[0].payload.day || payload[0].payload.month}</p>
          <p className="font-bold text-white mt-0.5">₹{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Headings */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
          Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Visual spending breakdowns & trends
        </p>
      </div>

      {/* Doughnut Chart: Category Share */}
      {categoryData.length > 0 && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-4 border border-slate-100 dark:border-darkBorder/40 shadow-premium dark:shadow-premium-dark">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="h-4.5 w-4.5 text-primary-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Category Distribution
            </h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bar Chart: Travel vs Food vs Other */}
      {comparisonData.some(item => item.amount > 0) && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-4 border border-slate-100 dark:border-darkBorder/40 shadow-premium dark:shadow-premium-dark">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4.5 w-4.5 text-primary-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Travel vs Food vs Other
            </h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Area Chart: Daily Trend */}
      {dailyData.length > 0 && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-4 border border-slate-100 dark:border-darkBorder/40 shadow-premium dark:shadow-premium-dark">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4.5 w-4.5 text-primary-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Daily Spending Trend
            </h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bar Chart: Monthly History */}
      {monthlyData.some(m => m.total > 0) && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-4 border border-slate-100 dark:border-darkBorder/40 shadow-premium dark:shadow-premium-dark">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4.5 w-4.5 text-primary-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Monthly Trend
            </h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                <Bar dataKey="total" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
