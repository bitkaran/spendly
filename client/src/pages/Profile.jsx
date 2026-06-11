import React, { useState, useEffect } from 'react';
import { User, LogOut, Download, Moon, Sun, Plus, Trash2, Tag, ShieldCheck } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

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
    <div className="p-5 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
          Profile Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
          Manage your account & options
        </p>
      </div>

      {/* Profile summary card */}
      {user && (
        <div className="bg-gradient-to-tr from-primary-600 to-indigo-500 text-white p-5 rounded-3xl shadow-lg flex items-center gap-4 relative overflow-hidden">
          <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-black font-sans">
            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold flex items-center gap-1.5 leading-none">
              {user.name}
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-200 fill-indigo-200/10" />
            </h3>
            <p className="text-xs text-indigo-100 font-medium">{user.email}</p>
          </div>
        </div>
      )}

      {/* Category Management Drawer */}
      <div className="bg-white dark:bg-darkCard p-5 border border-slate-200/60 dark:border-darkBorder/40 rounded-3xl shadow-premium dark:shadow-premium-dark space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-350 uppercase tracking-wider flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary-500" />
          Manage Categories
        </h3>

        {/* Add category form */}
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            placeholder="New custom category..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-darkBorder/40 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold"
            required
            disabled={addingCategory}
          />
          <button
            type="submit"
            disabled={addingCategory}
            className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition shadow-sm shadow-primary-500/10"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </button>
        </form>

        {/* List of categories */}
        <div className="max-h-52 overflow-y-auto no-scrollbar border border-slate-200/50 dark:border-darkBorder/40 rounded-2xl divide-y divide-slate-100 dark:divide-darkBorder/25">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="px-3 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/10"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    cat.type === 'default' ? 'bg-primary-500' : 'bg-amber-500'
                  }`}
                />
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {cat.name}
                </span>
                {cat.type === 'default' && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase">
                    System
                  </span>
                )}
              </div>

              {cat.type === 'custom' && (
                <button
                  onClick={() => handleDeleteCatRequest(cat)}
                  className="p-1 rounded bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 border border-slate-100 dark:border-transparent transition"
                  title="Delete Category"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white dark:bg-darkCard p-5 border border-slate-200/60 dark:border-darkBorder/40 rounded-3xl shadow-premium dark:shadow-premium-dark divide-y divide-slate-100 dark:divide-darkBorder/30">
        {/* Theme Toggler row */}
        <div className="py-3 flex items-center justify-between first:pt-0">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Dark Display Theme</span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Toggle interface design mode</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-darkBorder/30 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {darkMode ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-indigo-400" />}
          </button>
        </div>

        {/* Data export backup */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Export All Data</span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Download full JSON data backup</span>
          </div>
          <button
            onClick={handleExportAllData}
            className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-darkBorder/30 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition"
          >
            <Download className="h-3.5 w-3.5" />
            Backup JSON
          </button>
        </div>

        {/* Logout Option */}
        <div className="py-3 flex items-center justify-between last:pb-0">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Sign Out Session</span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Log out of this device safely</span>
          </div>
          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200/20 dark:border-red-900/10 rounded-xl text-xs font-bold flex items-center gap-1 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Footer Branding Info */}
      <div className="text-center space-y-1 py-4">
        <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-600 font-sans tracking-widest">
          SPENDLY
        </h4>
        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-650 mt-0.5">
          Version 1.0.0 &bull; Build Stable
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
