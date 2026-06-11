import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, HelpCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/forgot-password', { email });
      toast.success(response.data.message || 'Reset OTP sent to your email.');
      
      // Navigate to reset password page, passing the email in state
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-center px-6 py-12">
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-100/50 dark:border-indigo-800/20 shadow-sm">
          <HelpCircle className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
          Forgot Password?
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-xs">
          No worries! Enter your registered email address and we'll send you an OTP to reset your password.
        </p>
      </div>

      <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-6 shadow-premium dark:shadow-premium-dark">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-tr from-primary-600 to-indigo-500 hover:from-primary-500 hover:to-indigo-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            {loading ? 'Sending OTP...' : 'Send Reset Code'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8 font-medium">
        Back to{' '}
        <Link
          to="/login"
          className="font-bold text-primary-600 dark:text-primary-400 hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
