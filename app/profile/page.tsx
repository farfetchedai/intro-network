'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  bio: string
  profilePicture: string
  backgroundImage: string
  linkedinUrl: string
  twitterUrl: string
  facebookUrl: string
  instagramUrl: string
  websiteUrl: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    profilePicture: '',
    backgroundImage: '',
    linkedinUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    websiteUrl: '',
  })

  useEffect(() => {
    // Get current user from session cookie
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.userId) {
          router.push('/referee')
          return
        }

        // Fetch user profile using the authenticated userId
        return fetch(`/api/profile/${data.userId}`)
      })
      .then(res => res?.json())
      .then(data => {
        if (data?.success) {
          setProfile({
            id: data.profile.id,
            firstName: data.profile.firstName || '',
            lastName: data.profile.lastName || '',
            username: data.profile.username || '',
            email: data.profile.email || '',
            phone: data.profile.phone || '',
            bio: data.profile.bio || '',
            profilePicture: data.profile.profilePicture || '',
            backgroundImage: data.profile.backgroundImage || '',
            linkedinUrl: data.profile.linkedinUrl || '',
            twitterUrl: data.profile.twitterUrl || '',
            facebookUrl: data.profile.facebookUrl || '',
            instagramUrl: data.profile.instagramUrl || '',
            websiteUrl: data.profile.websiteUrl || '',
          })
        }
      })
      .catch(err => console.error('Failed to fetch profile:', err))
  }, [router])

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username === profile.username) {
      setUsernameAvailable(null)
      return
    }

    setUsernameChecking(true)
    try {
      const response = await fetch(`/api/profile/check-username?username=${encodeURIComponent(username)}`)
      const data = await response.json()
      setUsernameAvailable(data.available)
    } catch (err) {
      console.error('Failed to check username:', err)
    } finally {
      setUsernameChecking(false)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value
    setProfile({ ...profile, username: newUsername })

    // Debounce username check
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(newUsername)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleImageUpload = async (file: File, type: 'profile' | 'background') => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.url) {
        if (type === 'profile') {
          setProfile({ ...profile, profilePicture: data.url })
        } else {
          setProfile({ ...profile, backgroundImage: data.url })
        }
      }
    } catch (err) {
      console.error('Failed to upload image:', err)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/profile/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      const data = await response.json()
      if (data.success) {
        setIsEditing(false)
        // Update localStorage
        localStorage.setItem('userName', `${profile.firstName} ${profile.lastName}`)
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = () => {
    return `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase()
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('userId')
      localStorage.removeItem('userName')
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      router.push('/')
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
      {/* Background Image Section */}
      <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
        {profile.backgroundImage && (
          <img
            src={profile.backgroundImage}
            alt="Background"
            className="w-full h-full object-cover"
          />
        )}
        {isEditing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Upload Background
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'background')}
              />
            </label>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-20">
        {/* Profile Picture */}
        <div className="flex items-end space-x-6 mb-8">
          <div className="relative">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {getInitials()}
              </div>
            )}
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')}
                />
              </label>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h1>
            {profile.username && (
              <p className="text-gray-600">@{profile.username}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isSaving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : isEditing ? 'Save Profile' : 'Edit Profile'}
            </button>
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            )}
            {profile.id && (
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.lastName}</p>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            {isEditing ? (
              <div className="relative">
                <input
                  type="text"
                  value={profile.username}
                  onChange={handleUsernameChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Choose a unique username"
                />
                {usernameChecking && (
                  <span className="absolute right-3 top-3 text-gray-400">Checking...</span>
                )}
                {usernameAvailable === true && (
                  <span className="absolute right-3 top-3 text-green-600">✓ Available</span>
                )}
                {usernameAvailable === false && (
                  <span className="absolute right-3 top-3 text-red-600">✗ Taken</span>
                )}
              </div>
            ) : (
              <p className="text-gray-900">@{profile.username || 'Not set'}</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.phone}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-900">{profile.bio || 'No bio added yet'}</p>
            )}
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profile.linkedinUrl}
                    onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                ) : (
                  <p className="text-gray-900">{profile.linkedinUrl || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profile.twitterUrl}
                    onChange={(e) => setProfile({ ...profile, twitterUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://twitter.com/username"
                  />
                ) : (
                  <p className="text-gray-900">{profile.twitterUrl || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profile.facebookUrl}
                    onChange={(e) => setProfile({ ...profile, facebookUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://facebook.com/username"
                  />
                ) : (
                  <p className="text-gray-900">{profile.facebookUrl || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profile.instagramUrl}
                    onChange={(e) => setProfile({ ...profile, instagramUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://instagram.com/username"
                  />
                ) : (
                  <p className="text-gray-900">{profile.instagramUrl || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profile.websiteUrl}
                    onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://yourwebsite.com"
                  />
                ) : (
                  <p className="text-gray-900">{profile.websiteUrl || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}
