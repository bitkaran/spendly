import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Category from '../models/Category.js';
import { generateOTP, sendOTPEmail, sendForgotPasswordEmail } from '../utils/otp.js';

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your_super_secret_jwt_passphrase_here',
    { expiresIn: '30d' }
  );
};

// @desc    Register new user
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
      if (existingUser.isVerified) {
        return res.status(400).json({ message: 'Account with this email already exists' });
      } else {
        // User registered but not verified. Let's update details and send a new OTP
        const salt = await bcrypt.genSalt(10);
        existingUser.passwordHash = await bcrypt.hash(password, salt);
        existingUser.name = name;
        existingUser.otp = generateOTP();
        existingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await existingUser.save();
        await sendOTPEmail(existingUser.email, existingUser.name, existingUser.otp);

        const responsePayload = {
          message: 'Verification OTP sent to email. Please verify your account.',
          email: existingUser.email,
        };

        if (process.env.NODE_ENV === 'development') {
          responsePayload.otp = existingUser.otp; // Return OTP in dev mode only
        }

        return res.status(200).json(responsePayload);
      }
    }

    // Create new user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      isVerified: false,
      otp,
      otpExpires,
    });

    await sendOTPEmail(newUser.email, newUser.name, newUser.otp);

    const responsePayload = {
      message: 'Registration successful! Verification OTP sent to email.',
      email: newUser.email,
    };

    if (process.env.NODE_ENV === 'development') {
      responsePayload.otp = newUser.otp; // Return OTP in dev mode only
    }

    return res.status(201).json(responsePayload);
  } catch (error) {
    console.error('Signup error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    // Check OTP validity
    if (user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Mark as verified and clear OTP
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Seed default categories for this user if not already seeded
    const defaultCategoriesList = [
      'Coming Auto',
      'Coming Metro',
      'Return Auto',
      'Return Metro',
      'Lunch',
      'Dinner',
      'Snacks / Tea',
      'Other'
    ];

    const existingCategories = await Category.find({ userId: user._id });
    if (existingCategories.length === 0) {
      const categoryDocs = defaultCategoriesList.map((cat) => ({
        userId: user._id,
        name: cat,
        type: 'default',
      }));
      await Category.insertMany(categoryDocs);
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: 'Account verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
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

    // Check if user is verified
    if (!user.isVerified) {
      // Send a fresh OTP if login attempted on unverified account
      user.otp = generateOTP();
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();
      await sendOTPEmail(user.email, user.name, user.otp);

      const responsePayload = {
        message: 'Account not verified. A fresh OTP has been sent to your email.',
        isVerified: false,
        email: user.email,
      };

      if (process.env.NODE_ENV === 'development') {
        responsePayload.otp = user.otp;
      }

      return res.status(403).json(responsePayload);
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Forgot Password OTP request
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // For security, don't explicitly leak user existence, but since it is a private expense app, we can provide a clear error message.
      return res.status(404).json({ message: 'No account registered with this email address' });
    }

    // Generate forgot password OTP
    user.otp = generateOTP();
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendForgotPasswordEmail(user.email, user.name, user.otp);

    const responsePayload = {
      message: 'Password reset OTP sent to your email.',
      email: user.email,
    };

    if (process.env.NODE_ENV === 'development') {
      responsePayload.otp = user.otp;
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Reset Password using OTP
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields (email, OTP, new password) are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check OTP
    if (user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true; // Mark verified if resetting password
    await user.save();

    return res.status(200).json({ message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    // req.user was set in protect middleware
    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isVerified: req.user.isVerified,
      },
    });
  } catch (error) {
    console.error('Get me error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
