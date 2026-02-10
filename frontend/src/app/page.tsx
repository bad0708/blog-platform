import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Blog Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Share your thoughts and connect with readers worldwide
        </p>
        <div className="space-x-4">
          <Link href="/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/blog">
            <Button variant="outline" size="lg">Browse Posts</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}