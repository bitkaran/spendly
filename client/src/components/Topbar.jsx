import React from 'react';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

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
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/50 dark:border-darkBorder/40 py-3.5 px-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500 dark:from-primary-400 dark:to-indigo-400 font-sans">
            Spendly
          </span>
          {user && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Finance App
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggler */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-darkBorder/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5 text-yellow-500" /> : <Moon className="h-4.5 w-4.5 text-indigo-400" />}
        </button>

        {/* User initials bubble */}
        {user && (
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md">
            {getInitials(user.name)}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
