const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [3, 'Name must be at least 3 characters long'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Email already exists'],
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      trim: true,
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age cannot exceed 120'],
    },
    hobbies: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    userId: {
      type: String,
      unique: [true, 'User ID already exists'],
      sparse: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate userId hash if not provided
userSchema.pre('save', function (next) {
  if (!this.userId) {
    this.userId = crypto
      .createHash('sha256')
      .update(this.email + Date.now())
      .digest('hex');
  }
  next();
});

// Create indexes
// Single field index on name
userSchema.index({ name: 1 });

// Compound index on email and age
userSchema.index({ email: 1, age: 1 });

// Multikey index on hobbies
userSchema.index({ hobbies: 1 });

// Text index on bio for text search
userSchema.index({ bio: 'text', name: 'text' });

// Hashed index on userId
userSchema.index({ userId: 'hashed' });

// TTL index on createdAt (documents expire after 365 days)
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('User', userSchema);
