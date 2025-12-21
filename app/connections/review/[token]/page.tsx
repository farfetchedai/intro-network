'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface ConnectionRequest {
  id: string
  note: string | null
  status: string
  createdAt: string
  fromUser: {
    id: string
    firstName: string
    lastName: string
    username: string | null
    profilePicture: string | null
    companyName: string | null
    statementSummary: string | null
  }
  toUser: {
    id: string
    firstName: string
    lastName: string
  }
}

export default function ConnectionReviewPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [request, setRequest] = useState<ConnectionRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isResponding, setIsResponding] = useState(false)
  const [responseSuccess, setResponseSuccess] = useState<'accepted' | 'declined' | null>(null)

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`/api/connections/review?token=${token}`)
        const data = await response.json()

        if (data.success) {
          setRequest(data.request)
        } else {
          setError(data.error || 'Failed to load connection request')
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Failed to load connection request')
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchRequest()
    }
  }, [token])

  const handleRespond = async (action: 'accept' | 'decline') => {
    setIsResponding(true)

    try {
      const response = await fetch('/api/connections/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action }),
      })

      const data = await response.json()

      if (data.success) {
        setResponseSuccess(action === 'accept' ? 'accepted' : 'declined')
      } else {
        setError(data.error || 'Failed to respond to request')
      }
    } catch (err) {
      console.error('Response error:', err)
      setError('Failed to respond to request')
    } finally {
      setIsResponding(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading connection request...</p>
        </div>
      </div>
    )
  }

  if (error && !request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Request Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Go to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (responseSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              responseSuccess === 'accepted' ? 'bg-emerald-100' : 'bg-gray-100'
            }`}>
              {responseSuccess === 'accepted' ? (
                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {responseSuccess === 'accepted' ? 'Connected!' : 'Request Declined'}
            </h2>
            <p className="text-gray-600 mb-8">
              {responseSuccess === 'accepted'
                ? `You are now connected with ${request?.fromUser.firstName} ${request?.fromUser.lastName}. They have been notified.`
                : `You have declined the connection request from ${request?.fromUser.firstName} ${request?.fromUser.lastName}.`
              }
            </p>
            <div className="flex gap-4 justify-center">
              {responseSuccess === 'accepted' && request?.fromUser.username && (
                <a
                  href={`/${request.fromUser.username}`}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  View Their Profile
                </a>
              )}
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!request) return null

  // Check if request is already responded to
  if (request.status !== 'PENDING') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Already Responded</h2>
            <p className="text-gray-600 mb-6">
              This connection request has already been {request.status.toLowerCase()}.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-8 text-center text-white">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
                {request.fromUser.profilePicture ? (
                  <img
                    src={request.fromUser.profilePicture}
                    alt={`${request.fromUser.firstName} ${request.fromUser.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold">
                    {request.fromUser.firstName.charAt(0)}{request.fromUser.lastName.charAt(0)}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-1">
                {request.fromUser.firstName} {request.fromUser.lastName}
              </h1>
              {request.fromUser.companyName && (
                <p className="text-white/80">{request.fromUser.companyName}</p>
              )}
              <p className="text-white/70 text-sm mt-2">wants to connect with you</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Note */}
              {request.note && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Their message:</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-700 italic">"{request.note}"</p>
                  </div>
                </div>
              )}

              {/* About them */}
              {request.fromUser.statementSummary && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">About {request.fromUser.firstName}:</h3>
                  <p className="text-gray-700">{request.fromUser.statementSummary}</p>
                </div>
              )}

              {/* View profile link */}
              {request.fromUser.username && (
                <div className="mb-6">
                  <a
                    href={`/${request.fromUser.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View their full profile
                  </a>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleRespond('decline')}
                  disabled={isResponding}
                  className="flex-1 px-6 py-4 text-gray-700 bg-gray-100 font-semibold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleRespond('accept')}
                  disabled={isResponding}
                  className="flex-1 px-6 py-4 text-white bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isResponding ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Accept
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                Request sent {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
