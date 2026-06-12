import Category from '../models/Category.js';

export const defaultCategories = [
  // Expenses
  { name: 'Food & Dining', icon: '🍔', color: '#ff9f43', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Transport', icon: '🚗', color: '#54a0ff', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Shopping', icon: '🛍️', color: '#ee5253', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Bills & Utilities', icon: '⚡', color: '#feca57', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Rent / Housing', icon: '🏠', color: '#ff9f43', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Health & Medical', icon: '🏥', color: '#10ac84', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Education', icon: '🎓', color: '#5f27cd', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Entertainment', icon: '🎬', color: '#ff6b6b', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Travel', icon: '✈️', color: '#00d2d3', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Groceries', icon: '🛒', color: '#1dd1a1', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Subscriptions', icon: '📱', color: '#576574', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Family', icon: '👨‍👩‍👧‍👦', color: '#ff9ff3', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Gifts & Donations', icon: '🎁', color: '#ff4d4d', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Personal Care', icon: '💅', color: '#ff9ff3', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Business', icon: '💼', color: '#341f97', transactionType: 'expense', type: 'default', isDefault: true },
  { name: 'Other', icon: '🏷️', color: '#8395a7', transactionType: 'expense', type: 'default', isDefault: true },

  // Income
  { name: 'Salary', icon: '💰', color: '#10ac84', transactionType: 'income', type: 'default', isDefault: true },
  { name: 'Freelance', icon: '💻', color: '#00d2d3', transactionType: 'income', type: 'default', isDefault: true },
  { name: 'Business Income', icon: '📈', color: '#1dd1a1', transactionType: 'income', type: 'default', isDefault: true },
  { name: 'Gift', icon: '🎁', color: '#ff9f43', transactionType: 'income', type: 'default', isDefault: true },
  { name: 'Refund', icon: '🔄', color: '#54a0ff', transactionType: 'income', type: 'default', isDefault: true },
  { name: 'Investment Return', icon: '📊', color: '#5f27cd', transactionType: 'income', type: 'default', isDefault: true },
  { name: 'Other Income', icon: '💵', color: '#10ac84', transactionType: 'income', type: 'default', isDefault: true }
];

export const seedCategories = async () => {
  try {
    const count = await Category.countDocuments({ userId: null });
    if (count === 0) {
      console.log('[Spendly Seeder] Seeding default categories...');
      await Category.insertMany(defaultCategories.map(cat => ({ ...cat, userId: null })));
      console.log('[Spendly Seeder] Seeding complete.');
    }
  } catch (error) {
    console.error('[Spendly Seeder] Error seeding categories:', error);
  }
};
