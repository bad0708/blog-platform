# Deployment Guide

This guide will walk you through deploying the Blog Platform to production.

## Prerequisites

1. GitHub account
2. MongoDB Atlas account
3. Render account (for backend)
4. Vercel account (for frontend)

## Step 1: MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with read/write permissions
3. Whitelist all IP addresses (0.0.0.0/0) for development
4. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/blog-platform?retryWrites=true&w=majority
   ```

## Step 2: Backend Deployment (Render)

### Option A: Deploy from GitHub

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: blog-platform-api
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

6. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://your-connection-string
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```

7. Click "Create Web Service"

### Option B: Manual Deploy

1. Create a `render.yaml` file in your repository:
   ```yaml
   services:
     - type: web
       name: blog-platform-api
       env: node
       buildCommand: cd backend && npm install
       startCommand: cd backend && npm start
       envVars:
         - key: MONGODB_URI
           sync: false
         - key: JWT_SECRET
           sync: false
         - key: NODE_ENV
           value: production
   ```

## Step 3: Frontend Deployment (Vercel)

### Option A: Deploy from GitHub

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: frontend
   - **Build Command**: npm run build
   - **Output Directory**: .next

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com/api
   ```

6. Click "Deploy"

### Option B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd frontend
   vercel --prod
   ```

## Step 4: Update Environment Variables

After deployment, update the environment variables:

1. In Render (Backend):
   - Update `FRONTEND_URL` with your Vercel URL

2. In Vercel (Frontend):
   - Update `NEXT_PUBLIC_API_URL` with your Render URL

3. Redeploy both services

## Step 5: Verify Deployment

1. Test the API health endpoint:
   ```
   GET https://your-render-url.onrender.com/api/health
   ```

2. Test the frontend:
   ```
   https://your-vercel-url.vercel.app
   ```

3. Create a test account and verify:
   - User registration
   - Login
   - Create a post
   - View the post
   - Add a comment

## Troubleshooting

### CORS Issues

If you see CORS errors:
1. Verify `FRONTEND_URL` in backend matches your Vercel URL exactly
2. Check that the URL includes `https://` and no trailing slash

### Database Connection Issues

If the backend can't connect to MongoDB:
1. Verify `MONGODB_URI` is correct
2. Check that the database user has the correct password
3. Ensure your IP is whitelisted in MongoDB Atlas

### Build Failures

If the build fails:
1. Check that all dependencies are in `package.json`
2. Verify Node.js version compatibility
3. Check build logs for specific errors

## Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user configured
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] JWT secret is strong (min 32 characters)
- [ ] Tested user registration
- [ ] Tested login/logout
- [ ] Tested post creation
- [ ] Tested comments
- [ ] Tested admin features

## Domain Configuration (Optional)

### Custom Domain for Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Custom Domain for Render

1. Go to Render Dashboard → Your Service → Settings → Custom Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Monitoring

### Render Logs
- View logs in Render Dashboard → Your Service → Logs
- Set up log streaming for production monitoring

### Vercel Analytics
- Enable Vercel Analytics in your project settings
- Monitor performance and errors

## Security Considerations

1. **JWT Secret**: Use a strong, random secret (min 32 characters)
2. **MongoDB**: Use a strong database password
3. **Environment Variables**: Never commit `.env` files
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Only allow your frontend domain

## Support

For issues or questions:
- Check the logs in Render/Vercel dashboards
- Review the README.md for architecture details
- Test locally to reproduce issues
