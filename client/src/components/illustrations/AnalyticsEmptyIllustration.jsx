import React from 'react';

const AnalyticsEmptyIllustration = ({ className = 'w-48 h-48' }) => {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="an-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="an-grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>

      {/* Decorative dots grid */}
      <circle cx="50" cy="50" r="1.5" fill="#cbd5e1" className="dark:fill-slate-800" />
      <circle cx="70" cy="50" r="1.5" fill="#cbd5e1" className="dark:fill-slate-800" />
      <circle cx="90" cy="50" r="1.5" fill="#cbd5e1" className="dark:fill-slate-800" />
      <circle cx="110" cy="50" r="1.5" fill="#cbd5e1" className="dark:fill-slate-800" />
      <circle cx="130" cy="50" r="1.5" fill="#cbd5e1" className="dark:fill-slate-800" />
      <circle cx="150" cy="50" r="1.5" fill="#cbd5e1" className="dark:fill-slate-800" />

      {/* Background circular frame */}
      <circle cx="100" cy="100" r="65" fill="#f8fafc" className="dark:fill-slate-900/30" />

      {/* Floating empty Pie/Donut Chart */}
      <circle cx="100" cy="100" r="38" stroke="#cbd5e1" strokeWidth="12" strokeDasharray="30 208" strokeLinecap="round" className="dark:stroke-slate-800" />
      <circle cx="100" cy="100" r="38" stroke="url(#an-grad-primary)" strokeWidth="12" strokeDasharray="95 143" strokeLinecap="round" />
      <circle cx="100" cy="100" r="38" stroke="url(#an-grad-emerald)" strokeWidth="12" strokeDasharray="60 178" strokeLinecap="round" />

      {/* Floating Sparkles and Line Graphs */}
      <path d="M50 145 L75 125 L100 135 L125 110 L150 125" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" strokeDasharray="4 4" className="dark:stroke-slate-700" />
      <circle cx="75" cy="125" r="3" fill="#cbd5e1" className="dark:fill-slate-800" />
      <circle cx="125" cy="110" r="3" fill="#cbd5e1" className="dark:fill-slate-800" />

      {/* Small floating tag */}
      <g transform="translate(130, 68)">
        <rect x="0" y="0" width="34" height="18" rx="9" fill="white" stroke="#e2e8f0" strokeWidth="1" className="dark:fill-slate-900 dark:stroke-slate-800" />
        <circle cx="9" cy="9" r="4.5" fill="#34d399" />
        <rect x="18" y="7" width="10" height="4" rx="2" fill="#e2e8f0" className="dark:fill-slate-800" />
      </g>
    </svg>
  );
};

export default AnalyticsEmptyIllustration;
