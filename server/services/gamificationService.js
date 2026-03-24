const User = require('../models/User');
const Notification = require('../models/Notification');

const BADGE_DEFINITIONS = [
  { name: 'First Steps', icon: '🌱', condition: (user) => user.sessionsCompleted >= 1, xpReward: 50 },
  { name: 'Skill Sharer', icon: '🤝', condition: (user) => user.sessionsCompleted >= 5, xpReward: 100 },
  { name: 'Mentor', icon: '🎓', condition: (user) => user.sessionsCompleted >= 10, xpReward: 200 },
  { name: 'Master Trader', icon: '⭐', condition: (user) => user.sessionsCompleted >= 25, xpReward: 500 },
  { name: 'Legend', icon: '👑', condition: (user) => user.sessionsCompleted >= 50, xpReward: 1000 },
  { name: 'Well Reviewed', icon: '💬', condition: (user) => user.reputation >= 20, xpReward: 100 },
  { name: 'Top Rated', icon: '🏆', condition: (user) => user.reputation >= 50, xpReward: 250 },
  { name: 'Versatile', icon: '🎨', condition: (user) => user.skillsOffered.length >= 5, xpReward: 150 },
  { name: 'Portfolio Pro', icon: '📁', condition: (user) => user.portfolio.length >= 3, xpReward: 75 },
];

const XP_REWARDS = {
  SESSION_COMPLETED: 25,
  REVIEW_GIVEN: 10,
  REVIEW_RECEIVED: 5,
  PROFILE_COMPLETED: 50,
};

/**
 * Award XP to a user and check for new badges
 */
const awardXP = async (userId, amount, reason) => {
  const user = await User.findById(userId);
  if (!user) return;

  user.xp += amount;
  
  // Check for new badges using the already fetched user object
  await checkBadges(user);
  
  await user.save();
  return user;
};

/**
 * Check and award badges based on current stats
 */
const checkBadges = async (user) => {
  if (!user) return;

  const existingBadgeNames = user.badges.map(b => b.name);
  const newBadges = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (!existingBadgeNames.includes(badge.name) && badge.condition(user)) {
      user.badges.push({
        name: badge.name,
        icon: badge.icon,
        earnedAt: new Date(),
      });
      user.xp += badge.xpReward;
      newBadges.push(badge);
    }
  }

  if (newBadges.length > 0) {
    // Send notification for each new badge
    for (const badge of newBadges) {
      await Notification.create({
        user: user._id,
        type: 'badge_earned',
        message: `You earned the "${badge.name}" ${badge.icon} badge! +${badge.xpReward} XP`,
        data: { badge: badge.name, icon: badge.icon, xp: badge.xpReward },
      });
    }
  }

  return newBadges;
};

/**
 * Recalculate user reputation from their reviews
 */
const recalculateReputation = async (userId) => {
  const Review = require('../models/Review');
  const reviews = await Review.find({ reviewee: userId });

  if (reviews.length === 0) return 0;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const reputation = Math.round(avgRating * reviews.length * 2);

  await User.findByIdAndUpdate(userId, { reputation });

  return reputation;
};

/**
 * Handle session completion gamification
 */
const onSessionCompleted = async (requesterId, providerId) => {
  // Increment sessions completed
  await User.findByIdAndUpdate(requesterId, { $inc: { sessionsCompleted: 1 } });
  await User.findByIdAndUpdate(providerId, { $inc: { sessionsCompleted: 1 } });

  // Award XP
  await awardXP(requesterId, XP_REWARDS.SESSION_COMPLETED, 'session_completed');
  await awardXP(providerId, XP_REWARDS.SESSION_COMPLETED, 'session_completed');
};

module.exports = {
  awardXP,
  checkBadges,
  recalculateReputation,
  onSessionCompleted,
  XP_REWARDS,
  BADGE_DEFINITIONS,
};
