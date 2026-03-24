const Review = require('../models/Review');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const { recalculateReputation, awardXP, XP_REWARDS } = require('../services/gamificationService');

// @desc    Submit a review
// @route   POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { session: sessionId, rating, comment } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed sessions' });
    }

    const isParticipant =
      session.requester.toString() === req.user._id.toString() ||
      session.provider.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const reviewee = session.requester.toString() === req.user._id.toString()
      ? session.provider : session.requester;

    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      session: sessionId,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You already reviewed this session' });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee,
      session: sessionId,
      rating,
      comment,
    });

    // Recalculate reputation
    await recalculateReputation(reviewee);

    // Award XP
    await awardXP(req.user._id, XP_REWARDS.REVIEW_GIVEN, 'review_given');
    await awardXP(reviewee, XP_REWARDS.REVIEW_RECEIVED, 'review_received');

    // Notify reviewee
    await Notification.create({
      user: reviewee,
      type: 'new_review',
      message: `${req.user.name} left you a ${rating}-star review!`,
      data: { reviewId: review._id, rating },
    });

    const populated = await review.populate([
      { path: 'reviewer', select: 'name avatar' },
      { path: 'reviewee', select: 'name avatar' },
    ]);

    res.status(201).json({ success: true, review: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/:userId
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      reviews,
      count: reviews.length,
      averageRating: parseFloat(avgRating),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getUserReviews };
