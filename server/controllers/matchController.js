const { findMatches } = require('../services/matchingService');

// @desc    Get skill-compatible matches for current user
// @route   GET /api/matches
const getMatches = async (req, res, next) => {
  try {
    const matches = await findMatches(req.user._id);
    res.json({ success: true, matches, count: matches.length });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMatches };
