import React from 'react';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import SpendlyLogo from './SpendlyLogo';

const Topbar = ({ darkMode, toggleDarkMode, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Show back button on sub-routes, e.g. calculator page
  const showBackButton = ['/calculator'].includes(location.pathname);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-darkBg/95 backdrop-blur-md border-b border-slate-100 dark:border-darkBorder/40 py-3 px-4 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-darkCard hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-all active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <SpendlyLogo size={28} className="transform -rotate-6" />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-sans leading-none">
              Spendly
            </span>
            {user && (
              <span className="text-[8px] text-primary-600 dark:text-primary-400 font-extrabold uppercase tracking-widest mt-0.5">
                Finance App
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Theme Toggler */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl bg-slate-50 dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm active:scale-95"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-indigo-400" />}
        </button>

        {/* User initials bubble */}
        {user && (
          <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-black text-xs flex items-center justify-center shadow-md">
            {getInitials(user.name)}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
