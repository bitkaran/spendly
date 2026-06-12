import Category from '../models/Category.js';
import User from '../models/User.js';

// @desc    Get user categories (includes default ones and user-specific custom ones)
// @route   GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    let query = { isArchived: { $ne: true } };

    if (user && user.preferredCategories && user.preferredCategories.length > 0) {
      // If user has set preferred categories, return those global categories + user custom categories
      query.$or = [
        { _id: { $in: user.preferredCategories } },
        { userId: userId }
      ];
    } else {
      // Fallback for existing users: return user custom/seeded categories + global defaults
      query.$or = [
        { userId: userId },
        { userId: null, isDefault: true }
      ];
    }

    const categories = await Category.find(query).sort({ isDefault: -1, sortOrder: 1, name: 1 });
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Get categories error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Create a custom category
// @route   POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, icon, color, transactionType } = req.body;
    const userId = req.user._id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Check if duplicate category exists for this user (either custom or global default)
    const duplicate = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      $or: [{ userId: null }, { userId }],
      isArchived: { $ne: true }
    });

    if (duplicate) {
      return res.status(400).json({ message: `Category "${trimmedName}" already exists` });
    }

    const category = await Category.create({
      userId,
      name: trimmedName,
      type: 'custom',
      icon: icon || '🏷️',
      color: color || '#8395a7',
      transactionType: transactionType || 'expense',
      isDefault: false
    });

    // Also automatically add to user's preferredCategories so it displays
    await User.findByIdAndUpdate(userId, {
      $addToSet: { preferredCategories: category._id }
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Update a custom category
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { name, icon, color, transactionType } = req.body;
    const userId = req.user._id;

    const category = await Category.findOne({ _id: req.params.id, userId });

    if (!category) {
      return res.status(404).json({ message: 'Custom category not found or is a system category' });
    }

    if (name) {
      const trimmedName = name.trim();
      if (trimmedName !== '') {
        // Check duplicate name
        const duplicate = await Category.findOne({
          _id: { $ne: req.params.id },
          name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
          $or: [{ userId: null }, { userId }],
          isArchived: { $ne: true }
        });

        if (duplicate) {
          return res.status(400).json({ message: `Category "${trimmedName}" already exists` });
        }
        category.name = trimmedName;
      }
    }

    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (transactionType !== undefined) category.transactionType = transactionType;

    await category.save();

    return res.status(200).json(category);
  } catch (error) {
    console.error('Update category error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Delete/Archive a custom category
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find custom category belonging to user
    const category = await Category.findOne({ _id: req.params.id, userId });

    if (!category) {
      // If it's a global category, the user might want to remove it from their preferred list
      const user = await User.findById(userId);
      if (user && user.preferredCategories.includes(req.params.id)) {
        user.preferredCategories = user.preferredCategories.filter(id => id.toString() !== req.params.id);
        await user.save();
        return res.status(200).json({ message: 'Category removed from preferences' });
      }
      return res.status(404).json({ message: 'Category not found in your account' });
    }

    // Soft-delete: archive to preserve history
    category.isArchived = true;
    await category.save();

    // Also remove from User's preferredCategories
    await User.findByIdAndUpdate(userId, {
      $pull: { preferredCategories: req.params.id }
    });

    return res.status(200).json({ message: 'Category archived successfully' });
  } catch (error) {
    console.error('Delete category error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
