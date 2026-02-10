'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { Post } from '@/types'
import { Button } from '@/components/ui/button'
import { PenTool, Plus, Eye, Edit, Trash2 } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts/my-posts')
      setPosts(response.data.posts)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      await api.delete(`/posts/${postId}`)
      setPosts(posts.filter(post => post._id !== postId))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete post')
    }
  }

  if (!user || (user.role !== 'AUTHOR' && user.role !== 'ADMIN')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need to be an author or admin to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/posts/new">
          <Button className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <PenTool className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h2>
          <p className="text-gray-600 mb-4">Create your first blog post to get started.</p>
          <Link href="/posts/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                    <span>Created {new Date(post.createdAt).toLocaleDateString()}</span>
                    {post.publishedAt && (
                      <span>Published {new Date(post.publishedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  {post.status === 'PUBLISHED' && (
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                  <Link href={`/posts/${post._id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePost(post._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}