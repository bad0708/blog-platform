'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { PostsResponse, Post } from '@/types'
import { Button } from '@/components/ui/button'
import { Search, Filter } from 'lucide-react'

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [tags, setTags] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PostsResponse['pagination'] | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [search, tags, sort, page])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        tags,
        sort,
      })
      const response = await api.get(`/posts?${params}`)
      setPosts(response.data.posts)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPosts()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
        <p className="text-xl text-gray-600">Discover amazing stories and insights</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Filter by tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title</option>
            </select>
            <Button type="submit">Search</Button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h2>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-indigo-600">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">By {post.author.username}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {pagination && (pagination.hasPrev || pagination.hasNext) && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {pagination.hasPrev && (
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                )}
                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                {pagination.hasNext && (
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}