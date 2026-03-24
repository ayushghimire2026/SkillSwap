const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Get user profile
// @route   GET /api/users/:id
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user: user.toProfileJSON() });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'bio', 'location', 'skillsOffered', 'skillsWanted', 'availability'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user: user.toProfileJSON() });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload portfolio files
// @route   POST /api/users/portfolio
const uploadPortfolio = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const user = await User.findById(req.user._id);
    const newFiles = [];

    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      !process.env.CLOUDINARY_CLOUD_NAME.startsWith('your_') &&
      process.env.CLOUDINARY_API_KEY &&
      !process.env.CLOUDINARY_API_KEY.startsWith('your_');

    for (const file of req.files) {
      let fileData;

      if (isCloudinaryConfigured) {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'skillswap/portfolios',
          resource_type: 'auto',
        });
        fileData = {
          url: result.secure_url,
          publicId: result.public_id,
          type: file.mimetype.startsWith('image') ? 'image' : file.mimetype.startsWith('video') ? 'video' : 'document',
          title: req.body.title || file.originalname,
        };
        // Remove local file after upload
        fs.unlinkSync(file.path);
      } else {
        // Local storage fallback
        fileData = {
          url: `/uploads/${file.filename}`,
          publicId: file.filename,
          type: file.mimetype.startsWith('image') ? 'image' : file.mimetype.startsWith('video') ? 'video' : 'document',
          title: req.body.title || file.originalname,
        };
      }

      newFiles.push(fileData);
    }

    user.portfolio.push(...newFiles);
    await user.save();

    res.json({ success: true, portfolio: user.portfolio });
  } catch (error) {
    next(error);
  }
};

// @desc    Update avatar
// @route   PUT /api/users/avatar
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      !process.env.CLOUDINARY_CLOUD_NAME.startsWith('your_') &&
      process.env.CLOUDINARY_API_KEY &&
      !process.env.CLOUDINARY_API_KEY.startsWith('your_');

    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'skillswap/avatars',
        width: 300,
        height: 300,
        crop: 'fill',
        gravity: 'face',
      });
      avatarUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    } else {
      avatarUrl = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.json({ success: true, avatar: user.avatar });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const { sort = 'xp', limit = 20 } = req.query;
    const sortField = sort === 'reputation' ? { reputation: -1 } : { xp: -1 };

    const users = await User.find({ isBanned: false })
      .sort(sortField)
      .limit(parseInt(limit))
      .select('name avatar xp reputation badges sessionsCompleted skillsOffered');

    res.json({ success: true, leaderboard: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete portfolio item
// @route   DELETE /api/users/portfolio/:itemId
const deletePortfolioItem = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const item = user.portfolio.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    if (process.env.CLOUDINARY_CLOUD_NAME && item.publicId) {
      await cloudinary.uploader.destroy(item.publicId);
    }

    user.portfolio.pull(req.params.itemId);
    await user.save();

    res.json({ success: true, portfolio: user.portfolio });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  uploadPortfolio,
  updateAvatar,
  getLeaderboard,
  deletePortfolioItem,
};
