import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'];

// Mock ResizeObserver for headless browser testing environments
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const Analytics = ({ triggerRerender, darkMode }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Insights Metrics State
  const [highestCategory, setHighestCategory] = useState({ name: '-', value: 0 });
  const [averageDailySpend, setAverageDailySpend] = useState(0);
  const [travelFoodRatio, setTravelFoodRatio] = useState('N/A');

  useEffect(() => {
    fetchAnalyticsData();
  }, [triggerRerender]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [categoryRes, monthlyRes, expensesRes] = await Promise.all([
        api.get('/analytics/category-total'),
        api.get('/analytics/monthly'),
        api.get('/expenses')
      ]);

      const catData = categoryRes.data;
      setCategoryData(catData);
      setMonthlyData(monthlyRes.data);

      const allExpenses = expensesRes.data;

      // 1. Calculate Highest Category
      if (catData.length > 0) {
        const sortedCats = [...catData].sort((a, b) => b.value - a.value);
        setHighestCategory({ name: sortedCats[0].name, value: sortedCats[0].value });
      }

      // 2. Travel vs Food vs Other Grouping
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

      // 3. Compute Travel vs Food Ratio
      if (foodTotal > 0 && travelTotal > 0) {
        const ratio = (travelTotal / foodTotal).toFixed(1);
        setTravelFoodRatio(`${ratio} : 1.0`);
      } else if (travelTotal > 0 && foodTotal === 0) {
        setTravelFoodRatio('1.0 : 0.0');
      } else if (foodTotal > 0 && travelTotal === 0) {
        setTravelFoodRatio('0.0 : 1.0');
      } else {
        setTravelFoodRatio('N/A');
      }

      // 4. Daily spending trend and Average Daily Spend
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

      // Compute average daily spend (total spent over active days)
      const totalDays = dailyTrendList.length;
      if (totalDays > 0) {
        const totalSpent = allExpenses.reduce((sum, e) => sum + e.amount, 0);
        setAverageDailySpend(Math.round(totalSpent / totalDays));
      } else {
        setAverageDailySpend(0);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
      toast.error('Failed to load charts statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6 animate-pulse bg-slate-50 dark:bg-darkBg min-h-full">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const isDataEmpty = categoryData.length === 0 && monthlyData.every((m) => m.total === 0);

  if (isDataEmpty) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[70vh] bg-slate-50 dark:bg-darkBg">
        <div className="h-14 w-14 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 rounded-2xl flex items-center justify-center mb-3">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">No Analytics Available</h3>
        <p className="text-[10px] text-slate-455 dark:text-slate-450 mt-1 max-w-xs leading-relaxed">
          Please record some expense logs to see visual spending patterns, categorical distributions, and daily trends.
        </p>
      </div>
    );
  }

  // Custom tooltips for nice mobile layout
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-sm border border-slate-700/25 p-2 rounded-xl shadow-lg text-[10px] text-white">
          <p className="font-extrabold text-slate-350">{payload[0].name || payload[0].payload.day || payload[0].payload.month}</p>
          <p className="font-black mt-0.5">₹{payload[0].value.toLocaleString('en-IN')}</p>
        </div>
      );
    }
    return null;
  };

  // Theme-aware color parameters
  const gridStroke = darkMode ? '#1e293b' : '#f1f5f9';
  const textStroke = darkMode ? '#64748b' : '#94a3b8';

  return (
    <div className="p-4 space-y-5 bg-slate-50 dark:bg-darkBg transition-colors duration-300 min-h-full pb-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
          Analytics
        </h2>
        <p className="text-[10px] text-slate-455 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">
          Spending Breakdowns & Trends
        </p>
      </div>

      {/* Spending Insights Cards */}
      <div className="grid grid-cols-3 gap-2 bg-white dark:bg-darkCard p-3 rounded-3xl border border-slate-100 dark:border-darkBorder/35 shadow-sm text-center">
        <div className="space-y-0.5 border-r border-slate-100 dark:border-darkBorder/25">
          <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Avg Daily</span>
          <span className="text-sm font-black text-slate-900 dark:text-white font-sans block">₹{averageDailySpend}</span>
        </div>
        <div className="space-y-0.5 border-r border-slate-100 dark:border-darkBorder/25">
          <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Top Category</span>
          <span className="text-xs font-black text-slate-900 dark:text-white truncate block max-w-full px-1">{highestCategory.name || '-'}</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Travel : Food</span>
          <span className="text-sm font-black text-slate-900 dark:text-white font-sans block">{travelFoodRatio}</span>
        </div>
      </div>

      {/* Doughnut Chart: Category Share */}
      {categoryData.length > 0 && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-4.5 border border-slate-100 dark:border-darkBorder/40 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <PieIcon className="h-4 w-4 text-primary-500" />
            <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
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
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 9, fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Area Chart: Daily Trend */}
      {dailyData.length > 0 && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-4.5 border border-slate-100 dark:border-darkBorder/40 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
              Daily Spending Trend
            </h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="day" stroke={textStroke} fontSize={8} fontWeight={700} tickLine={false} />
                <YAxis stroke={textStroke} fontSize={8} fontWeight={700} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bar Chart: Travel vs Food vs Other */}
      {comparisonData.some(item => item.amount > 0) && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-4.5 border border-slate-100 dark:border-darkBorder/40 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary-500" />
            <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
              Budget Category Comparison
            </h3>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="name" stroke={textStroke} fontSize={8} fontWeight={700} tickLine={false} />
                <YAxis stroke={textStroke} fontSize={8} fontWeight={700} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.03)' }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bar Chart: Monthly History */}
      {monthlyData.some(m => m.total > 0) && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-4.5 border border-slate-100 dark:border-darkBorder/40 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary-500" />
            <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
              Monthly Trend History
            </h3>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="month" stroke={textStroke} fontSize={8} fontWeight={700} tickLine={false} />
                <YAxis stroke={textStroke} fontSize={8} fontWeight={700} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.03)' }} />
                <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
