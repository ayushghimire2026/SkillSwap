const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skill: {
    type: String,
    required: [true, 'Skill is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  timeSlot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
  },
  notes: {
    type: String,
    maxlength: 500,
    default: '',
  },
  meetingLink: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

sessionSchema.index({ requester: 1, status: 1 });
sessionSchema.index({ provider: 1, status: 1 });
sessionSchema.index({ date: 1 });

module.exports = mongoose.model('Session', sessionSchema);
