import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null indicates a system default category
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['default', 'custom'],
      default: 'custom',
    },
    icon: {
      type: String,
      default: '🏷️',
    },
    color: {
      type: String,
      default: '#8395a7',
    },
    transactionType: {
      type: String,
      enum: ['expense', 'income', 'transfer'],
      default: 'expense',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate category names for the same user
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
