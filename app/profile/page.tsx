'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProfileTabs from '@/components/ProfileTabs'
import ConnectionsList from '@/components/ConnectionsList'
import CareerHistoryList from '@/components/CareerHistoryList'
import CareerEntryForm from '@/components/CareerEntryForm'
import LinkedInIcon from '@/components/LinkedInIcon'
import ResumeImportPreview, { ParsedCareerEntry } from '@/components/ResumeImportPreview'

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

interface Connection {
  id: string
  firstName: string
  lastName: string
  headline?: string | null
  profilePictureUrl?: string | null
  profileUrl?: string | null
}

interface CareerEntry {
  id: string
  title: string
  companyName: string
  companyLogoUrl?: string | null
  location?: string | null
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  isCurrent: boolean
  importedFromLinkedIn: boolean
}

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<string>('profile')
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

  // LinkedIn and connections state
  const [linkedInConnected, setLinkedInConnected] = useState(false)
  const [connections, setConnections] = useState<Connection[]>([])
  const [connectionsLoading, setConnectionsLoading] = useState(false)
  const [connectionsSyncing, setConnectionsSyncing] = useState(false)

  // Career history state
  const [careerHistory, setCareerHistory] = useState<CareerEntry[]>([])
  const [careerLoading, setCareerLoading] = useState(false)
  const [showCareerForm, setShowCareerForm] = useState(false)
  const [editingCareerEntry, setEditingCareerEntry] = useState<CareerEntry | null>(null)
  const [careerFormLoading, setCareerFormLoading] = useState(false)

  // Resume import state
  const [resumeImporting, setResumeImporting] = useState(false)
  const [parsedResumeEntries, setParsedResumeEntries] = useState<ParsedCareerEntry[] | null>(null)
  const [resumeImportError, setResumeImportError] = useState<string | null>(null)
  const [resumeSaving, setResumeSaving] = useState(false)

  // Check URL params for initial tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['profile', 'connections', 'career'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    // Get current user from session cookie
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.user) {
          router.push('/')
          return
        }

        // Check if LinkedIn is connected
        if (data.user.linkedInAccount) {
          setLinkedInConnected(true)
        }

        // Fetch user profile using the authenticated userId
        return fetch(`/api/profile/${data.user.id}`)
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

  // Fetch connections when tab changes
  useEffect(() => {
    if (activeTab === 'connections' && profile.id) {
      fetchConnections()
    }
  }, [activeTab, profile.id])

  // Fetch career history when tab changes
  useEffect(() => {
    if (activeTab === 'career' && profile.id) {
      fetchCareerHistory()
    }
  }, [activeTab, profile.id])

  const fetchConnections = async () => {
    setConnectionsLoading(true)
    try {
      const response = await fetch('/api/linkedin/connections')
      const data = await response.json()
      if (data.success) {
        setConnections(data.connections || [])
        setLinkedInConnected(true)
      } else if (data.notConnected) {
        setLinkedInConnected(false)
      }
    } catch (err) {
      console.error('Failed to fetch connections:', err)
    } finally {
      setConnectionsLoading(false)
    }
  }

  const handleSyncConnections = async () => {
    setConnectionsSyncing(true)
    try {
      const response = await fetch('/api/linkedin/connections', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        setConnections(data.connections || [])
      }
    } catch (err) {
      console.error('Failed to sync connections:', err)
    } finally {
      setConnectionsSyncing(false)
    }
  }

  const fetchCareerHistory = async () => {
    setCareerLoading(true)
    try {
      const response = await fetch('/api/career')
      const data = await response.json()
      if (data.success) {
        setCareerHistory(data.careerHistory || [])
      }
    } catch (err) {
      console.error('Failed to fetch career history:', err)
    } finally {
      setCareerLoading(false)
    }
  }

  const handleAddCareerEntry = async (formData: any) => {
    setCareerFormLoading(true)
    try {
      const response = await fetch('/api/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) {
        setCareerHistory([data.careerEntry, ...careerHistory])
        setShowCareerForm(false)
      }
    } catch (err) {
      console.error('Failed to add career entry:', err)
    } finally {
      setCareerFormLoading(false)
    }
  }

  const handleUpdateCareerEntry = async (formData: any) => {
    if (!editingCareerEntry) return
    setCareerFormLoading(true)
    try {
      const response = await fetch(`/api/career/${editingCareerEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) {
        setCareerHistory(careerHistory.map(entry =>
          entry.id === editingCareerEntry.id ? data.careerEntry : entry
        ))
        setEditingCareerEntry(null)
      }
    } catch (err) {
      console.error('Failed to update career entry:', err)
    } finally {
      setCareerFormLoading(false)
    }
  }

  const handleDeleteCareerEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this position?')) return
    try {
      const response = await fetch(`/api/career/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setCareerHistory(careerHistory.filter(entry => entry.id !== id))
      }
    } catch (err) {
      console.error('Failed to delete career entry:', err)
    }
  }

  const handleConnectLinkedIn = () => {
    window.location.href = '/api/auth/linkedin?returnTo=/profile?tab=connections'
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset state
    setResumeImportError(null)
    setResumeImporting(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/career/import-resume', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setParsedResumeEntries(data.entries)
      } else {
        setResumeImportError(data.error || 'Failed to parse resume')
      }
    } catch (err) {
      console.error('Resume upload error:', err)
      setResumeImportError('Failed to upload resume. Please try again.')
    } finally {
      setResumeImporting(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleImportResumeEntries = async (entries: ParsedCareerEntry[]) => {
    setResumeSaving(true)
    try {
      const response = await fetch('/api/career/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })

      const data = await response.json()

      if (data.success) {
        // Add new entries to the top of the list
        setCareerHistory([...data.careerEntries, ...careerHistory])
        setParsedResumeEntries(null)
      } else {
        setResumeImportError(data.error || 'Failed to save career entries')
      }
    } catch (err) {
      console.error('Resume import save error:', err)
      setResumeImportError('Failed to save career entries. Please try again.')
    } finally {
      setResumeSaving(false)
    }
  }

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

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'connections', label: 'My Connections' },
    { id: 'career', label: 'Career History' },
  ]

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
          {isEditing && activeTab === 'profile' && (
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
          {/* Profile Picture and Header */}
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
              {isEditing && activeTab === 'profile' && (
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
              {linkedInConnected && (
                <div className="flex items-center gap-1 mt-1 text-sm text-[#0A66C2]">
                  <LinkedInIcon className="w-4 h-4" />
                  <span>LinkedIn Connected</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {activeTab === 'profile' && (
                <>
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
                </>
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

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <ProfileTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
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
                        <span className="absolute right-3 top-3 text-green-600">Available</span>
                      )}
                      {usernameAvailable === false && (
                        <span className="absolute right-3 top-3 text-red-600">Taken</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900">@{profile.username || 'Not set'}</p>
                  )}
                </div>

                {/* Contact Info */}
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Social Links</h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.email && (
                        <a href={`mailto:${profile.email}`} className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" title={profile.email}>
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </a>
                      )}
                      {profile.phone && (
                        <a href={`tel:${profile.phone}`} className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" title={profile.phone}>
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </a>
                      )}
                      {profile.linkedinUrl && (
                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors" title="LinkedIn">
                          <LinkedInIcon className="w-6 h-6 text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

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

                {/* Social Links - Edit Mode */}
                {isEditing && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                        <input type="url" value={profile.linkedinUrl} onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://linkedin.com/in/username" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                        <input type="url" value={profile.twitterUrl} onChange={(e) => setProfile({ ...profile, twitterUrl: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://twitter.com/username" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input type="url" value={profile.websiteUrl} onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://yourwebsite.com" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Connections</h2>
                <ConnectionsList
                  connections={connections}
                  loading={connectionsLoading}
                  onSync={handleSyncConnections}
                  syncing={connectionsSyncing}
                  linkedInConnected={linkedInConnected}
                  onConnectLinkedIn={handleConnectLinkedIn}
                />
              </div>
            )}

            {/* Career History Tab */}
            {activeTab === 'career' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Career History</h2>
                  {!showCareerForm && !editingCareerEntry && (
                    <div className="flex items-center gap-3">
                      {/* Hidden file input for resume */}
                      <input
                        type="file"
                        id="resume-upload"
                        accept=".pdf,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => document.getElementById('resume-upload')?.click()}
                        disabled={resumeImporting}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {resumeImporting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Parsing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Import from Resume
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowCareerForm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Position
                      </button>
                    </div>
                  )}
                </div>

                {/* Resume Import Error */}
                {resumeImportError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm text-red-700">{resumeImportError}</p>
                      </div>
                      <button
                        onClick={() => setResumeImportError(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Career Entry Form */}
                {(showCareerForm || editingCareerEntry) && (
                  <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingCareerEntry ? 'Edit Position' : 'Add New Position'}
                    </h3>
                    <CareerEntryForm
                      initialData={editingCareerEntry ? {
                        title: editingCareerEntry.title,
                        companyName: editingCareerEntry.companyName,
                        location: editingCareerEntry.location ?? undefined,
                        description: editingCareerEntry.description ?? undefined,
                        startDate: editingCareerEntry.startDate ?? undefined,
                        endDate: editingCareerEntry.endDate ?? undefined,
                        isCurrent: editingCareerEntry.isCurrent,
                      } : undefined}
                      onSubmit={editingCareerEntry ? handleUpdateCareerEntry : handleAddCareerEntry}
                      onCancel={() => {
                        setShowCareerForm(false)
                        setEditingCareerEntry(null)
                      }}
                      isEditing={!!editingCareerEntry}
                      loading={careerFormLoading}
                    />
                  </div>
                )}

                {/* Career History List */}
                <CareerHistoryList
                  entries={careerHistory}
                  loading={careerLoading}
                  editable={true}
                  onEdit={(id) => {
                    const entry = careerHistory.find(e => e.id === id)
                    if (entry) setEditingCareerEntry(entry)
                  }}
                  onDelete={handleDeleteCareerEntry}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume Import Preview Modal */}
      {parsedResumeEntries && (
        <ResumeImportPreview
          entries={parsedResumeEntries}
          onImport={handleImportResumeEntries}
          onCancel={() => setParsedResumeEntries(null)}
          loading={resumeSaving}
        />
      )}

      <Footer />
    </>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-gray-900">Loading profile...</h1>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProfileContent />
    </Suspense>
  )
}
