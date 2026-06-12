import React from 'react';

const PWAInstallIllustration = ({ className = 'w-48 h-48' }) => {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="pwa-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="pwa-grad-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="pwa-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <dropShadow dx="0" dy="8" stdDeviation="5" floodColor="#4f46e5" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Background radial frame */}
      <circle cx="100" cy="100" r="68" fill="#f8fafc" className="dark:fill-slate-900/30" />

      {/* Styled Phone Frame Silhouette */}
      <g filter="url(#pwa-shadow)">
        <rect x="68" y="48" width="64" height="104" rx="14" fill="white" stroke="#e2e8f0" strokeWidth="2" className="dark:fill-slate-900 dark:stroke-slate-800" />
      </g>

      {/* Screen Inner Outline */}
      <rect x="73" y="53" width="54" height="84" rx="9" fill="#f8fafc" className="dark:fill-slate-950" />
      
      {/* Home button mock / bottom detail */}
      <circle cx="100" cy="144" r="3" fill="#cbd5e1" className="dark:fill-slate-800" />

      {/* Home screen App Grid mock */}
      <g transform="translate(78, 60)">
        <rect x="0" y="0" width="10" height="10" rx="3.5" fill="#cbd5e1" className="dark:fill-slate-800" opacity="0.6" />
        <rect x="15" y="0" width="10" height="10" rx="3.5" fill="#cbd5e1" className="dark:fill-slate-800" opacity="0.6" />
        <rect x="30" y="0" width="10" height="10" rx="3.5" fill="#cbd5e1" className="dark:fill-slate-800" opacity="0.6" />
        
        <rect x="0" y="15" width="10" height="10" rx="3.5" fill="#cbd5e1" className="dark:fill-slate-800" opacity="0.6" />
        {/* Spendly App Icon in grid */}
        <g transform="translate(15, 15)">
          <rect x="0" y="0" width="12" height="12" rx="4" fill="url(#pwa-grad-primary)" />
          <path d="M6 3 L6 9 M3 6 L9 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <rect x="30" y="15" width="10" height="10" rx="3.5" fill="#cbd5e1" className="dark:fill-slate-800" opacity="0.6" />
      </g>

      {/* Download Directing Arrow */}
      <g transform="translate(112, 100)" filter="url(#pwa-shadow)">
        <circle cx="20" cy="20" r="18" fill="url(#pwa-grad-secondary)" />
        <path d="M20 11 L20 25 M14 20 L20 26 L26 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

export default PWAInstallIllustration;
