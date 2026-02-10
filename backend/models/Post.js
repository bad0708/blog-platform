const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED'],
    default: 'DRAFT'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  publishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
postSchema.index({ status: 1, isDeleted: 1, createdAt: -1 });
postSchema.index({ slug: 1, isDeleted: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ title: 'text', content: 'text' });

// Pre-find middleware to exclude soft-deleted posts by default
postSchema.pre(/^find/, function(next) {
  if (!this._includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

// Method to include deleted posts in query
postSchema.query.includeDeleted = function() {
  this._includeDeleted = true;
  return this;
};

// Soft delete method
postSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

// Restore soft-deleted post
postSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = null;
  return await this.save();
};

module.exports = mongoose.model('Post', postSchema);
