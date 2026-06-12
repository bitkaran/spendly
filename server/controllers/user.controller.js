import User from '../models/User.js';

// @desc    Get user settings
// @route   GET /api/user/settings
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('preferredCategories');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      currencyCode: user.currencyCode || 'INR',
      currencySymbol: user.currencySymbol || '₹',
      monthlyBudget: user.monthlyBudget || 0,
      onboardingCompleted: user.onboardingCompleted || false,
      themePreference: user.themePreference || 'light',
      locale: user.locale || 'en-IN',
      timezone: user.timezone || 'Asia/Kolkata',
      preferredCategories: user.preferredCategories || [],
    });
  } catch (error) {
    console.error('Get settings error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Update user settings
// @route   PUT /api/user/settings
export const updateSettings = async (req, res) => {
  try {
    const {
      currencyCode,
      currencySymbol,
      monthlyBudget,
      onboardingCompleted,
      themePreference,
      locale,
      timezone,
      preferredCategories
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currencyCode !== undefined) user.currencyCode = currencyCode;
    if (currencySymbol !== undefined) user.currencySymbol = currencySymbol;
    if (monthlyBudget !== undefined) user.monthlyBudget = Number(monthlyBudget);
    if (onboardingCompleted !== undefined) user.onboardingCompleted = !!onboardingCompleted;
    if (themePreference !== undefined) user.themePreference = themePreference;
    if (locale !== undefined) user.locale = locale;
    if (timezone !== undefined) user.timezone = timezone;
    if (preferredCategories !== undefined) user.preferredCategories = preferredCategories;

    await user.save();

    return res.status(200).json({
      message: 'Settings updated successfully',
      settings: {
        currencyCode: user.currencyCode,
        currencySymbol: user.currencySymbol,
        monthlyBudget: user.monthlyBudget,
        onboardingCompleted: user.onboardingCompleted,
        themePreference: user.themePreference,
        locale: user.locale,
        timezone: user.timezone,
        preferredCategories: user.preferredCategories,
      },
    });
  } catch (error) {
    console.error('Update settings error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
