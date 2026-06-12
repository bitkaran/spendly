import React, { useState, useEffect } from 'react';
import { User, LogOut, Download, Moon, Sun, Plus, Trash2, Tag, ShieldCheck, ChevronRight, Info } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import SpendlyLogo from '../components/SpendlyLogo';

const Profile = ({ onLogout, darkMode, toggleDarkMode, categories = [], onCategoryChange }) => {
  const [user, setUser] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  // Category deletion state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('spendly_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      setAddingCategory(true);
      const name = newCategoryName.trim();
      
      await api.post('/categories', { name });
      toast.success(`Category "${name}" created successfully`);
      setNewCategoryName('');
      onCategoryChange(); // Refresh categories across app
    } catch (error) {
      console.error('Add category error:', error);
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCatRequest = (cat) => {
    if (cat.type === 'default') {
      toast.error('Cannot delete default system categories');
      return;
    }
    setCatToDelete(cat);
    setIsConfirmOpen(true);
  };

  const handleConfirmDeleteCat = async () => {
    if (!catToDelete) return;
    try {
      await api.delete(`/categories/${catToDelete._id}`);
      toast.success('Category deleted successfully');
      setIsConfirmOpen(false);
      setCatToDelete(null);
      onCategoryChange(); // Refresh categories
    } catch (error) {
      console.error('Delete category error:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleExportAllData = async () => {
    try {
      toast.loading('Exporting all data...', { id: 'data-export' });
      
      // Fetch all user expenses and categories
      const [expensesRes, categoriesRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/categories')
      ]);

      const backupData = {
        exportedAt: new Date().toISOString(),
        user: user,
        categories: categoriesRes.data,
        expenses: expensesRes.data,
        app: 'Spendly',
        version: '1.0.0'
      };

      // Create browser local download file trigger
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      downloadAnchor.setAttribute('download', `spendly-all-data-${dateStr}.json`);
      
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      toast.success('All data exported to JSON!', { id: 'data-export' });
    } catch (error) {
      console.error('Export all data error:', error);
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

      {/* Profile summary card */}
      {user && (
        <div className="bg-white dark:bg-darkCard p-4 rounded-3xl border border-slate-100 dark:border-darkBorder/40 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-black text-xl flex items-center justify-center shadow-md">
            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
              {user.name}
              <ShieldCheck className="h-4.5 w-4.5 text-primary-500 fill-primary-500/10" />
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1.5">{user.email}</p>
          </div>
        </div>
      )}

      {/* Category Management Section */}
      <div className="bg-white dark:bg-darkCard p-4.5 border border-slate-100 dark:border-darkBorder/30 rounded-3xl shadow-sm space-y-3.5">
        <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-primary-500" />
          Manage Categories
        </h3>

        {/* Add category form */}
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            placeholder="Create custom category..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-darkBorder/60 rounded-xl text-slate-900 dark:text-white placeholder-slate-405 focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold"
            required
            disabled={addingCategory}
          />
          <button
            type="submit"
            disabled={addingCategory}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl flex items-center justify-center transition shadow-sm"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </button>
        </form>

        {/* List of categories with fixed heights to avoid nav overlap */}
        <div className="max-h-44 overflow-y-auto no-scrollbar border border-slate-100 dark:border-darkBorder/25 rounded-2xl divide-y divide-slate-100 dark:divide-darkBorder/25 bg-slate-50/10 dark:bg-slate-900/10">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="px-3 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/5 font-bold"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    cat.type === 'default' ? 'bg-primary-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-slate-700 dark:text-slate-200">
                  {cat.name}
                </span>
                {cat.type === 'default' && (
                  <span className="text-[7px] px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-900 text-slate-450 dark:text-slate-500 font-extrabold tracking-wider uppercase border border-slate-100/50 dark:border-darkBorder/15">
                    System
                  </span>
                )}
              </div>

              {cat.type === 'custom' && (
                <button
                  onClick={() => handleDeleteCatRequest(cat)}
                  className="p-1 rounded bg-slate-50 dark:bg-slate-900 text-slate-450 hover:text-red-500 border border-slate-100/30 dark:border-transparent transition"
                  title="Delete Category"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preferences Section - Native Settings List Style */}
      <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/30 rounded-3xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-darkBorder/25">
        
        {/* Theme Toggler row */}
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

        {/* Data export backup */}
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

      {/* App Branding Card */}
      <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/30 rounded-3xl p-4.5 shadow-sm flex items-center gap-3.5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-16 h-16 bg-primary-500/5 rounded-bl-full pointer-events-none" />
        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-darkBorder/20">
          <SpendlyLogo size={32} />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 leading-none font-sans">
            Spendly Tracker
            <span className="text-[7px] px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 font-extrabold tracking-wider uppercase border border-primary-200/10">v1.0.0</span>
          </h4>
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed pt-0.5">
            A minimalist premium personal finance manager.
          </p>
        </div>
      </div>

      {/* Footer Branding Info */}
      <div className="text-center space-y-1 py-3">
        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-700 uppercase tracking-widest leading-none">
          Spendly Expense Tracker &bull; Stable Build
        </p>
      </div>

      {/* Category deletion ConfirmModal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Custom Category"
        message={`Are you sure you want to delete category "${catToDelete?.name}"? Tapping delete will erase the category catalog label but historical transactions under this category name will remain.`}
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
