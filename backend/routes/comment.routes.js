const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { authenticate, requireAuthorOrAdmin, requireAdmin } = require('../middleware/auth.middleware');
const { createCommentValidation, commentIdValidation } = require('../middleware/validate.middleware');

const router = express.Router();

// @route   GET /api/comments/post/:postId
// @desc    Get comments for a post
// @access  Public
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if post exists and is published
    const post = await Post.findById(postId);
    if (!post || post.status !== 'PUBLISHED') {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await Comment.find({ post: postId })
      .populate('author', 'username')
      .sort({ createdAt: 1 })
      .lean();

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/comments/:postId
// @desc    Create a comment on a post
// @access  Private
router.post('/:postId', authenticate, createCommentValidation, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    // Check if post exists and is published
    const post = await Post.findById(postId);
    if (!post || post.status !== 'PUBLISHED') {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      content,
      post: postId,
      author: req.user._id
    });

    await comment.save();
    await comment.populate('author', 'username');

    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private (Comment author, Post author, or Admin)
router.delete('/:id', authenticate, commentIdValidation, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check permissions: comment author, post author, or admin
    const post = await Post.findById(comment.post);
    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = post && post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.softDelete();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;