import React from 'react';

const StatementEmptyIllustration = ({ className = 'w-48 h-48' }) => {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="st-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <filter id="st-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <dropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.06" />
        </filter>
      </defs>

      {/* Background circles */}
      <circle cx="100" cy="100" r="70" fill="#f8fafc" className="dark:fill-slate-900/40" />
      <circle cx="100" cy="100" r="50" stroke="#f1f5f9" strokeWidth="2" className="dark:stroke-slate-900" />

      {/* Styled Checklist/Statement Document */}
      <g filter="url(#st-shadow)">
        <rect x="65" y="55" width="70" height="90" rx="12" fill="white" stroke="#e2e8f0" strokeWidth="1.5" className="dark:fill-slate-900 dark:stroke-slate-800" />
      </g>

      {/* Folder Tab Detail */}
      <rect x="75" y="70" width="35" height="5" rx="2.5" fill="#c7d2fe" className="dark:fill-slate-700" />
      <rect x="75" y="80" width="50" height="4" rx="2" fill="#e2e8f0" className="dark:fill-slate-800" />
      <rect x="75" y="90" width="45" height="4" rx="2" fill="#e2e8f0" className="dark:fill-slate-800" />
      <rect x="75" y="100" width="50" height="4" rx="2" fill="#e2e8f0" className="dark:fill-slate-800" />
      
      {/* Exclamation Spark on Item */}
      <circle cx="118" cy="72" r="3.5" fill="#f59e0b" />
      
      {/* Magnifying Glass overlay */}
      <g transform="translate(10, 10)">
        {/* Handle */}
        <path d="M122 122 L140 140" stroke="url(#st-grad-primary)" strokeWidth="6" strokeLinecap="round" />
        {/* Glass Loop */}
        <circle cx="110" cy="110" r="18" fill="white" stroke="url(#st-grad-primary)" strokeWidth="4.5" className="dark:fill-slate-950" />
        {/* Inner Glare reflection */}
        <path d="M102 100 A12 12 0 0 1 120 118" stroke="#e0e7ff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </g>
    </svg>
  );
};

export default StatementEmptyIllustration;
