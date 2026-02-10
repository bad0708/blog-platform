'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { Post, User } from '@/types'
import { Button } from '@/components/ui/button'
import { Users, FileText, Trash2, UserCheck, UserX } from 'lucide-react'

type TabType = 'users' | 'posts'

export default function AdminPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('users')
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else {
      fetchPosts()
    }
  }, [activeTab])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users')
      setUsers(response.data.users)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/posts/all')
      setPosts(response.data.posts)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, role: 'AUTHOR' | 'ADMIN') => {
    try {
      await api.put(`/users/${userId}/role`, { role })
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user role')
    }
  }

  const deactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return

    try {
      await api.delete(`/users/${userId}`)
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: false } : u))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate user')
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      await api.delete(`/posts/${postId}`)
      setPosts(posts.filter(p => p._id !== postId))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete post')
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users and posts across the platform</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-4 py-2 rounded-md ${
            activeTab === 'users'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center px-4 py-2 rounded-md ${
            activeTab === 'posts'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Posts
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : activeTab === 'users' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Users Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{u.username}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as 'AUTHOR' | 'ADMIN')}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        disabled={u.id === user.id}
                      >
                        <option value="AUTHOR">Author</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {u.id !== user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deactivateUser(u.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Posts Management</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>By {post.author.username}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </span>
                      {post.isDeleted && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          Deleted
                        </span>
                      )}
                      <span>Created {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePost(post._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}