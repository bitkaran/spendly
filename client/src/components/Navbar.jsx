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
    <nav className="sticky bottom-0 z-40 w-full glass border-t border-slate-200/50 dark:border-darkBorder/40 pb-safe shadow-lg">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          
          if (tab.action) {
            // Center floating add action button (Vibrant gradient)
            return (
              <button
                key={idx}
                onClick={tab.action}
                className="relative -top-4 flex flex-col items-center justify-center h-13 w-13 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 hover:from-primary-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all duration-200"
                aria-label="Add expense"
              >
                <Icon className="h-6 w-6 stroke-[2.5]" />
              </button>
            );
          }

          const active = isActive(tab.path);
          return (
            <button
              key={idx}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center w-14 h-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <div
                className={`p-1 rounded-xl transition-all duration-200 ${
                  active
                    ? 'text-primary-600 dark:text-primary-400 scale-110'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Icon className="h-5.5 w-5.5 stroke-[2]" />
              </div>
              <span
                className={`text-[9px] font-bold mt-0.5 tracking-wide transition-colors duration-200 ${
                  active
                    ? 'text-primary-600 dark:text-primary-400 font-extrabold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
