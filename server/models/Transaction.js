import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      default: 'expense',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    remark: {
      type: String,
      default: '',
      trim: true,
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Wallet', 'Other'],
      default: 'Cash',
    },
    merchant: {
      type: String,
      default: '',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'none'],
      default: 'none',
    },
    nextDueDate: {
      type: Date,
      default: null,
    },
    autoCreate: {
      type: Boolean,
      default: false,
    },
    attachment: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'expenses', // Explicitly map to existing collection to keep old data intact
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
