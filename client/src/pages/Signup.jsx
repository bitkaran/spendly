import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Signup = ({ onLoginSuccess, darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!name || name.trim() === '') {
      toast.error('Name is required');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/signup', { name, email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('spendly_token', token);
      localStorage.setItem('spendly_user', JSON.stringify(user));

      toast.success('Account created successfully!');
      
      onLoginSuccess(user);
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      const errResponse = error.response;
      // Expose the backend message directly if it exists, otherwise generic fallback
      toast.error(errResponse?.data?.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen sm:min-h-[750px] flex flex-col justify-between px-6 py-8 relative bg-white dark:bg-darkBg transition-colors duration-300">
      
      {/* Floating Theme Switcher */}
      <div className="absolute top-5 right-5 z-50">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-2xl bg-slate-50 dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5 text-yellow-500" /> : <Moon className="h-4.5 w-4.5 text-indigo-400" />}
        </button>
      </div>

      {/* Top Header Logo section */}
      <div className="flex-1 flex flex-col justify-center items-center mt-12 mb-6">
        <div className="h-16 w-16 rounded-[22px] bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-black font-sans shadow-lg shadow-indigo-500/20 transform rotate-3 hover:rotate-0 transition duration-300 mb-6">
          S
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight leading-tight">
          Create Account
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold tracking-wide uppercase">
          Join Spendly & build smart savings habits
        </p>
      </div>

      {/* Signup form Card */}
      <div className="bg-slate-50/50 dark:bg-darkCard/50 border border-slate-100 dark:border-darkBorder/30 rounded-3xl p-6 shadow-sm mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-455 dark:text-slate-500">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 pr-4 h-12 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-darkBorder/60 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-455 dark:text-slate-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 h-12 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-darkBorder/60 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-455 dark:text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-11 h-12 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-darkBorder/60 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-455 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-355"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-13 bg-gradient-to-tr from-primary-600 to-indigo-500 hover:from-primary-500 hover:to-indigo-400 text-white font-bold rounded-2xl shadow-md shadow-primary-500/10 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none text-xs tracking-wider uppercase flex items-center justify-center"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>

      {/* Footer navigation */}
      <div className="text-center pb-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-extrabold text-primary-600 dark:text-primary-400 hover:underline ml-1"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
