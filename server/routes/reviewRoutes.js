const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getUserReviews } = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/:userId', getUserReviews);

module.exports = router;
