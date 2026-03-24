const User = require('../models/User');

/**
 * Smart matching algorithm:
 * - Computes skill compatibility (what user A offers matches what user B wants, and vice versa)
 * - Factors in availability overlap
 * - Applies reputation bonus
 * Returns sorted matches with score breakdown
 */
const findMatches = async (userId) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) throw new Error('User not found');

  const offeredSkillNames = currentUser.skillsOffered.map(s => s.name.toLowerCase());
  const wantedSkillNames = currentUser.skillsWanted.map(s => s.name.toLowerCase());

  if (offeredSkillNames.length === 0 && wantedSkillNames.length === 0) {
    return [];
  }

  // Find users who either offer what current user wants, or want what current user offers
  const potentialMatches = await User.find({
    _id: { $ne: userId },
    isBanned: false,
    $or: [
      { 'skillsOffered.name': { $in: wantedSkillNames.map(n => new RegExp(n, 'i')) } },
      { 'skillsWanted.name': { $in: offeredSkillNames.map(n => new RegExp(n, 'i')) } },
    ],
  }).limit(100);

  const scoredMatches = potentialMatches.map(match => {
    const score = calculateMatchScore(currentUser, match);
    return { user: match.toProfileJSON(), ...score };
  });

  // Sort by total score descending
  scoredMatches.sort((a, b) => b.totalScore - a.totalScore);

  return scoredMatches.slice(0, 20);
};

const calculateMatchScore = (userA, userB) => {
  const aOffered = userA.skillsOffered.map(s => s.name.toLowerCase());
  const aWanted = userA.skillsWanted.map(s => s.name.toLowerCase());
  const bOffered = userB.skillsOffered.map(s => s.name.toLowerCase());
  const bWanted = userB.skillsWanted.map(s => s.name.toLowerCase());

  // Skill compatibility: A offers what B wants & B offers what A wants
  const aToB = aOffered.filter(skill => bWanted.includes(skill));
  const bToA = bOffered.filter(skill => aWanted.includes(skill));

  const skillScore = ((aToB.length + bToA.length) / Math.max(aWanted.length + bWanted.length, 1)) * 50;

  // Availability overlap
  const availScore = calculateAvailabilityOverlap(userA.availability, userB.availability) * 25;

  // Reputation bonus (0-25)
  const repScore = Math.min((userB.reputation / 100) * 25, 25);

  const totalScore = Math.round(skillScore + availScore + repScore);

  return {
    totalScore: Math.min(totalScore, 100),
    skillScore: Math.round(skillScore),
    availabilityScore: Math.round(availScore),
    reputationScore: Math.round(repScore),
    matchedSkillsAToB: aToB,
    matchedSkillsBToA: bToA,
  };
};

const calculateAvailabilityOverlap = (availA = [], availB = []) => {
  if (availA.length === 0 || availB.length === 0) return 0.5; // Neutral if not set

  let overlap = 0;
  for (const slotA of availA) {
    for (const slotB of availB) {
      if (slotA.day === slotB.day) {
        // Check time overlap
        if (slotA.startTime < slotB.endTime && slotB.startTime < slotA.endTime) {
          overlap++;
        }
      }
    }
  }

  return Math.min(overlap / Math.max(availA.length, 1), 1);
};

module.exports = { findMatches, calculateMatchScore };
