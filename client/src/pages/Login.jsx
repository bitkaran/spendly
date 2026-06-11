import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email is required');
      return;
    }
    if (!password) {
      toast.error('Password is required');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('spendly_token', token);
      localStorage.setItem('spendly_user', JSON.stringify(user));
      
      toast.success('Logged in successfully!');
      onLoginSuccess(user);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const errResponse = error.response;
      
      if (errResponse && errResponse.status === 403 && errResponse.data.isVerified === false) {
        // Redirect to OTP verification
        toast.error(errResponse.data.message || 'Please verify your email OTP');
        navigate('/verify-otp', { state: { email: email } });
      } else {
        toast.error(errResponse?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-center px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Log in to your Spendly account to continue
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
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-darkBorder/60 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-tr from-primary-600 to-indigo-500 hover:from-primary-500 hover:to-indigo-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8 font-medium">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-bold text-primary-600 dark:text-primary-400 hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default Login;
