const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate', 'fake_profile', 'other'],
    required: true,
  },
  description: {
    type: String,
    maxlength: 1000,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending',
  },
  adminNote: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);
