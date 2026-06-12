import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Category from '../models/Category.js';

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your_super_secret_jwt_passphrase_here',
    { expiresIn: '30d' }
  );
};

// @desc    Register new user & auto-login
// @route   POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Account with this email already exists' });
    }

    // Create new user (automatically verified)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      isVerified: true,
      otp: null,
      otpExpires: null,
    });

    const token = generateToken(newUser._id);

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isVerified: true,
        currencyCode: newUser.currencyCode,
        currencySymbol: newUser.currencySymbol,
        monthlyBudget: newUser.monthlyBudget,
        onboardingCompleted: newUser.onboardingCompleted,
        themePreference: newUser.themePreference,
      },
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    return res.status(500).json({ message: `Signup failed: ${error.message}` });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true,
        currencyCode: user.currencyCode,
        currencySymbol: user.currencySymbol,
        monthlyBudget: user.monthlyBudget,
        onboardingCompleted: user.onboardingCompleted,
        themePreference: user.themePreference,
        locale: user.locale,
        timezone: user.timezone,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: `Login failed: ${error.message}` });
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isVerified: true,
        currencyCode: req.user.currencyCode,
        currencySymbol: req.user.currencySymbol,
        monthlyBudget: req.user.monthlyBudget,
        onboardingCompleted: req.user.onboardingCompleted,
        themePreference: req.user.themePreference,
        locale: req.user.locale,
        timezone: req.user.timezone,
      },
    });
  } catch (error) {
    console.error('Get me error:', error.message);
    return res.status(500).json({ message: `Session verification failed: ${error.message}` });
  }
};
