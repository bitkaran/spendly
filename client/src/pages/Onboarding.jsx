import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, PiggyBank, FolderHeart, ArrowRight, ArrowLeft, Check, Plus, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import SpendlyLogo from '../components/SpendlyLogo';
import OnboardingWelcomeIllustration from '../components/illustrations/OnboardingWelcomeIllustration';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' }
];

const Onboarding = ({ onOnboardingSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [monthlyBudget, setMonthlyBudget] = useState('15000');
  
  // Category State
  const [dbCategories, setDbCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  
  // Custom Category State
  const [customCatName, setCustomCatName] = useState('');
  const [customCatType, setCustomCatType] = useState('expense');
  const [customCatIcon, setCustomCatIcon] = useState('🏷️');

  useEffect(() => {
    fetchGlobalCategories();
  }, []);

  const fetchGlobalCategories = async () => {
    try {
      const res = await api.get('/categories');
      setDbCategories(res.data);
      // Auto-select all default categories by default
      const defaultIds = res.data.filter(c => c.isDefault || c.type === 'default').map(c => c._id);
      setSelectedCategoryIds(defaultIds);
    } catch (error) {
      console.error('Fetch categories error:', error);
      toast.error('Failed to load default categories');
    }
  };

  const handleToggleCategory = (id) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleAddCustomCategory = async (e) => {
    e.preventDefault();
    if (!customCatName.trim()) return;

    try {
      setLoading(true);
      const res = await api.post('/categories', {
        name: customCatName.trim(),
        icon: customCatIcon,
        transactionType: customCatType
      });

      // Add to fetched list and select it
      setDbCategories(prev => [...prev, res.data]);
      setSelectedCategoryIds(prev => [...prev, res.data._id]);
      setCustomCatName('');
      toast.success(`Custom category "${res.data.name}" added!`);
    } catch (error) {
      console.error('Add category error:', error);
      toast.error(error.response?.data?.message || 'Failed to add custom category');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSetup = async () => {
    try {
      setLoading(true);
      
      const payload = {
        currencyCode: selectedCurrency.code,
        currencySymbol: selectedCurrency.symbol,
        monthlyBudget: Number(monthlyBudget) || 0,
        onboardingCompleted: true,
        preferredCategories: selectedCategoryIds
      };

      const res = await api.put('/user/settings', payload);
      
      // Update local storage user preferences
      const storedUser = localStorage.getItem('spendly_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = {
          ...user,
          currencyCode: selectedCurrency.code,
          currencySymbol: selectedCurrency.symbol,
          monthlyBudget: Number(monthlyBudget) || 0,
          onboardingCompleted: true
        };
        localStorage.setItem('spendly_user', JSON.stringify(updatedUser));
        onOnboardingSuccess(updatedUser);
      }

      toast.success('Preferences saved! Welcome to Spendly.');
      navigate('/');
    } catch (error) {
      console.error('Onboarding update settings error:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-full flex flex-col justify-center px-6 py-8 bg-slate-50 dark:bg-darkBg transition-colors duration-300">
      {/* Header logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-indigo-50 dark:bg-slate-900 rounded-[22px] flex items-center justify-center border border-indigo-100/30 dark:border-darkBorder/20 shadow-sm mb-3">
          <SpendlyLogo className="w-9 h-9" />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Setup your wallet</h1>
        <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-extrabold mt-1">
          Step {step} of 4
        </p>
      </div>

      {/* Slide Container (Card) */}
      <div className="bg-white dark:bg-darkCard rounded-[32px] border border-slate-100 dark:border-darkBorder/30 shadow-xl p-6 relative overflow-hidden transition-all duration-300">
        
        {/* STEP 1: Welcome to Spendly */}
        {step === 1 && (
          <div className="space-y-5 py-2">
            <div className="flex justify-center py-1">
              <OnboardingWelcomeIllustration className="w-36 h-36" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Welcome to Spendly</h3>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-450">
                Spendly is your premium startup-level personal finance dashboard. Track income, monitor expenses, set budgets, and gain smart financial insights. Let's customize it to your lifestyle in 2 minutes.
              </p>
            </div>
            <button
              onClick={nextStep}
              className="w-full mt-4 h-12 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-50 dark:text-slate-950 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition active:scale-98"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Choose Currency */}
        {step === 2 && (
          <div className="space-y-5 py-2">
            <div className="space-y-1.5 text-center">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Select Default Currency</h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500">Pick the currency for all your transactions and budget tracking</p>
            </div>

            <div className="space-y-2 pt-2 max-h-[220px] overflow-y-auto no-scrollbar">
              {CURRENCIES.map((curr) => {
                const isSelected = selectedCurrency.code === curr.code;
                return (
                  <button
                    key={curr.code}
                    onClick={() => setSelectedCurrency(curr)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition active:scale-99 ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-md font-bold'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-transparent text-slate-700 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-base font-black w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-white/20 dark:bg-slate-900/10' : 'bg-white dark:bg-slate-850 shadow-sm border border-slate-100 dark:border-transparent'
                      }`}>
                        {curr.symbol}
                      </span>
                      <span className="text-xs">{curr.name}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={prevStep}
                className="flex-1 h-12 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={nextStep}
                className="flex-1 h-12 bg-slate-900 hover:bg-slate-855 text-white dark:bg-white dark:hover:bg-slate-50 dark:text-slate-950 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Monthly Budget Limit */}
        {step === 3 && (
          <div className="space-y-5 py-2">
            <div className="flex justify-center text-indigo-500 py-1">
              <div className="p-3 bg-indigo-50 dark:bg-slate-900 rounded-2xl border border-indigo-100/20 dark:border-darkBorder/10">
                <PiggyBank className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="space-y-1 text-center">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Your Monthly Budget</h3>
              <p className="text-[10px] text-slate-455 dark:text-slate-450">Set a global target. We'll alert you if you cross 80% limit.</p>
            </div>

            <div className="pt-2 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-black text-lg">
                {selectedCurrency.symbol}
              </div>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 h-12 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-700 transition"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={prevStep}
                className="flex-1 h-12 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={nextStep}
                className="flex-1 h-12 bg-slate-900 hover:bg-slate-855 text-white dark:bg-white dark:hover:bg-slate-50 dark:text-slate-950 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Select/Customize Categories */}
        {step === 4 && (
          <div className="space-y-5 py-2">
            <div className="space-y-1 text-center">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Choose Categories</h3>
              <p className="text-[10px] text-slate-455 dark:text-slate-450">Select system defaults to load or add your own custom ones below.</p>
            </div>

            {/* Quick defaults grid */}
            <div className="h-[180px] overflow-y-auto no-scrollbar border border-slate-100 dark:border-slate-800 rounded-2xl p-2 space-y-3">
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider pl-1.5">Expense Categories</span>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {dbCategories.filter(c => c.transactionType === 'expense' || !c.transactionType).map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat._id);
                    return (
                      <button
                        key={cat._id}
                        onClick={() => handleToggleCategory(cat._id)}
                        className={`p-2 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-all text-left truncate ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-500/30 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-500/20 dark:text-indigo-400'
                            : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-transparent text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="text-sm">{cat.icon}</span>
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="h-3 w-3 shrink-0 ml-auto text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider pl-1.5">Income Categories</span>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {dbCategories.filter(c => c.transactionType === 'income').map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat._id);
                    return (
                      <button
                        key={cat._id}
                        onClick={() => handleToggleCategory(cat._id)}
                        className={`p-2 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-all text-left truncate ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-500/30 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-500/20 dark:text-emerald-400'
                            : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-transparent text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="text-sm">{cat.icon}</span>
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="h-3 w-3 shrink-0 ml-auto text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Custom Category Quick Add inline form */}
            <form onSubmit={handleAddCustomCategory} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-darkBorder/20 space-y-2">
              <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Add Custom Category</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={customCatName}
                  onChange={(e) => setCustomCatName(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900 dark:text-white"
                />
                
                <select
                  value={customCatType}
                  onChange={(e) => setCustomCatType(e.target.value)}
                  className="px-1.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-350 focus:outline-none"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>

                <select
                  value={customCatIcon}
                  onChange={(e) => setCustomCatIcon(e.target.value)}
                  className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] focus:outline-none"
                >
                  <option value="🏷️">🏷️</option>
                  <option value="☕">☕</option>
                  <option value="🍕">🍕</option>
                  <option value="🚗">🚗</option>
                  <option value="🛍️">🛍️</option>
                  <option value="⚡">⚡</option>
                  <option value="🍿">🍿</option>
                  <option value="💰">💰</option>
                  <option value="💻">💻</option>
                  <option value="🏡">🏡</option>
                </select>

                <button
                  type="submit"
                  disabled={loading}
                  className="p-2 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl flex items-center justify-center transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

            <div className="flex gap-3 pt-1">
              <button
                onClick={prevStep}
                disabled={loading}
                className="flex-1 h-12 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleFinishSetup}
                disabled={loading || selectedCategoryIds.length === 0}
                className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-50 dark:text-slate-950 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Finish Setup'} <Check className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
