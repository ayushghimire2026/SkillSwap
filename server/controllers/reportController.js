const Report = require('../models/Report');

// @desc    Create a report
// @route   POST /api/reports
const createReport = async (req, res, next) => {
  try {
    const { reportedUser, reason, description } = req.body;

    if (reportedUser === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot report yourself' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser,
      reason,
      description,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReport };
