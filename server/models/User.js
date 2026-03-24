const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    maxlength: 500,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  portfolio: [{
    url: String,
    publicId: String,
    type: { type: String, enum: ['image', 'document', 'video'], default: 'image' },
    title: String,
  }],
  skillsOffered: [{
    name: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
    category: { type: String, default: 'General' },
  }],
  skillsWanted: [{
    name: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
  }],
  availability: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    startTime: String,
    endTime: String,
  }],
  reputation: {
    type: Number,
    default: 0,
  },
  xp: {
    type: Number,
    default: 0,
  },
  badges: [{
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now },
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  refreshToken: {
    type: String,
    select: false,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  sessionsCompleted: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

userSchema.index({ 'skillsOffered.name': 1 });
userSchema.index({ 'skillsWanted.name': 1 });
userSchema.index({ xp: -1 });
userSchema.index({ reputation: -1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toProfileJSON = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    location: this.location,
    portfolio: this.portfolio,
    skillsOffered: this.skillsOffered,
    skillsWanted: this.skillsWanted,
    availability: this.availability,
    reputation: this.reputation,
    xp: this.xp,
    badges: this.badges,
    role: this.role,
    isVerified: this.isVerified,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen,
    sessionsCompleted: this.sessionsCompleted,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
