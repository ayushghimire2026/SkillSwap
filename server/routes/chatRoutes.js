const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getConversations, getMessages, createConversation } = require('../controllers/chatController');

router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, createConversation);
router.get('/messages/:conversationId', protect, getMessages);

module.exports = router;
