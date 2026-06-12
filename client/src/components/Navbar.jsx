import React from 'react';
import { Home, Plus, FileText, BarChart2, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ onAddClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Statement', icon: FileText, path: '/statement' },
    { name: 'Add', icon: Plus, action: onAddClick },
    { name: 'Analytics', icon: BarChart2, path: '/analytics' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const isActive = (path) => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky bottom-0 z-40 w-full bg-white/95 dark:bg-darkBg/95 backdrop-blur-md border-t border-slate-100 dark:border-darkBorder/30 shadow-lg transition-colors duration-300 navbar-safe">
      <div className="flex justify-around items-center h-[72px] px-2">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          
          if (tab.action) {
            // Center floating add action button (Vibrant gradient)
            return (
              <button
                key={idx}
                onClick={tab.action}
                className="relative -top-6 flex flex-col items-center justify-center h-14 w-14 rounded-[20px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg hover:shadow-indigo-500/20 active:scale-90 transition-all duration-200 shrink-0"
                aria-label="Add expense"
              >
                <Icon className="h-7 w-7 stroke-[2.5]" />
              </button>
            );
          }

          const active = isActive(tab.path);
          return (
            <button
              key={idx}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center w-16 h-full transition-colors relative"
            >
              <div
                className={`p-1 transition-all duration-200 ${
                  active
                    ? 'text-slate-900 dark:text-white scale-105'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-355'
                }`}
              >
                <Icon className="h-6 w-6 stroke-[2]" />
              </div>
              <span
                className={`text-[10px] font-bold mt-0.5 tracking-wide transition-colors duration-200 ${
                  active
                    ? 'text-slate-900 dark:text-white font-extrabold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {tab.name}
              </span>
              {active && (
                <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-slate-900 dark:bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
