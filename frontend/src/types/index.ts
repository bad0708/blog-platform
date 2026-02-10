export interface User {
  id: string
  username: string
  email: string
  role: 'AUTHOR' | 'ADMIN'
  isActive: boolean
  createdAt: string
}

export interface Post {
  _id: string
  title: string
  slug: string
  content: string
  status: 'DRAFT' | 'PUBLISHED'
  tags: string[]
  author: {
    _id: string
    username: string
  }
  isDeleted?: boolean
  deletedAt?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  content: string
  post: string
  author: {
    _id: string
    username: string
  }
  createdAt: string
  updatedAt: string
}

export interface PostsResponse {
  posts: Post[]
  pagination: {
    currentPage: number
    totalPages: number
    totalPosts: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  message: string
  errors?: string[]
}