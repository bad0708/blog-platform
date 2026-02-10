'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { PenTool, User, LogOut, Settings } from 'lucide-react'

export default function Navbar() {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Blog Platform
            </Link>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Blog Platform
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/blog">
              <Button variant="ghost">Blog</Button>
            </Link>

            {user ? (
              <>
                {(user.role === 'AUTHOR' || user.role === 'ADMIN') && (
                  <Link href="/dashboard">
                    <Button variant="ghost" className="flex items-center">
                      <PenTool className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}

                {user.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="ghost" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{user.username}</span>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}