# Multi-User Blog Platform

A full-stack blog platform built with Next.js, Express, and MongoDB Atlas. Features authentication, role-based access control, markdown support, and a modern responsive UI.

## Live Demo

- **Frontend**: [https://blog-platform-rosy-sigma.vercel.app](https://blog-platform-rosy-sigma.vercel.app)
- **Backend API**: [https://blog-platform-nuk9.onrender.com/api](https://blog-platform-nuk9.onrender.com/api)

## Features

### Authentication & Authorization
- User registration and login with JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (AUTHOR, ADMIN)
- Protected routes and API endpoints

### Blog Post Management
- Create, read, update, delete posts
- Markdown support with live preview
- Draft/Published status
- Unique URL-friendly slugs
- Tagging system
- Soft delete functionality

### Comments System
- Authenticated users can comment on posts
- Authors can delete comments on their posts
- Admins can delete any comment

### Public Blog & SEO
- Public blog listing with pagination
- Individual blog post pages
- Clean URLs using slugs
- Search by title or content
- Filter by tags
- Sorting options (newest, oldest, title)

### Admin Dashboard
- Manage all users and posts
- Change user roles
- Deactivate users
- Delete any post

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **React Markdown** - Markdown rendering
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB Atlas** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **slugify** - URL slug generation

## Project Structure

```
blog-platform/
├── backend/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation, error handling
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js app router
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── lib/         # Utilities and API
│   │   └── types/       # TypeScript types
│   ├── package.json
│   └── next.config.js
└── README.md
```

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog-platform?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your configuration

4. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file with your configuration

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all published posts
- `GET /api/posts/my-posts` - Get current user's posts
- `GET /api/posts/all` - Get all posts (admin)
- `GET /api/posts/slug/:slug` - Get post by slug
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/publish` - Publish post
- `POST /api/posts/:id/unpublish` - Unpublish post

### Comments
- `GET /api/comments/post/:postId` - Get comments for a post
- `POST /api/comments/:postId` - Create comment
- `DELETE /api/comments/:id` - Delete comment

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/:id` - Get user by ID (admin)
- `PUT /api/users/:id/role` - Update user role (admin)
- `DELETE /api/users/:id` - Deactivate user (admin)

## Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

### Frontend (Vercel)

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set framework preset to Next.js
4. Add environment variables
5. Deploy

## User Roles

### Author
- Create, edit, delete their own posts
- View their own drafts
- Comment on posts
- Delete their own comments
- Delete comments on their posts

### Admin
- All author permissions
- Manage all users
- Manage all posts
- Delete any comment
- Access admin dashboard

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT-based authentication
- Input validation with express-validator
- Helmet.js for security headers
- CORS configuration
- Role-based access control
- Soft delete for data integrity

## Bonus Features Implemented

- Markdown preview while editing
- Pagination for posts and comments
- Search functionality
- Tag filtering
- Sorting options
- Responsive design
- Loading states
- Error handling

## License

MIT License
