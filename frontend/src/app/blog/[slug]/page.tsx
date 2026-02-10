'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { commentSchema, type CommentForm } from '@/lib/validations'
import { Post, Comment } from '@/types'
import { Button } from '@/components/ui/button'
import { MessageCircle, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function BlogPostPage() {
  const { user } = useAuth()
  const params = useParams()
  const slug = params.slug as string

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [error, setError] = useState('')
  const [commentError, setCommentError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
  })

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [slug])

  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/slug/${slug}`)
      setPost(response.data.post)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch post')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    if (!post) return

    try {
      setCommentsLoading(true)
      const response = await api.get(`/comments/post/${post._id}`)
      setComments(response.data.comments)
    } catch (err: any) {
      console.error('Failed to fetch comments:', err)
    } finally {
      setCommentsLoading(false)
    }
  }

  const onSubmitComment = async (data: CommentForm) => {
    if (!post) return

    try {
      setCommentError('')
      await api.post(`/comments/${post._id}`, data)
      reset()
      fetchComments()
    } catch (err: any) {
      setCommentError(err.response?.data?.message || 'Failed to add comment')
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await api.delete(`/comments/${commentId}`)
      setComments(comments.filter(comment => comment._id !== commentId))
    } catch (err: any) {
      setCommentError(err.response?.data?.message || 'Failed to delete comment')
    }
  }

  useEffect(() => {
    if (post) {
      fetchComments()
    }
  }, [post])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="bg-white p-8 rounded-lg shadow-md mb-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span>By {post.author.username}</span>
            <span>Published {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag, index) => (
                <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>

      {/* Comments Section */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center mb-6">
          <MessageCircle className="w-5 h-5 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
        </div>

        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleSubmit(onSubmitComment)} className="mb-8">
            {commentError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {commentError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Add a comment
                </label>
                <textarea
                  {...register('content')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Share your thoughts..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md mb-8 text-center">
            <p className="text-gray-600">Please <a href="/login" className="text-indigo-600 hover:text-indigo-500">log in</a> to add a comment.</p>
          </div>
        )}

        {/* Comments List */}
        {commentsLoading ? (
          <div className="text-center">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-600">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">{comment.author.username}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                  {(user?.id === comment.author._id || user?.role === 'ADMIN' || user?.id === post.author._id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteComment(comment._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}