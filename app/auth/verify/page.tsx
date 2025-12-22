'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const redirect = searchParams.get('redirect')

    if (!token) {
      setStatus('error')
      setErrorMessage('Invalid magic link')
      return
    }

    verifyToken(token, redirect)
  }, [searchParams])

  const verifyToken = async (token: string, redirectUrl: string | null) => {
    try {
      const response = await fetch('/api/auth/verify-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem('userId', data.user.id)
        localStorage.setItem('userName', `${data.user.firstName} ${data.user.lastName}`)

        // Handle pending connection request from profile page (for existing users logging in)
        const pendingConnectionData = localStorage.getItem('pendingConnection')
        if (pendingConnectionData) {
          try {
            const pendingConnection = JSON.parse(pendingConnectionData)
            // Send a connection request (with email notification)
            const connectionResponse = await fetch('/api/connections/request', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                toUserId: pendingConnection.userId,
                note: `Hi! I'd love to connect with you.`,
              }),
            })
            const connectionData = await connectionResponse.json()
            if (connectionData.success) {
              console.log(`Connection request sent to ${pendingConnection.firstName} ${pendingConnection.lastName}`)
            }
            // Clear pending connection regardless of success
            localStorage.removeItem('pendingConnection')
          } catch (error) {
            console.error('Error sending connection request:', error)
            localStorage.removeItem('pendingConnection')
          }
        }

        setStatus('success')

        // Determine redirect destination
        // Priority: 1. redirectUrl from magic link, 2. user's saved redirect, 3. onboarding
        const finalRedirect = redirectUrl || data.user.magicLinkRedirect || '/onboarding?fromMagicLink=true'

        // Redirect after a short delay
        setTimeout(() => {
          router.push(finalRedirect)
        }, 2000)
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Failed to verify magic link')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
        <span className="text-white font-bold text-2xl">I</span>
      </div>

      {status === 'verifying' && (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying...</h1>
          <p className="text-gray-600">Please wait while we log you in</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
          <p className="text-gray-600">You're being logged in...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Request New Link
          </button>
        </>
      )}
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
        <span className="text-white font-bold text-2xl">I</span>
      </div>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
    </div>
  )
}

export default function VerifyMagicLinkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <VerifyContent />
      </Suspense>
    </div>
  )
}
