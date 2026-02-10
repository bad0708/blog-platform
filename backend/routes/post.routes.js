const express = require('express');
const Post = require('../models/Post');
const { authenticate, requireAuthorOrAdmin, requireAdmin } = require('../middleware/auth.middleware');
const { createPostValidation, updatePostValidation, postIdValidation, slugValidation, postQueryValidation } = require('../middleware/validate.middleware');

const router = express.Router();

// Helper function to generate unique slug
const generateSlug = async (title, excludeId = null) => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingPost = await Post.findOne(query);
    if (!existingPost) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// @route   GET /api/posts
// @desc    Get published posts with pagination, search, filter, sort
// @access  Public
router.get('/', postQueryValidation, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      tags,
      sort = 'newest'
    } = req.query;

    const query = { status: 'PUBLISHED' };

    // Search in title and content
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { publishedAt: 1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      default: // newest
        sortOption = { publishedAt: -1 };
    }

    const posts = await Post.find(query)
      .populate('author', 'username')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/my-posts
// @desc    Get current user's posts
// @access  Private (Author/Admin)
router.get('/my-posts', authenticate, requireAuthorOrAdmin, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ posts });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/all
// @desc    Get all posts (admin only)
// @access  Private (Admin)
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const posts = await Post.find()
      .includeDeleted()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ posts });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/slug/:slug
// @desc    Get post by slug
// @access  Public
router.get('/slug/:slug', slugValidation, async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, status: 'PUBLISHED' })
      .populate('author', 'username')
      .lean();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get post by ID
// @access  Private (Author/Admin - own post or admin)
router.get('/:id', authenticate, requireAuthorOrAdmin, postIdValidation, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .lean();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership or admin
    if (post.author._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view this post' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private (Author/Admin)
router.post('/', authenticate, requireAuthorOrAdmin, createPostValidation, async (req, res) => {
  try {
    const { title, content, status = 'DRAFT', tags = [] } = req.body;

    const slug = await generateSlug(title);

    const post = new Post({
      title,
      slug,
      content,
      status,
      tags,
      author: req.user._id,
      publishedAt: status === 'PUBLISHED' ? new Date() : null
    });

    await post.save();

    await post.populate('author', 'username');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (Author/Admin - own post or admin)
router.put('/:id', authenticate, requireAuthorOrAdmin, updatePostValidation, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { title, content, status, tags } = req.body;

    if (title && title !== post.title) {
      post.slug = await generateSlug(title, post._id);
      post.title = title;
    }

    if (content !== undefined) post.content = content;
    if (status !== undefined) {
      post.status = status;
      post.publishedAt = status === 'PUBLISHED' && !post.publishedAt ? new Date() : post.publishedAt;
    }
    if (tags !== undefined) post.tags = tags;

    await post.save();
    await post.populate('author', 'username');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Soft delete post
// @access  Private (Author/Admin - own post or admin)
router.delete('/:id', authenticate, requireAuthorOrAdmin, postIdValidation, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.softDelete();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;