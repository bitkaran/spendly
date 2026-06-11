import Category from '../models/Category.js';

// @desc    Get user categories (includes default ones and user-specific custom ones)
// @route   GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch default categories (userId: null) AND user custom categories (userId: userId)
    const categories = await Category.find({
      $or: [{ userId: null }, { userId }],
    }).sort({ type: 1, name: 1 }); // Default first, then alphabetical

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
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Check if duplicate category exists (either default or user's custom one)
    const duplicate = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }, // Case-insensitive match
      $or: [{ userId: null }, { userId }],
    });

    if (duplicate) {
      return res.status(400).json({ message: `Category "${trimmedName}" already exists` });
    }

    const category = await Category.create({
      userId,
      name: trimmedName,
      type: 'custom',
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
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Find custom category
    const category = await Category.findOne({ _id: req.params.id, userId });

    if (!category) {
      return res.status(404).json({ message: 'Custom category not found or is a system category' });
    }

    // Check duplicate name
    const duplicate = await Category.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      $or: [{ userId: null }, { userId }],
    });

    if (duplicate) {
      return res.status(400).json({ message: `Category "${trimmedName}" already exists` });
    }

    category.name = trimmedName;
    await category.save();

    return res.status(200).json(category);
  } catch (error) {
    console.error('Update category error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Delete a custom category
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Verify it is a custom category belonging to user
    const category = await Category.findOne({ _id: req.params.id, userId });

    if (!category) {
      return res.status(404).json({ message: 'Category not found or is a system default category' });
    }

    await Category.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
