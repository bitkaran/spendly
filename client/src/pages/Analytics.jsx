import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AnalyticsEmptyIllustration from '../components/illustrations/AnalyticsEmptyIllustration';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'];

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
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  // Insights State
  const [highestCategory, setHighestCategory] = useState({ name: '-', value: 0 });
  const [averageDailySpend, setAverageDailySpend] = useState(0);
  const [netBalance, setNetBalance] = useState(0);

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
    fetchAnalyticsData();
  }, [triggerRerender]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [categoryRes, monthlyRes, summaryRes, transactionsRes] = await Promise.all([
        api.get('/analytics/category-total?type=expense'),
        api.get('/analytics/monthly'),
        api.get('/analytics/summary'),
        api.get('/transactions')
      ]);

      setCategoryData(categoryRes.data);
      setMonthlyData(monthlyRes.data);
      
      const summary = summaryRes.data;
      setNetBalance(summary.netBalance || 0);
      setAverageDailySpend(summary.averageDailySpend || 0);
      
      if (categoryRes.data.length > 0) {
        const sortedCats = [...categoryRes.data].sort((a, b) => b.value - a.value);
        setHighestCategory({ name: sortedCats[0].name, value: sortedCats[0].value });
      }

      // Compute Daily spending trend (Expenses only)
      const allTx = transactionsRes.data || [];
      const expensesOnly = allTx.filter(t => t.type === 'expense').sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const dailyTrendList = [];
      const dailyMap = {};

      expensesOnly.forEach((tx) => {
        if (!tx.date) return;
        const dateObj = new Date(tx.date);
        const dayStr = dateObj.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' });
        
        if (!dailyMap[dayStr]) {
          dailyMap[dayStr] = 0;
          dailyTrendList.push(dayStr);
        }
        dailyMap[dayStr] += tx.amount;
      });

      const dailyTrend = dailyTrendList.map((day) => ({
        day,
        amount: dailyMap[day],
      })).slice(-10); // Show last 10 days of spending

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
      <div className="p-4 space-y-6 animate-pulse bg-slate-50 dark:bg-darkBg min-h-full">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const isDataEmpty = categoryData.length === 0 && monthlyData.every((m) => m.expense === 0 && m.income === 0);

  if (isDataEmpty) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[70vh] bg-slate-50 dark:bg-darkBg">
        <div className="flex items-center justify-center mb-1 shrink-0">
          <AnalyticsEmptyIllustration className="w-36 h-36" />
        </div>
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">No Analytics Available</h3>
        <p className="text-[10px] text-slate-455 dark:text-slate-450 mt-1 max-w-xs leading-relaxed">
          Log some transactions (expenses or income) to display categorical shares and historical trends.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-sm border border-slate-700/25 p-2.5 rounded-xl shadow-lg text-[9px] text-white">
          <p className="font-extrabold text-slate-350">{payload[0].name || payload[0].payload.day || payload[0].payload.month}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="font-black mt-0.5" style={{ color: p.color || '#fff' }}>
              {p.name}: {currencySymbol}{p.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
      <div className="grid grid-cols-3 gap-2 bg-white dark:bg-darkCard p-3 rounded-3xl border border-slate-100 dark:border-darkBorder/35 shadow-sm text-center font-bold">
        <div className="space-y-0.5 border-r border-slate-100 dark:border-darkBorder/25">
          <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Avg Daily Spend</span>
          <span className="text-xs font-black text-rose-600 dark:text-rose-450 block">{currencySymbol}{averageDailySpend}</span>
        </div>
        <div className="space-y-0.5 border-r border-slate-100 dark:border-darkBorder/25">
          <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Top Category</span>
          <span className="text-xs font-black text-slate-900 dark:text-white truncate block max-w-full px-1">{highestCategory.name || '-'}</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Net Savings</span>
          <span className={`text-xs font-black block truncate ${netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-650'}`}>
            {netBalance >= 0 ? '+' : ''}{currencySymbol}{netBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Doughnut Chart: Category Share */}
      {categoryData.length > 0 && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-4.5 border border-slate-100 dark:border-darkBorder/40 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <PieIcon className="h-4 w-4 text-primary-500" />
            <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
              Expenses by Category
            </h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
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

      {/* Area Chart: Daily Trend (Expenses) */}
      {dailyData.length > 0 && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-4.5 border border-slate-100 dark:border-darkBorder/40 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
              Daily Spending Trend (Last 10 Days)
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
                <Area type="monotone" dataKey="amount" name="Spent" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bar Chart: Monthly History (Income vs Expenses) */}
      {monthlyData.some(m => m.expense > 0 || m.income > 0) && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-4.5 border border-slate-100 dark:border-darkBorder/40 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary-500" />
            <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
              Income vs Expenses History
            </h3>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="month" stroke={textStroke} fontSize={8} fontWeight={700} tickLine={false} />
                <YAxis stroke={textStroke} fontSize={8} fontWeight={700} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.03)' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ee5253" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
