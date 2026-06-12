import React from 'react';

const OnboardingWelcomeIllustration = ({ className = 'w-48 h-48' }) => {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="ob-grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="ob-card-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
        <filter id="ob-card-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <dropShadow dx="0" dy="12" stdDeviation="8" floodColor="#312e81" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Floating spheres in background */}
      <circle cx="45" cy="55" r="16" fill="#ecfdf5" opacity="0.4" className="dark:fill-slate-900" />
      <circle cx="150" cy="145" r="24" fill="#eef2ff" opacity="0.5" className="dark:fill-slate-900" />

      {/* Connection paths */}
      <path d="M45 55 Q 90 90, 150 145" stroke="#e0e7ff" strokeWidth="1.5" strokeDasharray="5 5" className="dark:stroke-slate-800" />

      {/* Main Glassmorphism Premium Wallet Card */}
      <g filter="url(#ob-card-shadow)">
        {/* Gradient chassis background */}
        <rect x="55" y="65" width="90" height="60" rx="14" fill="url(#ob-grad-bg)" />
        {/* Glass overlay */}
        <rect x="55" y="65" width="90" height="60" rx="14" fill="url(#ob-card-glass)" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      </g>

      {/* Card Details (Chip & Logo mock) */}
      <rect x="68" y="80" width="14" height="10" rx="2.5" fill="#fcd34d" opacity="0.95" />
      <circle cx="125" cy="85" r="6" fill="white" opacity="0.3" />
      <circle cx="132" cy="85" r="6" fill="#10b981" opacity="0.75" />

      {/* Card numbers mock lines */}
      <rect x="68" y="102" width="22" height="3" rx="1.5" fill="white" opacity="0.85" />
      <rect x="94" y="102" width="16" height="3" rx="1.5" fill="white" opacity="0.85" />
      <rect x="114" y="102" width="18" height="3" rx="1.5" fill="white" opacity="0.85" />

      {/* Gold Floating Coin */}
      <g transform="translate(130, 40)" filter="url(#ob-card-shadow)">
        <circle cx="12" cy="12" r="12" fill="#fbbf24" />
        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M12 7 L12 17 M10 9 L15 9 M10 15 L14 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default OnboardingWelcomeIllustration;
