const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validations
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Post validations
const createPostValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED'])
    .withMessage('Status must be DRAFT or PUBLISHED'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  handleValidationErrors
];

const updatePostValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid post ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED'])
    .withMessage('Status must be DRAFT or PUBLISHED'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  handleValidationErrors
];

const postIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid post ID'),
  handleValidationErrors
];

const slugValidation = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required'),
  handleValidationErrors
];

// Query validations for pagination and filtering
const postQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('search')
    .optional()
    .trim(),
  query('tags')
    .optional()
    .trim(),
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'title'])
    .withMessage('Sort must be newest, oldest, or title'),
  handleValidationErrors
];

// Comment validations
const createCommentValidation = [
  param('postId')
    .isMongoId()
    .withMessage('Invalid post ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  handleValidationErrors
];

const commentIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid comment ID'),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  createPostValidation,
  updatePostValidation,
  postIdValidation,
  slugValidation,
  postQueryValidation,
  createCommentValidation,
  commentIdValidation,
  handleValidationErrors
};
