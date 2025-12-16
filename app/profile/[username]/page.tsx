'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function ProfileCardPage() {
  const params = useParams()
  const router = useRouter()
  const usernameParam = params.username as string

  const [profile, setProfile] = useState<{
    firstName: string
    lastName: string
    email: string
    phone: string
    profilePicture: string | null
    statementSummary: string | null
    introRequest: string | null
    username: string | null
    linkedinUrl: string | null
    twitterUrl: string | null
    facebookUrl: string | null
    instagramUrl: string | null
    websiteUrl: string | null
    skills: string | null
    companyName: string | null
    achievement: string | null
    achievementMethod: string | null
  } | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'saved'>('idle')
  const [isSavingUsername, setIsSavingUsername] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  // Statement editing state
  const [isEditingStatement, setIsEditingStatement] = useState(false)
  const [editedStatement, setEditedStatement] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isSavingStatement, setIsSavingStatement] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is logged in
        const authResponse = await fetch('/api/auth/me')
        const authData = await authResponse.json()
        const loggedIn = authData.success && authData.user
        setIsLoggedIn(loggedIn)

        // Fetch the profile
        const response = await fetch(`/api/user?username=${encodeURIComponent(usernameParam)}`)
        const data = await response.json()

        if (data.user) {
          setProfile(data.user)
          if (data.user.username) {
            setUsername(data.user.username)
            setUsernameStatus('saved')
          }
          // Check if logged-in user is the owner of this profile
          if (loggedIn && authData.user.id === data.user.id) {
            setIsOwner(true)

            // Auto-generate AI summary if owner lands on page without a summary
            if (!data.user.statementSummary && data.user.skills) {
              // Parse skills if needed
              let skills: string[] = []
              try {
                skills = typeof data.user.skills === 'string'
                  ? JSON.parse(data.user.skills)
                  : data.user.skills
              } catch {
                skills = []
              }

              if (Array.isArray(skills) && skills.length > 0) {
                setIsGeneratingAI(true)
                try {
                  const aiResponse = await fetch('/api/user/generate-statement-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      skills,
                      company: data.user.companyName,
                      achievement: data.user.achievement,
                      achievementMethod: data.user.achievementMethod,
                      introRequest: data.user.introRequest,
                      firstName: data.user.firstName,
                    }),
                  })

                  const aiData = await aiResponse.json()

                  if (aiData.success && aiData.statementSummary) {
                    // Save the AI-generated summaries
                    await fetch('/api/user/update-statement', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        statementSummary: aiData.statementSummary,
                        statementSummary3rdPerson: aiData.statementSummary3rdPerson,
                      }),
                    })

                    // Update profile state with new summary
                    setProfile(prev => prev ? {
                      ...prev,
                      statementSummary: aiData.statementSummary,
                    } : null)
                  } else {
                    setAiError(aiData.error || 'Failed to generate summary')
                  }
                } catch (err) {
                  console.error('Auto-generate AI error:', err)
                  setAiError('Failed to auto-generate summary')
                } finally {
                  setIsGeneratingAI(false)
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (usernameParam) {
      fetchData()
    }
  }, [usernameParam])

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
    const shareUrl = `${window.location.origin}/profile/${profile?.username || usernameParam}`

    navigator.clipboard.writeText(shareUrl)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  // Parse skills from JSON string
  const parseSkills = (skillsData: string | null): string[] => {
    if (!skillsData) return []
    try {
      const parsed = JSON.parse(skillsData)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const generateAISummary = async () => {
    if (!profile) return

    setIsGeneratingAI(true)
    setAiError(null)

    try {
      const skills = parseSkills(profile.skills)

      const response = await fetch('/api/user/generate-statement-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          company: profile.companyName,
          achievement: profile.achievement,
          achievementMethod: profile.achievementMethod,
          introRequest: profile.introRequest,
          firstName: profile.firstName,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await saveStatement(data.statementSummary)
      } else {
        setAiError(data.error || 'Failed to generate summary')
      }
    } catch (error) {
      console.error('AI generation error:', error)
      setAiError('Failed to generate summary. Please try again.')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const saveStatement = async (statement: string) => {
    setIsSavingStatement(true)

    try {
      const response = await fetch('/api/user/update-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statementSummary: statement }),
      })

      const data = await response.json()

      if (data.success && profile) {
        setProfile({ ...profile, statementSummary: statement })
        setIsEditingStatement(false)
        setEditedStatement('')
      } else {
        alert(data.error || 'Failed to save summary')
      }
    } catch (error) {
      console.error('Save statement error:', error)
      alert('Failed to save summary. Please try again.')
    } finally {
      setIsSavingStatement(false)
    }
  }

  const handleEditStatement = () => {
    setEditedStatement(profile?.statementSummary || '')
    setIsEditingStatement(true)
    setAiError(null)
  }

  const handleCancelEdit = () => {
    setIsEditingStatement(false)
    setEditedStatement('')
    setAiError(null)
  }

  const handleSaveEditedStatement = async () => {
    if (editedStatement.trim()) {
      await saveStatement(editedStatement.trim())
    }
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
            {/* Profile Header - Centered */}
            <div className="flex flex-col items-center text-center mb-8">
              {/* Profile Picture */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden mb-4">
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

              {/* Name */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Hi, I'm {profile.firstName} {profile.lastName}
              </h2>

              {/* Login message for non-logged-in users */}
              {!isLoggedIn && (profile.email || profile.phone || profile.linkedinUrl || profile.twitterUrl || profile.facebookUrl || profile.instagramUrl || profile.websiteUrl) && (
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg mb-3">
                  <p className="text-xs text-green-700">
                    <a href="/onboarding" className="font-semibold hover:underline">Create an account</a> or <a href="/onboarding" className="font-semibold hover:underline">login</a> to see contact details
                  </p>
                </div>
              )}

              {/* Contact & Social Icons - Centered */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {/* Email */}
                {profile.email && (
                  <a
                    href={isLoggedIn ? `mailto:${profile.email}` : '#'}
                    className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30 cursor-not-allowed'}`}
                    title={isLoggedIn ? profile.email : 'Login to view'}
                    onClick={(e) => !isLoggedIn && e.preventDefault()}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </a>
                )}

                {/* Phone */}
                {profile.phone && (
                  <a
                    href={isLoggedIn ? `tel:${profile.phone}` : '#'}
                    className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30 cursor-not-allowed'}`}
                    title={isLoggedIn ? profile.phone : 'Login to view'}
                    onClick={(e) => !isLoggedIn && e.preventDefault()}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </a>
                )}

                {/* LinkedIn */}
                {profile.linkedinUrl && (
                  <a
                    href={isLoggedIn ? profile.linkedinUrl : '#'}
                    target={isLoggedIn ? "_blank" : undefined}
                    rel={isLoggedIn ? "noopener noreferrer" : undefined}
                    className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30 cursor-not-allowed'}`}
                    title={isLoggedIn ? "LinkedIn" : 'Login to view'}
                    onClick={(e) => !isLoggedIn && e.preventDefault()}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                )}

                {/* Twitter */}
                {profile.twitterUrl && (
                  <a
                    href={isLoggedIn ? profile.twitterUrl : '#'}
                    target={isLoggedIn ? "_blank" : undefined}
                    rel={isLoggedIn ? "noopener noreferrer" : undefined}
                    className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30 cursor-not-allowed'}`}
                    title={isLoggedIn ? "Twitter" : 'Login to view'}
                    onClick={(e) => !isLoggedIn && e.preventDefault()}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                  </a>
                )}

                {/* Facebook */}
                {profile.facebookUrl && (
                  <a
                    href={isLoggedIn ? profile.facebookUrl : '#'}
                    target={isLoggedIn ? "_blank" : undefined}
                    rel={isLoggedIn ? "noopener noreferrer" : undefined}
                    className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30 cursor-not-allowed'}`}
                    title={isLoggedIn ? "Facebook" : 'Login to view'}
                    onClick={(e) => !isLoggedIn && e.preventDefault()}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}

                {/* Instagram */}
                {profile.instagramUrl && (
                  <a
                    href={isLoggedIn ? profile.instagramUrl : '#'}
                    target={isLoggedIn ? "_blank" : undefined}
                    rel={isLoggedIn ? "noopener noreferrer" : undefined}
                    className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30 cursor-not-allowed'}`}
                    title={isLoggedIn ? "Instagram" : 'Login to view'}
                    onClick={(e) => !isLoggedIn && e.preventDefault()}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}

                {/* Website */}
                {profile.websiteUrl && (
                  <a
                    href={isLoggedIn ? profile.websiteUrl : '#'}
                    target={isLoggedIn ? "_blank" : undefined}
                    rel={isLoggedIn ? "noopener noreferrer" : undefined}
                    className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30 cursor-not-allowed'}`}
                    title={isLoggedIn ? "Website" : 'Login to view'}
                    onClick={(e) => !isLoggedIn && e.preventDefault()}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v.878A2.988 2.988 0 0110 16a2.988 2.988 0 01-3-2.122V13a2 2 0 00-2-2H4.332z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Statement Summary */}
            <div className="mb-8">
              {isOwner && isEditingStatement ? (
                <div className="space-y-4">
                  <textarea
                    value={editedStatement}
                    onChange={(e) => setEditedStatement(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 text-lg text-gray-800 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Write your professional summary..."
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSavingStatement}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEditedStatement}
                      disabled={isSavingStatement || !editedStatement.trim()}
                      className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isSavingStatement ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {profile.statementSummary ? (
                    <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-line mb-4">
                      {profile.statementSummary}
                    </p>
                  ) : isGeneratingAI ? (
                    <div className="flex items-center gap-3 text-lg text-gray-500 mb-4">
                      <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating your AI summary...
                    </div>
                  ) : (
                    <p className="text-lg text-gray-400 italic mb-4">
                      {isOwner ? 'No summary yet. Generate one with AI or write your own.' : 'No summary available.'}
                    </p>
                  )}

                  {isOwner && aiError && (
                    <p className="text-sm text-red-600 mb-3">{aiError}</p>
                  )}

                  {/* Only show editing buttons for owner */}
                  {isOwner && (
                    <div className="flex gap-3 flex-wrap">
                      {profile.statementSummary ? (
                        <>
                          <button
                            onClick={handleEditStatement}
                            disabled={isGeneratingAI || isSavingStatement}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={generateAISummary}
                            disabled={isGeneratingAI || isSavingStatement}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {isGeneratingAI ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Regenerating...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Regenerate
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={generateAISummary}
                            disabled={isGeneratingAI || isSavingStatement}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {isGeneratingAI ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Generating...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                AI Generate Summary
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleEditStatement}
                            disabled={isGeneratingAI || isSavingStatement}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Write Manually
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>


            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              {/* Introduce button - shown to everyone except owner */}
              {!isOwner && (
                <a
                  href={`/firstdegree/${profile.username || usernameParam}`}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 text-center"
                >
                  Introduce {profile.firstName} to someone
                </a>
              )}
              {/* Owner-only buttons */}
              {isOwner && (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Username Section - only show for owner */}
          {isOwner && (
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
                  {typeof window !== 'undefined' ? window.location.origin : ''}/profile/{profile?.username || usernameParam}
                </p>
              </div>
            </div>
          )}
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
