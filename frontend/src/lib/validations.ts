import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const postSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  tags: z.array(z.string().max(30, 'Tag cannot exceed 30 characters')).max(10, 'Maximum 10 tags').optional(),
})

export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Comment content is required')
    .max(1000, 'Comment cannot exceed 1000 characters'),
})

export type RegisterForm = z.infer<typeof registerSchema>
export type LoginForm = z.infer<typeof loginSchema>
export type PostForm = z.infer<typeof postSchema>
export type CommentForm = z.infer<typeof commentSchema>