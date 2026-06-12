import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    currencyCode: {
      type: String,
      default: 'INR',
    },
    currencySymbol: {
      type: String,
      default: '₹',
    },
    monthlyBudget: {
      type: Number,
      default: 0,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    themePreference: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    locale: {
      type: String,
      default: 'en-IN',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    preferredCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
