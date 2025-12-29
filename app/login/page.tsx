'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import BodyClass from '@/components/BodyClass'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [devLink, setDevLink] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    // Pre-fill email from URL parameter
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
    // Check if this is a new user signup flow
    const newUserParam = searchParams.get('newUser')
    if (newUserParam === 'true') {
      setIsNewUser(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setDevLink(null)

    try {
      const response = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          // If this is a new user flow, allow creating an account
          createIfNotExists: isNewUser,
          // After login, redirect to introductions if coming from intro email
          redirectUrl: isNewUser ? '/introductions' : undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({
          type: 'success',
          text: 'Check your email for a login link! It will expire in 15 minutes.',
        })

        // In development, show the link directly
        if (data.devLink) {
          setDevLink(data.devLink)
        }
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to send magic link',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Something went wrong. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <BodyClass className="page-login" />
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">I</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{isNewUser ? 'Get Started' : 'Welcome Back'}</h1>
          <p className="text-gray-600 mt-2">{isNewUser ? 'Create your account to accept the introduction' : 'Sign in to your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {devLink && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-2">Development Mode - Click link to login:</p>
            <a
              href={devLink}
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {devLink}
            </a>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/referee')}
              className="text-blue-600 hover:underline font-medium"
            >
              Get Started
            </button>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            We'll send you a magic link to sign in without a password
          </p>
        </div>
      </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
