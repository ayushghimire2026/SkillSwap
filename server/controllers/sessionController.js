const Session = require('../models/Session');
const Notification = require('../models/Notification');
const { onSessionCompleted } = require('../services/gamificationService');

// @desc    Request a session
// @route   POST /api/sessions
const createSession = async (req, res, next) => {
  try {
    const { provider, skill, date, timeSlot, notes } = req.body;

    if (provider === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot book a session with yourself' });
    }

    const providerUser = await User.findById(provider);
    if (!providerUser) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const offersSkill = providerUser.skillsOffered.some(
      (s) => s.name.toLowerCase() === skill.toLowerCase()
    );
    if (!offersSkill) {
      return res.status(400).json({ message: `Provider does not offer the skill: ${skill}` });
    }

    const session = await Session.create({
      requester: req.user._id,
      provider,
      skill,
      date,
      timeSlot,
      notes,
    });

    // Notify provider
    await Notification.create({
      user: provider,
      type: 'session_request',
      message: `${req.user.name} wants to learn ${skill} from you!`,
      data: { sessionId: session._id, requesterName: req.user.name },
    });

    const populated = await session.populate([
      { path: 'requester', select: 'name avatar' },
      { path: 'provider', select: 'name avatar' },
    ]);

    // Emit real-time notification if socket io available
    if (req.app.get('io')) {
      req.app.get('io').to(provider).emit('notification', {
        type: 'session_request',
        message: `${req.user.name} wants to learn ${skill} from you!`,
      });
    }

    res.status(201).json({ success: true, session: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user sessions
// @route   GET /api/sessions
const getSessions = async (req, res, next) => {
  try {
    const { status, role } = req.query;
    const query = {};

    if (role === 'provider') {
      query.provider = req.user._id;
    } else if (role === 'requester') {
      query.requester = req.user._id;
    } else {
      query.$or = [{ requester: req.user._id }, { provider: req.user._id }];
    }

    if (status) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate('requester', 'name avatar')
      .populate('provider', 'name avatar')
      .sort({ date: -1 });

    res.json({ success: true, sessions, count: sessions.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve session
// @route   PUT /api/sessions/:id/approve
const approveSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the provider can approve sessions' });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({ message: 'Session is not pending' });
    }

    session.status = 'approved';
    await session.save();

    await Notification.create({
      user: session.requester,
      type: 'session_approved',
      message: `${req.user.name} approved your session for ${session.skill}!`,
      data: { sessionId: session._id },
    });

    if (req.app.get('io')) {
      req.app.get('io').to(session.requester.toString()).emit('notification', {
        type: 'session_approved',
        message: `${req.user.name} approved your session!`,
      });
    }

    const populated = await session.populate([
      { path: 'requester', select: 'name avatar' },
      { path: 'provider', select: 'name avatar' },
    ]);

    res.json({ success: true, session: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete session
// @route   PUT /api/sessions/:id/complete
const completeSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const isParticipant =
      session.requester.toString() === req.user._id.toString() ||
      session.provider.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (session.status !== 'approved') {
      return res.status(400).json({ message: 'Session must be approved first' });
    }

    session.status = 'completed';
    await session.save();

    // Gamification rewards
    await onSessionCompleted(session.requester.toString(), session.provider.toString());

    // Notify both parties
    const otherUser = session.requester.toString() === req.user._id.toString()
      ? session.provider : session.requester;

    await Notification.create({
      user: otherUser,
      type: 'session_completed',
      message: `Your session for ${session.skill} has been marked as completed!`,
      data: { sessionId: session._id },
    });

    const populated = await session.populate([
      { path: 'requester', select: 'name avatar' },
      { path: 'provider', select: 'name avatar' },
    ]);

    res.json({ success: true, session: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel session
// @route   PUT /api/sessions/:id/cancel
const cancelSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const isParticipant =
      session.requester.toString() === req.user._id.toString() ||
      session.provider.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.status = 'cancelled';
    await session.save();

    const otherUser = session.requester.toString() === req.user._id.toString()
      ? session.provider : session.requester;

    await Notification.create({
      user: otherUser,
      type: 'session_cancelled',
      message: `${req.user.name} cancelled the session for ${session.skill}`,
      data: { sessionId: session._id },
    });

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSession, getSessions, approveSession, completeSession, cancelSession };
