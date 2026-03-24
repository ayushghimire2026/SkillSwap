const User = require('../models/User');
const Session = require('../models/Session');
const Report = require('../models/Report');
const Review = require('../models/Review');

// @desc    Get all users (admin)
// @route   GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users: users.map(u => u.toProfileJSON()),
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ban/unban user
// @route   PUT /api/admin/users/:id/ban
const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot ban an admin' });

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully',
      user: user.toProfileJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify user
// @route   PUT /api/admin/users/:id/verify
const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ success: true, message: 'User verified', user: user.toProfileJSON() });
  } catch (error) {
    next(error);
  }
};

// @desc    Platform analytics
// @route   GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isOnline: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'completed' });
    const pendingSessions = await Session.countDocuments({ status: 'pending' });
    const totalReviews = await Review.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    // Recent signups (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSignups = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    // Top skills
    const topSkills = await User.aggregate([
      { $unwind: '$skillsOffered' },
      { $group: { _id: '$skillsOffered.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        bannedUsers,
        totalSessions,
        completedSessions,
        pendingSessions,
        totalReviews,
        pendingReports,
        recentSignups,
        topSkills,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports
// @route   GET /api/admin/reports
const getReports = async (req, res, next) => {
  try {
    const { status = '' } = req.query;
    const query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reporter', 'name avatar email')
      .populate('reportedUser', 'name avatar email')
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status
// @route   PUT /api/admin/reports/:id
const updateReport = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    ).populate('reporter', 'name').populate('reportedUser', 'name');

    if (!report) return res.status(404).json({ message: 'Report not found' });

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, toggleBanUser, verifyUser, getAnalytics, getReports, updateReport };
