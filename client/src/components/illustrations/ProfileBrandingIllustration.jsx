import React from 'react';

const ProfileBrandingIllustration = ({ className = 'w-48 h-48' }) => {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="pb-grad-logo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <filter id="pb-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <dropShadow dx="0" dy="8" stdDeviation="6" floodColor="#4f46e5" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Background radial frame */}
      <circle cx="100" cy="100" r="70" fill="#f8fafc" className="dark:fill-slate-900/30" />
      <circle cx="100" cy="100" r="50" stroke="#f1f5f9" strokeWidth="2" className="dark:stroke-slate-900" />

      {/* Styled gear/settings wheels floating */}
      <g stroke="#94a3b8" strokeWidth="2" opacity="0.3" className="dark:stroke-slate-700">
        <path d="M140 60 L146 60 M143 57 L143 63 M139 59 C138 56, 148 56, 147 59" />
        <circle cx="143" cy="60" r="4.5" fill="none" />
      </g>

      {/* Central Spendly Branding Premium Card */}
      <g filter="url(#pb-shadow)" transform="translate(10, 10)">
        <rect x="50" y="50" width="80" height="80" rx="20" fill="white" className="dark:fill-slate-900" />
        <rect x="54" y="54" width="72" height="72" rx="16" fill="url(#pb-grad-logo)" opacity="0.06" />
        
        {/* Core Lock / Shield icon */}
        <g transform="translate(72, 70)">
          <path
            d="M18 32 C 18 36, 34 39, 34 32 C 34 27, 24 26, 24 20 C 24 16, 34 16, 34 22"
            stroke="url(#pb-grad-logo)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M20 30 C 20 36, 30 36, 30 32"
            stroke="#10b981"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="36" cy="12" r="3.5" fill="#10b981" />
          <path
            d="M32 12 L 36 12 L 36 16"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </g>
    </svg>
  );
};

export default ProfileBrandingIllustration;
