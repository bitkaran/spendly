import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      default: 'Overall', // 'Overall' means the monthly budget limit
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0.01, 'Budget amount must be positive'],
    },
    period: {
      type: String,
      enum: ['monthly'],
      default: 'monthly',
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate budget limit for same category, month, and year for the user
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
