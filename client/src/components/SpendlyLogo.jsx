import React from 'react';

const SpendlyLogo = ({ className = 'h-8 w-8', size = 40 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      width={size}
      height={size}
    >
      <defs>
        {/* Deep modern fintech gradient from primary indigo/violet to emerald/cyan */}
        <linearGradient id="spendly-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        {/* Subtle shadow overlay to give 3D overlap feel */}
        <filter id="logo-drop-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" />
        </filter>
      </defs>
      
      {/* Outer Circle background representing coin / wallet container */}
      <circle cx="50" cy="50" r="46" fill="url(#spendly-logo-gradient)" className="opacity-10 dark:opacity-15" />
      
      {/* Stylized premium intersecting double card ribbon forming 'S' */}
      <g filter="url(#logo-drop-shadow)">
        {/* Bottom card curve */}
        <path
          d="M30 62 C 30 72, 70 72, 70 58 C 70 48, 45 46, 45 38 C 45 32, 65 32, 65 42"
          stroke="url(#spendly-logo-gradient)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Top card curve overlapping */}
        <path
          d="M35 58 C 35 68, 55 68, 55 62"
          stroke="#10b981"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
          className="opacity-90"
        />
        {/* Dynamic rising growth arrow dot representing asset growth */}
        <circle cx="70" cy="34" r="7" fill="#10b981" />
        <path
          d="M62 34 L 70 34 L 70 42"
          stroke="#10b981"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
};

export default SpendlyLogo;
