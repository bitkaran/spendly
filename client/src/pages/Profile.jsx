import React, { useState, useEffect } from 'react';
import { User, LogOut, Download, Moon, Sun, Plus, Trash2, Tag, ShieldCheck, ChevronRight, Settings, PiggyBank, FolderHeart, Info, Save } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import SpendlyLogo from '../components/SpendlyLogo';
import ProfileBrandingIllustration from '../components/illustrations/ProfileBrandingIllustration';
import PWAInstallIllustration from '../components/illustrations/PWAInstallIllustration';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' }
];

const Profile = ({ onLogout, darkMode, toggleDarkMode, categories = [], onCategoryChange, deferredPrompt, isInstalled, setDeferredPrompt }) => {
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install: ${outcome}`);
    if (setDeferredPrompt) setDeferredPrompt(null);
  };

  const isIOS = () => {
    const ua = window.navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  };

  const isAndroidChrome = () => {
    const ua = window.navigator.userAgent;
    return /Android/i.test(ua) && /Chrome/i.test(ua);
  };
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Active Collapsible Accordion Tab
  // 'general', 'categories', 'budgets', 'data'
  const [activeTab, setActiveTab] = useState('general');

  // General Settings State
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [monthlyBudget, setMonthlyBudget] = useState('0');

  // Categories Manager State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏷️');
  const [newCatColor, setNewCatColor] = useState('#8395a7');
  const [newCatType, setNewCatType] = useState('expense');
  const [editingCatId, setEditingCatId] = useState(null);
  
  // Category Deletion/Archive confirm state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);

  // Budgets Manager State
  const [budgetsList, setBudgetsList] = useState([]);
  const [targetCategory, setTargetCategory] = useState('Overall');
  const [budgetAmount, setBudgetAmount] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('spendly_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      setCurrencyCode(u.currencyCode || 'INR');
      setCurrencySymbol(u.currencySymbol || '₹');
      setMonthlyBudget((u.monthlyBudget || 0).toString());
    }
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const now = new Date();
      const res = await api.get('/budgets', {
        params: {
          month: now.getMonth() + 1,
          year: now.getFullYear()
        }
      });
      setBudgetsList(res.data);
    } catch (error) {
      console.error('Fetch budgets error:', error);
    }
  };

  const handleUpdateGeneralSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const selectedCurr = CURRENCIES.find(c => c.code === currencyCode) || { symbol: currencySymbol };
      
      const payload = {
        currencyCode,
        currencySymbol: selectedCurr.symbol,
        monthlyBudget: Number(monthlyBudget) || 0
      };

      await api.put('/user/settings', payload);
      
      // Update local cache
      if (user) {
        const updatedUser = {
          ...user,
          currencyCode: payload.currencyCode,
          currencySymbol: payload.currencySymbol,
          monthlyBudget: payload.monthlyBudget
        };
        localStorage.setItem('spendly_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      toast.success('General settings updated successfully');
      
      // Also update overall budget record in Budget model dynamically
      const now = new Date();
      await api.post('/budgets', {
        category: 'Overall',
        amount: Number(monthlyBudget) || 0,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });
      fetchBudgets();
    } catch (error) {
      console.error('Update user settings error:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setLoading(true);
      if (editingCatId) {
        // Edit existing custom category
        await api.put(`/categories/${editingCatId}`, {
          name: newCatName.trim(),
          icon: newCatIcon,
          color: newCatColor,
          transactionType: newCatType
        });
        toast.success('Category updated successfully');
        setEditingCatId(null);
      } else {
        // Create custom category
        await api.post('/categories', {
          name: newCatName.trim(),
          icon: newCatIcon,
          color: newCatColor,
          transactionType: newCatType
        });
        toast.success(`Category "${newCatName.trim()}" created`);
      }
      setNewCatName('');
      onCategoryChange();
    } catch (error) {
      console.error('Save category error:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCatClick = (cat) => {
    if (cat.type === 'default') {
      toast.error('Cannot edit system default categories');
      return;
    }
    setEditingCatId(cat._id);
    setNewCatName(cat.name);
    setNewCatIcon(cat.icon || '🏷️');
    setNewCatColor(cat.color || '#8395a7');
    setNewCatType(cat.transactionType || 'expense');
  };

  const handleDeleteCatRequest = (cat) => {
    setCatToDelete(cat);
    setIsConfirmOpen(true);
  };

  const handleConfirmDeleteCat = async () => {
    if (!catToDelete) return;
    try {
      await api.delete(`/categories/${catToDelete._id}`);
      toast.success('Category removed successfully');
      setIsConfirmOpen(false);
      setCatToDelete(null);
      onCategoryChange();
    } catch (error) {
      console.error('Delete category error:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!budgetAmount || Number(budgetAmount) <= 0) {
      toast.error('Please enter a positive amount');
      return;
    }

    try {
      setLoading(true);
      const now = new Date();
      await api.post('/budgets', {
        category: targetCategory,
        amount: Number(budgetAmount),
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });
      toast.success(`Monthly budget set for "${targetCategory}"`);
      setBudgetAmount('');
      fetchBudgets();
    } catch (error) {
      console.error('Save budget error:', error);
      toast.error('Failed to save budget limit');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      toast.success('Budget limit deleted');
      fetchBudgets();
    } catch (error) {
      console.error('Delete budget error:', error);
      toast.error('Failed to delete budget limit');
    }
  };

  const handleExportAllData = async () => {
    try {
      toast.loading('Exporting all data...', { id: 'data-export' });
      
      const [txRes, catRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/categories')
      ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        user,
        categories: catRes.data,
        transactions: txRes.data,
        budgets: budgetsList,
        app: 'Spendly',
        version: '2.0.0'
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `spendly-backup-${new Date().toISOString().split('T')[0]}.json`);
      
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      toast.success('All data exported to JSON!', { id: 'data-export' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to export data', { id: 'data-export' });
    }
  };

  return (
    <div className="p-4 space-y-5 bg-slate-50 dark:bg-darkBg transition-colors duration-300 min-h-full pb-28">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
          Profile Settings
        </h2>
        <p className="text-[10px] text-slate-455 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">
          Manage Account & Options
        </p>
      </div>

      {/* User profile Summary Card */}
      {user && (
        <div className="bg-white dark:bg-darkCard p-4 rounded-3xl border border-slate-100 dark:border-darkBorder/40 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-850 text-white font-black text-xl flex items-center justify-center shadow-md">
            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
              {user.name}
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-500" />
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1.5">{user.email}</p>
          </div>
        </div>
      )}

      {/* Settings Navigation Accordion */}
      <div className="space-y-3">
        
        {/* TAB 1: General Preferences */}
        <div className="bg-white dark:bg-darkCard border border-slate-150/40 dark:border-darkBorder/30 rounded-3xl overflow-hidden shadow-sm">
          <button
            onClick={() => setActiveTab(activeTab === 'general' ? '' : 'general')}
            className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/5 text-indigo-500">
                <Settings className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-750 dark:text-slate-200">General Settings</span>
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-550">Currency and main budget preferences</span>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${activeTab === 'general' ? 'rotate-90' : ''}`} />
          </button>

          {activeTab === 'general' && (
            <div className="p-4 border-t border-slate-100 dark:border-darkBorder/25 bg-slate-50/25 dark:bg-slate-900/10">
              <form onSubmit={handleUpdateGeneralSettings} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Currency Code
                    </label>
                    <select
                      value={currencyCode}
                      onChange={(e) => setCurrencyCode(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-750 dark:text-slate-350 focus:outline-none"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Overall Budget Limit
                    </label>
                    <input
                      type="number"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition hover:bg-slate-850"
                >
                  <Save className="h-3.5 w-3.5" /> Save Preferences
                </button>
              </form>
            </div>
          )}
        </div>

        {/* TAB 2: Custom Categories */}
        <div className="bg-white dark:bg-darkCard border border-slate-150/40 dark:border-darkBorder/30 rounded-3xl overflow-hidden shadow-sm">
          <button
            onClick={() => setActiveTab(activeTab === 'categories' ? '' : 'categories')}
            className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/5 text-indigo-500">
                <Tag className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-750 dark:text-slate-200">Custom Categories</span>
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-550">Create, edit and delete custom labels</span>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${activeTab === 'categories' ? 'rotate-90' : ''}`} />
          </button>

          {activeTab === 'categories' && (
            <div className="p-4 border-t border-slate-100 dark:border-darkBorder/25 bg-slate-50/25 dark:bg-slate-900/10 space-y-4">
              
              {/* Category form */}
              <form onSubmit={handleAddCategory} className="p-3 bg-white dark:bg-darkCard border border-slate-200/55 dark:border-darkBorder/20 rounded-2xl space-y-3">
                <span className="text-[8px] font-extrabold text-indigo-500 uppercase tracking-wider block">
                  {editingCatId ? 'Edit Custom Category' : 'Create Custom Category'}
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Subscriptions, Laundry"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="col-span-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205/60 dark:border-darkBorder/60 rounded-xl text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900 dark:text-white"
                    required
                  />

                  <div>
                    <label className="block text-[7px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</label>
                    <select
                      value={newCatType}
                      onChange={(e) => setNewCatType(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[7px] font-bold text-slate-400 uppercase tracking-wider mb-1">Emoji Icon</label>
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] focus:outline-none text-center"
                    >
                      <option value="🏷️">🏷️ Category</option>
                      <option value="🍿">🍿 Entertainment</option>
                      <option value="🍔">🍔 Food & Drink</option>
                      <option value="🚗">🚗 Transport</option>
                      <option value="🛍️">🛍️ Shopping</option>
                      <option value="⚡">⚡ Utilities</option>
                      <option value="🏠">🏠 Housing</option>
                      <option value="🏥">🏥 Medical</option>
                      <option value="🎓">🎓 Education</option>
                      <option value="✈️">✈️ Travel</option>
                      <option value="📱">📱 Phone</option>
                      <option value="💰">💰 Salary</option>
                      <option value="💻">💻 Freelance</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition"
                  >
                    {editingCatId ? 'Save Edits' : 'Create Label'}
                  </button>
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(null);
                        setNewCatName('');
                      }}
                      className="px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-xl text-[10px] font-bold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* List and archive/delete options */}
              <div className="max-h-48 overflow-y-auto no-scrollbar border border-slate-100 dark:border-darkBorder/25 rounded-2xl divide-y divide-slate-100 dark:divide-darkBorder/25 bg-white dark:bg-darkCard">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="px-3 py-2 flex items-center justify-between text-[10px] hover:bg-slate-50/50 dark:hover:bg-slate-900/5 font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon || '🏷️'}</span>
                      <span className="text-slate-700 dark:text-slate-200">
                        {cat.name}
                      </span>
                      <span className={`text-[6px] px-1 rounded border uppercase ${
                        cat.transactionType === 'income' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                          : 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30'
                      }`}>
                        {cat.transactionType || 'expense'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {cat.type === 'custom' ? (
                        <>
                          <button
                            onClick={() => handleEditCatClick(cat)}
                            className="px-2 py-1 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-800 rounded border border-slate-100/35"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCatRequest(cat)}
                            className="p-1.5 rounded bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-red-500 border border-slate-100/30 dark:border-transparent transition"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleDeleteCatRequest(cat)}
                          className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-rose-500 border border-slate-100 rounded text-[7px] font-extrabold uppercase tracking-wider"
                          title="Remove from my preferred categories list"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* TAB 3: Category Budgets */}
        <div className="bg-white dark:bg-darkCard border border-slate-150/40 dark:border-darkBorder/30 rounded-3xl overflow-hidden shadow-sm">
          <button
            onClick={() => setActiveTab(activeTab === 'budgets' ? '' : 'budgets')}
            className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/5 text-indigo-500">
                <PiggyBank className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-750 dark:text-slate-200">Category Budgets</span>
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-550">Configure monthly targets per category</span>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${activeTab === 'budgets' ? 'rotate-90' : ''}`} />
          </button>

          {activeTab === 'budgets' && (
            <div className="p-4 border-t border-slate-100 dark:border-darkBorder/25 bg-slate-50/25 dark:bg-slate-900/10 space-y-4">
              
              {/* Add budget form */}
              <form onSubmit={handleAddBudget} className="p-3 bg-white dark:bg-darkCard border border-slate-200/55 dark:border-darkBorder/20 rounded-2xl space-y-3">
                <span className="text-[8px] font-extrabold text-indigo-500 uppercase tracking-wider block">Set Monthly Category Budget</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[7px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Category</label>
                    <select
                      value={targetCategory}
                      onChange={(e) => setTargetCategory(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-350 focus:outline-none animate-fade-in"
                    >
                      <option value="Overall">Overall Budget</option>
                      {categories.filter(c => c.transactionType === 'expense' || !c.transactionType).map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[7px] font-bold text-slate-400 uppercase tracking-wider mb-1">Budget Amount ({currencySymbol})</label>
                    <input
                      type="number"
                      placeholder="e.g. 3000"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Save Budget Limit
                </button>
              </form>

              {/* Existing Budgets listing */}
              <div className="space-y-2">
                <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider pl-0.5">Active Budgets this Cycle</span>
                {budgetsList.length === 0 ? (
                  <p className="text-[10px] text-slate-400 p-2.5 text-center bg-white dark:bg-darkCard rounded-xl border border-slate-100 dark:border-darkBorder/10 font-medium">No custom budgets active for this month.</p>
                ) : (
                  <div className="space-y-1.5">
                    {budgetsList.map((bg) => (
                      <div key={bg._id} className="flex justify-between items-center text-[10px] p-2.5 bg-white dark:bg-darkCard rounded-xl border border-slate-150/40 dark:border-darkBorder/25 font-bold">
                        <div>
                          <p className="text-slate-900 dark:text-white">{bg.category}</p>
                          <p className="text-[7px] text-slate-400 uppercase tracking-wider font-semibold">Period: {bg.month}/{bg.year}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-950 dark:text-white">{currencySymbol}{bg.amount.toLocaleString()}</span>
                          <button
                            onClick={() => handleDeleteBudget(bg._id)}
                            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-50 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* TAB 4: Data, Theme and Session */}
        <div className="bg-white dark:bg-darkCard border border-slate-150/40 dark:border-darkBorder/30 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-darkBorder/25">
          
          {/* Theme Switcher */}
          <div className="p-4 flex items-center justify-between hover:bg-slate-50/30 dark:hover:bg-slate-900/5 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/5 text-indigo-500">
                {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-750 dark:text-slate-200">Dark Display Theme</span>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Toggle interface design mode</span>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                darkMode ? 'bg-indigo-650' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  darkMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Export JSON data backup */}
          <div
            onClick={handleExportAllData}
            className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/5 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/5 text-emerald-500">
                <Download className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-750 dark:text-slate-200">Export All Data</span>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Download full JSON data backup</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>

          {/* Logout Option */}
          <div
            onClick={onLogout}
            className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/5 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/5 text-red-500">
                <LogOut className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-750 dark:text-slate-200">Sign Out Session</span>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Log out of this device safely</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
        </div>

      </div>

      {/* PWA Install Section Card */}
      <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/30 rounded-3xl p-5 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-20 h-20 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
        
        {/* PWA Illustration */}
        <div className="mb-2 shrink-0 flex items-center justify-center">
          <PWAInstallIllustration className="w-28 h-28" />
        </div>
        
        <h4 className="text-xs font-black text-slate-900 dark:text-white font-sans leading-none flex items-center gap-1.5 justify-center">
          Install Spendly App
        </h4>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 leading-relaxed max-w-[280px]">
          Install Spendly on your home screen for a full-screen, standalone application experience.
        </p>

        <div className="w-full mt-4">
          {isInstalled ? (
            <div className="w-full py-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-extrabold rounded-2xl text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5">
              ✓ Installed as App
            </div>
          ) : deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-50 dark:text-slate-900 text-white font-extrabold rounded-2xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-98 shadow-md"
            >
              Install App
            </button>
          ) : (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-150/40 dark:border-darkBorder/25 text-left space-y-1.5">
              <span className="text-[7.5px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block leading-none">How to Install Manually</span>
              {isIOS() ? (
                <p className="text-[9.5px] font-bold text-slate-600 dark:text-slate-400 leading-normal">
                  iPhone Safari: Tap the <span className="font-extrabold text-indigo-500">Share icon</span> at bottom, then select <span className="font-extrabold text-indigo-500">Add to Home Screen</span>.
                </p>
              ) : isAndroidChrome() ? (
                <p className="text-[9.5px] font-bold text-slate-600 dark:text-slate-400 leading-normal">
                  Android Chrome: Tap the <span className="font-extrabold text-indigo-500">Menu (three dots)</span>, then select <span className="font-extrabold text-indigo-500">Install app</span> or <span className="font-extrabold text-indigo-500">Add to Home screen</span>.
                </p>
              ) : (
                <p className="text-[9.5px] font-bold text-slate-600 dark:text-slate-400 leading-normal">
                  Open your browser menu (e.g. Chrome, Safari) and select <span className="font-extrabold text-indigo-500">Add to Home Screen</span> to install.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* App Branding Card */}
      <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/30 rounded-3xl p-4.5 shadow-sm flex items-center gap-3.5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-primary-500/5 rounded-bl-full pointer-events-none" />
        <div className="w-14 h-14 shrink-0 flex items-center justify-center">
          <ProfileBrandingIllustration className="w-14 h-14" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 leading-none font-sans">
            Spendly Tracker
            <span className="text-[7px] px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-950/30 text-primary-605 dark:text-primary-400 font-extrabold tracking-wider uppercase border border-primary-200/10">v2.0.0</span>
          </h4>
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed pt-0.5">
            A minimalist premium personal finance manager.
          </p>
        </div>
      </div>

      <div className="text-center space-y-1 py-1">
        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-700 uppercase tracking-widest leading-none">
          Spendly Expense Tracker &bull; Stable Build
        </p>
      </div>

      {/* Category deletion ConfirmModal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Custom Category"
        message={`Are you sure you want to delete category "${catToDelete?.name}"? historical transactions under this category name will remain visible in statement ledger.`}
        onConfirm={handleConfirmDeleteCat}
        onCancel={() => {
          setIsConfirmOpen(false);
          setCatToDelete(null);
        }}
      />
    </div>
  );
};

export default Profile;
