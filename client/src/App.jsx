import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Calculator as CalcIcon } from 'lucide-react';
import api from './utils/api';
import toast from 'react-hot-toast';

// Import Components
import Topbar from './components/Topbar';
import Navbar from './components/Navbar';
import AddExpenseSheet from './components/AddExpenseSheet';

// Import Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Statement from './pages/Statement';
import Analytics from './pages/Analytics';
import Calculator from './pages/Calculator';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [categories, setCategories] = useState([]);

  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Rerendering triggers for sub-pages
  const [triggerRerender, setTriggerRerender] = useState(0);

  // Add Expense Sheet State
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  useEffect(() => {
    // 1. Load User Session on mount
    const savedUser = localStorage.getItem('spendly_user');
    const token = localStorage.getItem('spendly_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      fetchCategories();
    }
    setLoading(false);

    // 2. Load Theme preferences
    const isDark = localStorage.getItem('spendly_dark') === 'true';
    setDarkMode(isDark);

    // 3. Listen for token expiration logout events
    const handleLogoutEvent = () => {
      setUser(null);
      navigate('/login');
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('spendly_logout', handleLogoutEvent);

    // 4. PWA Installation hooks
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsInstalled(!!isStandalone);
    };
    checkStandalone();

    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('Spendly installed as app successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('spendly_logout', handleLogoutEvent);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Sync dark mode state with document node
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('spendly_dark', darkMode);
  }, [darkMode]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    fetchCategories();
  };

  const handleLogout = () => {
    localStorage.removeItem('spendly_token');
    localStorage.removeItem('spendly_user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleOpenAddSheet = (expense = null) => {
    setExpenseToEdit(expense);
    setIsAddSheetOpen(true);
  };

  const handleSaveExpense = () => {
    setTriggerRerender((prev) => prev + 1);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-darkBg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Loading Spendly...</p>
        </div>
      </div>
    );
  }

  const isLoggedIn = !!user;
  const isOnboarded = isLoggedIn && user.onboardingCompleted;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center py-0 sm:py-6">
      {/* Mobile Chassis Device frame on Desktop */}
      <div className="w-full max-w-md h-[100dvh] sm:h-[90vh] sm:max-h-[800px] bg-slate-50 dark:bg-darkBg sm:rounded-[40px] sm:shadow-2xl flex flex-col justify-between overflow-hidden border border-slate-200/50 dark:border-darkBorder/40 relative sm:ring-8 sm:ring-slate-900/5">
        
        {/* Topbar Layout */}
        {isOnboarded && <Topbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} user={user} />}

        {/* View Layout pages container */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-6">
          <Routes>
            {/* Authenticated Routes */}
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  !isOnboarded ? (
                    <Navigate to="/onboarding" replace />
                  ) : (
                    <Dashboard
                      onOpenAddSheet={handleOpenAddSheet}
                      triggerRerender={triggerRerender}
                      categories={categories}
                    />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/onboarding"
              element={
                isLoggedIn ? (
                  !isOnboarded ? (
                    <Onboarding onOnboardingSuccess={handleLoginSuccess} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/statement"
              element={
                isLoggedIn ? (
                  !isOnboarded ? (
                    <Navigate to="/onboarding" replace />
                  ) : (
                    <Statement
                      onOpenAddSheet={handleOpenAddSheet}
                      triggerRerender={triggerRerender}
                      categories={categories}
                    />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/analytics"
              element={
                isLoggedIn ? (
                  !isOnboarded ? (
                    <Navigate to="/onboarding" replace />
                  ) : (
                    <Analytics triggerRerender={triggerRerender} darkMode={darkMode} />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/calculator"
              element={
                isLoggedIn ? (
                  !isOnboarded ? (
                    <Navigate to="/onboarding" replace />
                  ) : (
                    <Calculator categories={categories} />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                isLoggedIn ? (
                  !isOnboarded ? (
                    <Navigate to="/onboarding" replace />
                  ) : (
                    <Profile
                      user={user}
                      onLogout={handleLogout}
                      darkMode={darkMode}
                      toggleDarkMode={toggleDarkMode}
                      categories={categories}
                      onCategoryChange={fetchCategories}
                      deferredPrompt={deferredPrompt}
                      isInstalled={isInstalled}
                      setDeferredPrompt={setDeferredPrompt}
                    />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                !isLoggedIn ? (
                  <Login onLoginSuccess={handleLoginSuccess} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/signup"
              element={
                !isLoggedIn ? (
                  <Signup onLoginSuccess={handleLoginSuccess} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to={isLoggedIn ? (isOnboarded ? '/' : '/onboarding') : '/login'} replace />} />
          </Routes>
        </main>

        {/* Bottom Navigation (Only for logged in users) */}
        {isOnboarded && <Navbar onAddClick={() => handleOpenAddSheet(null)} />}

        {/* Floating Calculator Shortcut (on Dashboard & Analytics) */}
        {isOnboarded && ['/', '/analytics'].includes(location.pathname) && (
          <button
            onClick={() => navigate('/calculator')}
            className="absolute bottom-20 right-4 p-3 bg-white dark:bg-darkCard hover:bg-slate-50 text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-darkBorder/40 rounded-full shadow-lg hover:shadow-indigo-500/10 active:scale-95 transition"
            title="Custom Calculator"
          >
            <CalcIcon className="h-5 w-5" />
          </button>
        )}

        {/* Add/Edit Expense Bottom Sheet */}
        {isLoggedIn && (
          <AddExpenseSheet
            isOpen={isAddSheetOpen}
            onClose={() => setIsAddSheetOpen(false)}
            onSave={handleSaveExpense}
            expenseToEdit={expenseToEdit}
            categories={categories}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'dark:bg-slate-900 dark:text-white dark:border dark:border-slate-800 text-xs font-semibold rounded-2xl p-3 shadow-md',
          duration: 3000,
        }}
      />
      <AppContent />
    </Router>
  );
}

export default App;
