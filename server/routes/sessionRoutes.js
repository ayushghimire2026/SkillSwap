const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createSession,
  getSessions,
  approveSession,
  completeSession,
  cancelSession,
} = require('../controllers/sessionController');

router.post('/', protect, createSession);
router.get('/', protect, getSessions);
router.put('/:id/approve', protect, approveSession);
router.put('/:id/complete', protect, completeSession);
router.put('/:id/cancel', protect, cancelSession);

module.exports = router;
