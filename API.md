# API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-render-url.onrender.com/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All responses follow this format:

```json
{
  "status": "success" | "fail" | "error",
  "message": "Human readable message",
  "data": { ... }
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "AUTHOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /auth/login
Login existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Posts

#### GET /posts
Get all published posts (public).

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 50)
- `search` (string, optional): Search in title and content
- `tags` (string, optional): Comma-separated list of tags
- `sort` (string, optional): Sort by `newest`, `oldest`, or `title`

**Response:**
```json
{
  "status": "success",
  "data": {
    "posts": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10,
      "hasMore": true
    }
  }
}
```

#### GET /posts/my-posts
Get current user's posts (authenticated).

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `status` (string, optional): Filter by `DRAFT` or `PUBLISHED`
- `search` (string, optional)

#### GET /posts/slug/:slug
Get post by slug (public for published, auth required for drafts).

#### POST /posts
Create a new post (authenticated).

**Request Body:**
```json
{
  "title": "My First Post",
  "content": "# Hello World\n\nThis is my first post.",
  "status": "DRAFT",
  "tags": ["tutorial", "beginner"]
}
```

#### GET /posts/:id
Get a specific post by ID (author or admin only - must own the post or be admin).

**Authentication:** Required

**Response:**
```json
{
  "post": {
    "_id": "...",
    "title": "My Post",
    "slug": "my-post",
    "content": "Content here...",
    "status": "DRAFT",
    "tags": [],
    "author": {
      "_id": "...",
      "username": "johndoe"
    },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### PUT /posts/:id
Update a post (author or admin only). Can update title, content, status, and tags.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "status": "PUBLISHED",
  "tags": ["updated", "tags"]
}
```

#### DELETE /posts/:id
Soft delete a post (author or admin only).

### Comments

#### GET /comments/post/:postId
Get comments for a post (public).

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)

#### POST /comments/:postId
Create a comment (authenticated).

**Request Body:**
```json
{
  "content": "Great post! Thanks for sharing."
}
```

#### DELETE /comments/:id
Delete a comment (comment author, post author, or admin).

### Users

#### GET /users/profile
Get current user profile with stats (authenticated).

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": { ... },
    "stats": {
      "totalPosts": 10,
      "publishedPosts": 7,
      "draftPosts": 3
    }
  }
}
```

#### GET /users
Get all users (admin only).

#### GET /users/:id
Get user by ID (admin only).

#### PUT /users/:id/role
Update user role (admin only).

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

#### DELETE /users/:id
Deactivate user (admin only).

## Error Responses

### 400 Bad Request
```json
{
  "status": "fail",
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email" }
  ]
}
```

### 401 Unauthorized
```json
{
  "status": "fail",
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "status": "fail",
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "status": "fail",
  "message": "Post not found"
}
```

### 409 Conflict
```json
{
  "status": "fail",
  "message": "Email already registered"
}
```

### 500 Server Error
```json
{
  "status": "error",
  "message": "Something went wrong!"
}
```

## Rate Limiting

API requests are limited to:
- 100 requests per 15 minutes for authenticated users
- 20 requests per 15 minutes for unauthenticated users

## Pagination

All list endpoints support pagination with these parameters:
- `page`: Page number (1-indexed)
- `limit`: Items per page

Response includes pagination info:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasMore": true
  }
}
```
