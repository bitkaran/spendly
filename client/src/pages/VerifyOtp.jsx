import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Mail } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const VerifyOtp = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Read email from router state if available
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email is required');
      return;
    }
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/verify-otp', { email, otp });
      
      const { token, user } = response.data;
      localStorage.setItem('spendly_token', token);
      localStorage.setItem('spendly_user', JSON.stringify(user));
      
      toast.success('Account verified successfully!');
      onLoginSuccess(user);
      navigate('/');
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error(error.response?.data?.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error('Email is required to resend OTP');
      return;
    }

    try {
      setResending(true);
      // Re-trigger signup/login flow to issue fresh OTP
      await api.post('/auth/forgot-password', { email });
      toast.success('A fresh OTP has been sent to your email.');
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to send fresh OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-center px-6 py-12">
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-100/50 dark:border-indigo-800/20 shadow-sm">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
          Verify Email
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-xs">
          Enter the 6-digit One-Time Password sent to your email address
        </p>
      </div>

      <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-6 shadow-premium dark:shadow-premium-dark">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email (Disabled or editable if entered manually) */}
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
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                required
              />
            </div>
          </div>

          {/* OTP Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              One-Time Password (OTP)
            </label>
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="block w-full px-4 py-3.5 text-center bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white font-extrabold text-2xl tracking-[10px] placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              required
              autoFocus
            />
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-tr from-primary-600 to-indigo-500 hover:from-primary-500 hover:to-indigo-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Didn't receive the email?{' '}
          <button
            type="button"
            disabled={resending}
            onClick={handleResendOtp}
            className="font-bold text-primary-600 dark:text-primary-400 hover:underline focus:outline-none disabled:opacity-50"
          >
            {resending ? 'Resending...' : 'Resend Code'}
          </button>
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30 rounded-2xl text-xs text-yellow-800 dark:text-yellow-400 font-medium max-w-xs mx-auto">
            Tip: In local development, the OTP is printed directly in the terminal server console logs.
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyOtp;
