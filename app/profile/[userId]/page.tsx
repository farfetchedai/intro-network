'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function ProfileCardPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [profile, setProfile] = useState<{
    firstName: string
    lastName: string
    email: string
    phone: string
    profilePicture: string | null
    statementSummary: string | null
    introRequest: string | null
    username: string | null
  } | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'saved'>('idle')
  const [isSavingUsername, setIsSavingUsername] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/user?userId=${userId}`)
        const data = await response.json()

        if (data.user) {
          setProfile(data.user)
          if (data.user.username) {
            setUsername(data.user.username)
            setUsernameStatus('saved')
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchProfile()
    }
  }, [userId])

  // Check username availability with debounce
  useEffect(() => {
    if (!username || username === profile?.username) {
      if (profile?.username && username === profile.username) {
        setUsernameStatus('saved')
      } else {
        setUsernameStatus('idle')
      }
      return
    }

    const checkUsername = setTimeout(async () => {
      setUsernameStatus('checking')
      try {
        const response = await fetch(`/api/user/check-username?username=${encodeURIComponent(username)}`)
        const data = await response.json()

        if (data.available) {
          setUsernameStatus('available')
        } else {
          setUsernameStatus('taken')
        }
      } catch (error) {
        console.error('Error checking username:', error)
        setUsernameStatus('idle')
      }
    }, 500)

    return () => clearTimeout(checkUsername)
  }, [username, profile?.username])

  const handleSaveUsername = async () => {
    if (usernameStatus !== 'available') return

    setIsSavingUsername(true)
    try {
      const response = await fetch('/api/user/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = await response.json()

      if (data.success && profile) {
        setProfile({
          ...profile,
          username: username,
        })
        setUsernameStatus('saved')
        alert('Username saved successfully!')
      } else {
        alert(data.error || 'Failed to save username')
      }
    } catch (error) {
      console.error('Error saving username:', error)
      alert('An error occurred while saving')
    } finally {
      setIsSavingUsername(false)
    }
  }

  const handleCopyShareUrl = () => {
    const shareUrl = profile?.username
      ? `${window.location.origin}/${profile.username}`
      : `${window.location.origin}/profile/${userId}`

    navigator.clipboard.writeText(shareUrl)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-fadeIn">
            {/* Profile Header */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                  Hi, I'm {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-600 text-lg">
                  {profile.email}
                </p>
                {profile.phone && (
                  <p className="text-gray-500 text-sm mt-1">
                    {profile.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Statement Summary */}
            {profile.statementSummary && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Professional Summary
                </h3>
                <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-line">
                  {profile.statementSummary}
                </p>
              </div>
            )}


            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push('/onboarding')}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Username Section */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personalize Your Profile URL
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="your-username"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                  {usernameStatus === 'checking' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      Checking...
                    </span>
                  )}
                  {usernameStatus === 'available' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm font-medium">
                      ✓ Available
                    </span>
                  )}
                  {usernameStatus === 'taken' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 text-sm font-medium">
                      ✗ Taken
                    </span>
                  )}
                  {usernameStatus === 'saved' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 text-sm font-medium">
                      ✓ Saved
                    </span>
                  )}
                </div>
                {usernameStatus === 'available' && (
                  <button
                    onClick={handleSaveUsername}
                    disabled={isSavingUsername}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSavingUsername ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
              {profile?.username && (
                <p className="text-sm text-gray-500 mt-2">
                  Current: {profile.username}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleCopyShareUrl}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copySuccess ? 'Copied!' : 'Copy Share URL'}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {profile?.username
                  ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${profile.username}`
                  : `${typeof window !== 'undefined' ? window.location.origin : ''}/profile/${userId}`
                }
              </p>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
