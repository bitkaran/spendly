import React from 'react';

const DashboardEmptyIllustration = ({ className = 'w-48 h-48' }) => {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="db-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="db-grad-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="db-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <dropShadow dx="0" dy="8" stdDeviation="6" floodColor="#4f46e5" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Floating Sparkles */}
      <path d="M40 30 L43 36 L49 37 L44 42 L45 48 L40 45 L35 48 L36 42 L31 37 L37 36 Z" fill="#e0e7ff" opacity="0.6" />
      <path d="M160 50 L162 54 L167 55 L163 59 L164 64 L160 61 L156 64 L157 59 L153 55 L158 54 Z" fill="#d1fae5" opacity="0.6" />

      {/* Dashed Background Circles */}
      <circle cx="100" cy="105" r="75" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6 6" className="dark:stroke-slate-800" />
      <circle cx="100" cy="105" r="55" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="4 4" className="dark:stroke-slate-900" />

      {/* Main Glassmorphic Card silhouette */}
      <rect x="50" y="75" width="100" height="65" rx="16" fill="white" stroke="#e2e8f0" strokeWidth="2" filter="url(#db-shadow)" className="dark:fill-slate-900 dark:stroke-slate-800" />
      
      {/* Accent Card Header Banner */}
      <rect x="50" y="75" width="100" height="24" rx="16" fill="url(#db-grad-primary)" />
      {/* Hide lower rounded corners of top banner */}
      <rect x="50" y="85" width="100" height="14" fill="url(#db-grad-primary)" />

      {/* Inner Card Details */}
      <circle cx="70" cy="87" r="5" fill="white" opacity="0.8" />
      <rect x="82" y="84" width="36" height="6" rx="3" fill="white" opacity="0.8" />
      
      {/* Bottom Card details */}
      <rect x="65" y="112" width="45" height="7" rx="3.5" fill="#94a3b8" opacity="0.3" className="dark:fill-slate-700" />
      <rect x="65" y="124" width="30" height="6" rx="3" fill="#94a3b8" opacity="0.2" className="dark:fill-slate-700" />

      {/* Floating Plus Sign Button Badge */}
      <g transform="translate(115, 110)" filter="url(#db-shadow)">
        <circle cx="16" cy="16" r="20" fill="url(#db-grad-accent)" />
        <path d="M16 10 L16 22 M10 16 L22 16" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default DashboardEmptyIllustration;
