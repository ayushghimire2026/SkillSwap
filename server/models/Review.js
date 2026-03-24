const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: 1000,
    default: '',
  },
}, {
  timestamps: true,
});

reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ session: 1 });
reviewSchema.index({ reviewer: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
