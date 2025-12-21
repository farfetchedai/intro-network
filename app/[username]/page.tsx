'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Helper function to determine background style
function getBackgroundStyle(background: string): { className?: string; style?: React.CSSProperties } {
  if (background.startsWith('from-') || background.includes('via-') || background.includes('to-')) {
    return { className: `bg-gradient-to-br ${background}` }
  } else if (background.startsWith('#') || background.startsWith('rgb') || background.startsWith('hsl')) {
    return { style: { backgroundColor: background } }
  } else if (background === 'white' || background === 'transparent') {
    return { className: `bg-${background}` }
  } else {
    return { className: background }
  }
}

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
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
  cardPageBgColor: string | null
  cardBoxBgColor: string | null
  cardTextColor: string | null
  cardBgImage: string | null
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const usernameParam = params.username as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  // Copy URL state
  const [copySuccess, setCopySuccess] = useState(false)

  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionChecked, setConnectionChecked] = useState(false)

  // Statement editing state
  const [isEditingStatement, setIsEditingStatement] = useState(false)
  const [editedStatement, setEditedStatement] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isSavingStatement, setIsSavingStatement] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Card customization state
  const [showCustomization, setShowCustomization] = useState(false)
  const [customPageBgColor, setCustomPageBgColor] = useState('')
  const [customBoxBgColor, setCustomBoxBgColor] = useState('')
  const [customTextColor, setCustomTextColor] = useState('')
  const [customBgImage, setCustomBgImage] = useState('')
  const [isSavingCustomization, setIsSavingCustomization] = useState(false)

  // Branding settings
  const [branding, setBranding] = useState({
    profilePageBackground: 'from-blue-50 via-purple-50 to-pink-50',
    profilePageFormBg: 'white',
    cardPageBgSwatches: ['#f0f9ff', '#fef3c7', '#fce7f3', '#ecfdf5', '#f5f3ff', '#fef2f2'],
    cardBoxBgSwatches: ['#ffffff', '#f9fafb', '#fef3c7', '#fce7f3', '#ecfdf5', '#1f2937'],
    cardTextSwatches: ['#111827', '#374151', '#6b7280', '#ffffff', '#1e40af', '#7c3aed'],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch branding settings
        const brandingResponse = await fetch('/api/admin/branding')
        const brandingData = await brandingResponse.json()
        if (brandingData.success && brandingData.settings) {
          // Parse color swatches from JSON strings
          let pageBgSwatches = ['#f0f9ff', '#fef3c7', '#fce7f3', '#ecfdf5', '#f5f3ff', '#fef2f2']
          let boxBgSwatches = ['#ffffff', '#f9fafb', '#fef3c7', '#fce7f3', '#ecfdf5', '#1f2937']
          let textSwatches = ['#111827', '#374151', '#6b7280', '#ffffff', '#1e40af', '#7c3aed']

          try {
            if (brandingData.settings.cardPageBgSwatches) {
              pageBgSwatches = JSON.parse(brandingData.settings.cardPageBgSwatches)
            }
            if (brandingData.settings.cardBoxBgSwatches) {
              boxBgSwatches = JSON.parse(brandingData.settings.cardBoxBgSwatches)
            }
            if (brandingData.settings.cardTextSwatches) {
              textSwatches = JSON.parse(brandingData.settings.cardTextSwatches)
            }
          } catch (e) {
            console.error('Failed to parse color swatches:', e)
          }

          setBranding({
            profilePageBackground: brandingData.settings.profilePageBackground || 'from-blue-50 via-purple-50 to-pink-50',
            profilePageFormBg: brandingData.settings.profilePageFormBg || 'white',
            cardPageBgSwatches: pageBgSwatches,
            cardBoxBgSwatches: boxBgSwatches,
            cardTextSwatches: textSwatches,
          })
        }

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

          // Populate customization state from profile
          if (data.user.cardPageBgColor) setCustomPageBgColor(data.user.cardPageBgColor)
          if (data.user.cardBoxBgColor) setCustomBoxBgColor(data.user.cardBoxBgColor)
          if (data.user.cardTextColor) setCustomTextColor(data.user.cardTextColor)
          if (data.user.cardBgImage) setCustomBgImage(data.user.cardBgImage)

          // Check connection status
          const connectionResponse = await fetch(`/api/user/add-connection?targetUserId=${data.user.id}`)
          const connectionData = await connectionResponse.json()
          if (connectionData.success) {
            setIsConnected(connectionData.isConnected)
          }
          setConnectionChecked(true)

          // Check if logged-in user is the owner of this profile
          if (loggedIn && authData.user.id === data.user.id) {
            setIsOwner(true)

            // Auto-generate AI summary if owner lands on page without a summary
            if (!data.user.statementSummary && data.user.skills) {
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
                    await fetch('/api/user/update-statement', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        statementSummary: aiData.statementSummary,
                        statementSummary3rdPerson: aiData.statementSummary3rdPerson,
                      }),
                    })

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

  const handleIconClick = (e: React.MouseEvent<HTMLAnchorElement>, url?: string | null) => {
    if (!isLoggedIn) {
      e.preventDefault()
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 5000)
    } else if (!url) {
      e.preventDefault()
    }
  }

  const handleConnect = async () => {
    if (!profile) return

    // If not logged in, store pending connection and redirect to onboarding
    if (!isLoggedIn) {
      localStorage.setItem('pendingConnection', JSON.stringify({
        userId: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
      }))
      router.push('/onboarding')
      return
    }

    setIsConnecting(true)
    try {
      const response = await fetch('/api/user/add-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: profile.id }),
      })
      const data = await response.json()

      if (data.success) {
        setIsConnected(true)
      } else if (data.alreadyConnected) {
        setIsConnected(true)
      } else {
        alert(data.error || 'Failed to connect')
      }
    } catch (error) {
      console.error('Connect error:', error)
      alert('Failed to connect. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleCopyShareUrl = () => {
    const shareUrl = `${window.location.origin}/${profile?.username || usernameParam}`
    navigator.clipboard.writeText(shareUrl)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

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

  const handleSaveCustomization = async () => {
    setIsSavingCustomization(true)
    try {
      const response = await fetch('/api/user/card-customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardPageBgColor: customPageBgColor || null,
          cardBoxBgColor: customBoxBgColor || null,
          cardTextColor: customTextColor || null,
          cardBgImage: customBgImage || null,
        }),
      })

      const data = await response.json()

      if (data.success && profile) {
        setProfile({
          ...profile,
          cardPageBgColor: customPageBgColor || null,
          cardBoxBgColor: customBoxBgColor || null,
          cardTextColor: customTextColor || null,
          cardBgImage: customBgImage || null,
        })
        setShowCustomization(false)
      } else {
        alert(data.error || 'Failed to save customization')
      }
    } catch (error) {
      console.error('Save customization error:', error)
      alert('Failed to save customization. Please try again.')
    } finally {
      setIsSavingCustomization(false)
    }
  }

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCustomBgImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleResetCustomization = () => {
    setCustomPageBgColor('')
    setCustomBoxBgColor('')
    setCustomTextColor('')
    setCustomBgImage('')
  }

  const bgStyle = getBackgroundStyle(branding.profilePageBackground)
  const formStyle = getBackgroundStyle(branding.profilePageFormBg)

  const hasContactInfo = profile?.email || profile?.phone || profile?.linkedinUrl || profile?.twitterUrl || profile?.facebookUrl || profile?.instagramUrl || profile?.websiteUrl

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgStyle.className || ''}`} style={bgStyle.style}>
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgStyle.className || ''}`} style={bgStyle.style}>
        <div className="text-xl text-gray-600">Profile not found</div>
      </div>
    )
  }

  // Determine effective background and card styles
  const effectivePageBgStyle = customPageBgColor
    ? { backgroundColor: customPageBgColor }
    : bgStyle.style
  const effectivePageBgClass = customPageBgColor ? '' : (bgStyle.className || '')

  const effectiveCardBgStyle = customBoxBgColor
    ? { backgroundColor: customBoxBgColor }
    : formStyle.style
  const effectiveCardBgClass = customBoxBgColor ? '' : (formStyle.className || 'bg-white')

  const effectiveTextColor = customTextColor || ''

  return (
    <div
      className={`min-h-screen flex flex-col ${effectivePageBgClass} relative`}
      style={effectivePageBgStyle}
    >
      {/* Background Image */}
      {customBgImage && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${customBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      <Header />

      <main className="flex-1 pt-24 pb-12 px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <div
            className={`rounded-3xl shadow-2xl p-8 md:p-12 ${effectiveCardBgClass}`}
            style={effectiveCardBgStyle}
          >
            {/* Profile Header - Centered */}
            <div className="flex flex-col items-center text-center mb-8">
              {/* Profile Picture */}
              <div className="bus-card-profile-pic w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden mb-4">
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
              <h2
                className="text-3xl font-bold mb-1"
                style={{ color: effectiveTextColor || '#111827' }}
              >
                Hi, I'm {profile.firstName} {profile.lastName}
              </h2>

              {/* Username */}
              {profile.username && (
                <h3
                  className="bus-card-username"
                  style={effectiveTextColor ? { color: effectiveTextColor, opacity: 0.7 } : undefined}
                >
                  @{profile.username}
                </h3>
              )}
            </div>

            {/* Statement Summary */}
            <div className="mb-6">
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
                    <p
                      className="text-xl leading-relaxed whitespace-pre-line text-center"
                      style={{ color: effectiveTextColor || '#1f2937' }}
                    >
                      {profile.statementSummary}
                    </p>
                  ) : isGeneratingAI ? (
                    <div className="flex items-center justify-center gap-3 text-lg text-gray-500 mb-4">
                      <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating your AI summary...
                    </div>
                  ) : (
                    <p className="text-lg text-gray-400 italic mb-4 text-center">
                      {isOwner ? 'No summary yet. Generate one with AI or write your own.' : 'No summary available.'}
                    </p>
                  )}

                  {isOwner && aiError && (
                    <p className="text-sm text-red-600 mb-3 text-center">{aiError}</p>
                  )}

                  {/* Owner editing buttons */}
                  {isOwner && (
                    <div className="flex gap-3 flex-wrap justify-center mt-4">
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
                          {/* Colors Button */}
                          <button
                            onClick={() => setShowCustomization(!showCustomization)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                              showCustomization
                                ? 'text-white bg-gradient-to-r from-amber-500 to-orange-500'
                                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                            }`}
                            title="Customize card colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                            </svg>
                            Colors
                          </button>
                        </>
                      ) : !isGeneratingAI && (
                        <>
                          <button
                            onClick={generateAISummary}
                            disabled={isGeneratingAI || isSavingStatement}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            AI Generate Summary
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

            {/* Customization Panel */}
            {isOwner && showCustomization && (
              <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl animate-fadeIn">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Customize Your Card
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Page Background Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Background
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {branding.cardPageBgSwatches.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCustomPageBgColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            customPageBgColor === color ? 'border-blue-500 scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      <input
                        type="color"
                        value={customPageBgColor || '#ffffff'}
                        onChange={(e) => setCustomPageBgColor(e.target.value)}
                        className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300"
                        title="Custom color"
                      />
                    </div>
                  </div>

                  {/* Card Background Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Background
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {branding.cardBoxBgSwatches.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCustomBoxBgColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            customBoxBgColor === color ? 'border-blue-500 scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      <input
                        type="color"
                        value={customBoxBgColor || '#ffffff'}
                        onChange={(e) => setCustomBoxBgColor(e.target.value)}
                        className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300"
                        title="Custom color"
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {branding.cardTextSwatches.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCustomTextColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            customTextColor === color ? 'border-blue-500 scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      <input
                        type="color"
                        value={customTextColor || '#111827'}
                        onChange={(e) => setCustomTextColor(e.target.value)}
                        className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300"
                        title="Custom color"
                      />
                    </div>
                  </div>

                  {/* Background Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Image
                    </label>
                    <div className="flex gap-2 items-center">
                      <label className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBgImageUpload}
                          className="hidden"
                        />
                      </label>
                      {customBgImage && (
                        <button
                          onClick={() => setCustomBgImage('')}
                          className="px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {customBgImage && (
                      <div className="mt-2 relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img src={customBgImage} alt="Background preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleResetCustomization}
                    className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={handleSaveCustomization}
                    disabled={isSavingCustomization}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSavingCustomization ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Login message for non-logged-in users */}
            {!isLoggedIn && hasContactInfo && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg mb-3">
                <p className="text-xs text-green-700 text-center">
                  <a href="/onboarding" className="font-semibold hover:underline">Create an account</a> or <a href="/onboarding" className="font-semibold hover:underline">login</a> to see contact details
                </p>
              </div>
            )}

            {/* Green Message for logged-out users (shown on click) */}
            {showMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium text-center">
                  Please create an account and login to see their contact details
                </p>
              </div>
            )}

            {/* Contact & Social Icons - Centered */}
            <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
              {profile.email && (
                <a
                  href={isLoggedIn ? `mailto:${profile.email}` : '#'}
                  onClick={(e) => handleIconClick(e, profile.email)}
                  className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors cursor-pointer ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30'}`}
                  title={isLoggedIn ? profile.email : 'Login to see contact details'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </a>
              )}

              {profile.phone && (
                <a
                  href={isLoggedIn ? `tel:${profile.phone}` : '#'}
                  onClick={(e) => handleIconClick(e, profile.phone)}
                  className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors cursor-pointer ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30'}`}
                  title={isLoggedIn ? profile.phone : 'Login to see contact details'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </a>
              )}

              {profile.linkedinUrl && (
                <a
                  href={isLoggedIn ? profile.linkedinUrl : '#'}
                  onClick={(e) => handleIconClick(e, profile.linkedinUrl)}
                  target={isLoggedIn ? "_blank" : undefined}
                  rel={isLoggedIn ? "noopener noreferrer" : undefined}
                  className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors cursor-pointer ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30'}`}
                  title={isLoggedIn ? 'LinkedIn' : 'Login to see contact details'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}

              {profile.twitterUrl && (
                <a
                  href={isLoggedIn ? profile.twitterUrl : '#'}
                  onClick={(e) => handleIconClick(e, profile.twitterUrl)}
                  target={isLoggedIn ? "_blank" : undefined}
                  rel={isLoggedIn ? "noopener noreferrer" : undefined}
                  className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors cursor-pointer ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30'}`}
                  title={isLoggedIn ? 'Twitter' : 'Login to see contact details'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
              )}

              {profile.facebookUrl && (
                <a
                  href={isLoggedIn ? profile.facebookUrl : '#'}
                  onClick={(e) => handleIconClick(e, profile.facebookUrl)}
                  target={isLoggedIn ? "_blank" : undefined}
                  rel={isLoggedIn ? "noopener noreferrer" : undefined}
                  className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors cursor-pointer ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30'}`}
                  title={isLoggedIn ? 'Facebook' : 'Login to see contact details'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}

              {profile.instagramUrl && (
                <a
                  href={isLoggedIn ? profile.instagramUrl : '#'}
                  onClick={(e) => handleIconClick(e, profile.instagramUrl)}
                  target={isLoggedIn ? "_blank" : undefined}
                  rel={isLoggedIn ? "noopener noreferrer" : undefined}
                  className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors cursor-pointer ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30'}`}
                  title={isLoggedIn ? 'Instagram' : 'Login to see contact details'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}

              {profile.websiteUrl && (
                <a
                  href={isLoggedIn ? profile.websiteUrl : '#'}
                  onClick={(e) => handleIconClick(e, profile.websiteUrl)}
                  target={isLoggedIn ? "_blank" : undefined}
                  rel={isLoggedIn ? "noopener noreferrer" : undefined}
                  className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors cursor-pointer ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30'}`}
                  title={isLoggedIn ? 'Website' : 'Login to see contact details'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v.878A2.988 2.988 0 0110 16a2.988 2.988 0 01-3-2.122V13a2 2 0 00-2-2H4.332z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {!isOwner && (
                <>
                  <a
                    href={`/firstdegree/${profile.username || usernameParam}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 text-center"
                  >
                    Introduce {profile.firstName} to someone
                  </a>
                  {connectionChecked && !isConnected && (
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Connect with {profile.firstName}
                        </>
                      )}
                    </button>
                  )}
                  {connectionChecked && isConnected && (
                    <div className="flex-1 bg-gray-100 text-gray-600 font-semibold py-4 rounded-xl flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Connected
                    </div>
                  )}
                </>
              )}
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
                  <button
                    onClick={() => router.push('/getintros')}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Ask for Intros
                  </button>
                </>
              )}
            </div>

            {/* Copy Share URL - only show for owner */}
            {isOwner && (
              <div className="pt-4">
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
                  {typeof window !== 'undefined' ? window.location.origin : ''}/{profile?.username || usernameParam}
                </p>
              </div>
            )}

            {/* QR Code - hidden on mobile, shown on desktop */}
            <div className="hidden md:flex flex-col items-center pt-6 border-t border-gray-200 mt-6">
              <p className="text-sm text-gray-500 mb-3">Scan to save contact</p>
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <QRCodeSVG
                  value={typeof window !== 'undefined' ? `${window.location.origin}/api/user/vcard/${profile.username || profile.id}` : ''}
                  size={120}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Downloads contact card (VCF)</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
