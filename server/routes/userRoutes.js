const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getUserProfile,
  updateProfile,
  uploadPortfolio,
  updateAvatar,
  getLeaderboard,
  deletePortfolioItem,
} = require('../controllers/userController');

router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUserProfile);
router.put('/profile', protect, updateProfile);
router.post('/portfolio', protect, upload.array('files', 5), uploadPortfolio);
router.delete('/portfolio/:itemId', protect, deletePortfolioItem);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);

module.exports = router;
