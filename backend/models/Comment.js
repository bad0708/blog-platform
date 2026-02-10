const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

// Pre-find middleware to exclude soft-deleted comments
commentSchema.pre(/^find/, function(next) {
  if (!this._includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

// Method to include deleted comments in query
commentSchema.query.includeDeleted = function() {
  this._includeDeleted = true;
  return this;
};

// Soft delete method
commentSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

module.exports = mongoose.model('Comment', commentSchema);
