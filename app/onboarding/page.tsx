'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import BottomProgressBar from '@/components/BottomProgressBar'
import CountryCodeSelect from '@/components/CountryCodeSelect'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [devLink, setDevLink] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [linkedInConnected, setLinkedInConnected] = useState(false)

  // Step 1: Contact Details
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
  })
  const [countryCodeIso, setCountryCodeIso] = useState('US')

  // Step 2: Profile Picture
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('')

  // Username
  const [username, setUsername] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [isCurrentUsername, setIsCurrentUsername] = useState(false)

  // Step 3: Skills and Intro Request
  const [skill1, setSkill1] = useState('')
  const [skill2, setSkill2] = useState('')
  const [introRequest, setIntroRequest] = useState('')

  // Step 4: Top Achievement
  const [achievement, setAchievement] = useState({
    company: '',
    achievement: '',
    achievementMethod: '',
  })

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string>('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  // AI Profile toggle
  const [hasExistingAIProfile, setHasExistingAIProfile] = useState(false)
  const [enableAIGeneration, setEnableAIGeneration] = useState(true)

  // Branding settings
  const [brandingSettings, setBrandingSettings] = useState({
    flowCStep1Background: 'from-blue-400 via-purple-400 to-pink-400',
    flowCStep2Background: 'from-emerald-400 via-teal-400 to-cyan-400',
    flowCStep3Background: 'from-orange-400 via-rose-400 to-pink-400',
    flowCStep4Background: 'from-violet-400 via-purple-400 to-fuchsia-400',
    flowCStep1FormBg: 'white',
    flowCStep2FormBg: 'white',
    flowCStep3FormBg: 'white',
    flowCStep4FormBg: 'white',
  })

  // Check username availability with debouncing
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setCheckingUsername(true)
      try {
        const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
        const data = await response.json()
        setUsernameAvailable(data.available)
        setIsCurrentUsername(data.isCurrentUser || false)
      } catch (error) {
        console.error('Error checking username:', error)
        setUsernameAvailable(null)
        setIsCurrentUsername(false)
      } finally {
        setCheckingUsername(false)
      }
    }, 500) // Debounce for 500ms

    return () => clearTimeout(timeoutId)
  }, [username])

  // Fetch current user and pre-populate form if logged in
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()

        if (data.user) {
          // User is logged in - pre-populate form fields
          setUserId(data.user.id)

          // Split phone number into country code and number
          let countryCode = '+1'
          let countryIso = 'US'
          let phoneNumber = ''
          if (data.user.phone) {
            // Try to extract country code from phone number
            const phone = data.user.phone
            if (phone.startsWith('+')) {
              // Find the longest matching country code
              // Common codes sorted by length (longest first for accurate matching)
              const commonCodes = [
                '+1868', '+1869', '+1876', '+1784', '+1767', '+1758', '+1721', '+1684', '+1671', '+1670',
                '+1649', '+1473', '+1441', '+1345', '+1284', '+1268', '+1264', '+1246', '+1242',
                '+1939', '+1787', '+1809', '+1829', '+1849',
                '+998', '+996', '+995', '+994', '+993', '+992', '+977', '+976', '+975', '+974',
                '+973', '+972', '+971', '+970', '+968', '+967', '+966', '+965', '+964', '+963',
                '+962', '+961', '+960', '+886', '+880', '+856', '+855', '+853', '+852', '+850',
                '+692', '+691', '+690', '+689', '+688', '+687', '+686', '+685', '+683', '+682',
                '+681', '+680', '+679', '+678', '+677', '+676', '+675', '+674', '+673', '+672',
                '+670', '+599', '+598', '+597', '+595', '+593', '+592', '+591', '+590', '+509',
                '+508', '+507', '+506', '+505', '+504', '+503', '+502', '+501', '+500', '+423',
                '+421', '+420', '+389', '+387', '+386', '+385', '+383', '+382', '+381', '+380',
                '+379', '+378', '+377', '+376', '+375', '+374', '+373', '+372', '+371', '+370',
                '+359', '+358', '+357', '+356', '+355', '+354', '+353', '+352', '+351', '+350',
                '+299', '+298', '+297', '+291', '+290', '+269', '+268', '+267', '+266', '+265',
                '+264', '+263', '+262', '+261', '+260', '+258', '+257', '+256', '+255', '+254',
                '+253', '+252', '+251', '+250', '+249', '+248', '+247', '+246', '+245', '+244',
                '+243', '+242', '+241', '+240', '+239', '+238', '+237', '+236', '+235', '+234',
                '+233', '+232', '+231', '+230', '+229', '+228', '+227', '+226', '+225', '+224',
                '+223', '+222', '+221', '+220', '+218', '+216', '+213', '+212', '+211', '+98',
                '+95', '+94', '+93', '+92', '+91', '+90', '+86', '+84', '+82', '+81', '+66',
                '+65', '+64', '+63', '+62', '+61', '+60', '+58', '+57', '+56', '+55', '+54',
                '+53', '+52', '+51', '+49', '+48', '+47', '+46', '+45', '+44', '+43', '+41',
                '+40', '+39', '+36', '+34', '+33', '+32', '+31', '+30', '+27', '+20', '+7', '+1'
              ]

              let foundCode = '+1'
              for (const code of commonCodes) {
                if (phone.startsWith(code)) {
                  foundCode = code
                  break
                }
              }
              countryCode = foundCode
              phoneNumber = phone.substring(foundCode.length)

              // Set default ISO code for shared dial codes
              if (foundCode === '+1') {
                countryIso = 'US' // Default to US for +1
              } else if (foundCode === '+7') {
                countryIso = 'RU' // Default to Russia for +7
              } else if (foundCode === '+44') {
                countryIso = 'GB'
              }
            } else {
              phoneNumber = phone
            }
          }

          setFormData({
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            email: data.user.email || '',
            phone: phoneNumber,
            countryCode,
          })
          setCountryCodeIso(countryIso)

          // Pre-populate skills if available
          if (data.user.skills) {
            try {
              const skills = JSON.parse(data.user.skills)
              if (Array.isArray(skills)) {
                setSkill1(skills[0] || '')
                setSkill2(skills[1] || '')
              }
            } catch (e) {
              // Skills not in expected format
            }
          }

          // Pre-populate achievement data
          if (data.user.companyName || data.user.achievement || data.user.achievementMethod) {
            setAchievement({
              company: data.user.companyName || '',
              achievement: data.user.achievement || '',
              achievementMethod: data.user.achievementMethod || '',
            })
          }

          // Pre-populate intro request if available
          if (data.user.introRequest) {
            setIntroRequest(data.user.introRequest)
          }

          // Pre-populate profile picture if available
          if (data.user.profilePicture) {
            setProfilePicturePreview(data.user.profilePicture)
          }

          // Pre-populate username if available
          if (data.user.username) {
            setUsername(data.user.username)
            setUsernameAvailable(true) // Username already belongs to this user
            setIsCurrentUsername(true) // Mark as current user's username
          }

          // Check if user already has AI-generated profile
          if (data.user.statementSummary) {
            setHasExistingAIProfile(true)
            setEnableAIGeneration(true) // Default to enabled, user can toggle off
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  // Check for LinkedIn OAuth callback
  useEffect(() => {
    const linkedInParam = searchParams.get('linkedin')
    if (linkedInParam === 'connected') {
      setLinkedInConnected(true)
      // User just logged in via LinkedIn - skip to step 2
      // The user data will be fetched by fetchCurrentUser effect
      setStep(2)
      // Clean up the URL
      const url = new URL(window.location.href)
      url.searchParams.delete('linkedin')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  // Fetch branding settings
  useEffect(() => {
    fetch('/api/admin/branding')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setBrandingSettings({
            flowCStep1Background: data.settings.flowCStep1Background || 'from-blue-400 via-purple-400 to-pink-400',
            flowCStep2Background: data.settings.flowCStep2Background || 'from-emerald-400 via-teal-400 to-cyan-400',
            flowCStep3Background: data.settings.flowCStep3Background || 'from-orange-400 via-rose-400 to-pink-400',
            flowCStep4Background: data.settings.flowCStep4Background || 'from-violet-400 via-purple-400 to-fuchsia-400',
            flowCStep1FormBg: data.settings.flowCStep1FormBg || 'white',
            flowCStep2FormBg: data.settings.flowCStep2FormBg || 'white',
            flowCStep3FormBg: data.settings.flowCStep3FormBg || 'white',
            flowCStep4FormBg: data.settings.flowCStep4FormBg || 'white',
          })
        }
      })
      .catch(err => console.error('Failed to fetch branding settings:', err))
  }, [])

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setValidationErrors({})

    try {
      // Combine country code and phone number
      const fullPhone = formData.phone ? `${formData.countryCode}${formData.phone}` : ''

      const response = await fetch('/api/referee/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: fullPhone,
          skills: [], // Will be updated in step 3
          companyName: '', // Will be updated in step 4
          achievement: '',
          achievementMethod: '',
          statementSummary: '',
          introRequest: '',
          userId: userId || undefined, // Pass userId if user is logged in
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Check if this is an existing user (magic link sent)
        if (data.magicLinkSent && data.user.email) {
          setUserEmail(data.user.email)
          setMagicLinkSent(true)
          if (data.devLink) {
            setDevLink(data.devLink)
          }
          // Don't proceed to step 2 - show magic link message instead
        } else {
          // New user or logged-in user - proceed to step 2
          setUserId(data.user.id)

          // Handle pending connection from profile page
          const pendingConnectionData = localStorage.getItem('pendingConnection')
          if (pendingConnectionData) {
            try {
              const pendingConnection = JSON.parse(pendingConnectionData)
              // Create the connection
              const connectionResponse = await fetch('/api/user/add-connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: pendingConnection.userId }),
              })
              const connectionData = await connectionResponse.json()
              if (connectionData.success) {
                console.log(`Connected with ${pendingConnection.firstName} ${pendingConnection.lastName}`)
              }
              // Clear pending connection regardless of success
              localStorage.removeItem('pendingConnection')
            } catch (error) {
              console.error('Error processing pending connection:', error)
              localStorage.removeItem('pendingConnection')
            }
          }

          setStep(2)
        }
      } else {
        // Parse validation errors if available
        if (data.details && Array.isArray(data.details)) {
          const errors: Record<string, string> = {}
          data.details.forEach((detail: any) => {
            if (detail.path && detail.path.length > 0) {
              const fieldName = detail.path[0]
              errors[fieldName] = detail.message
            }
          })
          setValidationErrors(errors)
        }
        alert(data.error || 'Failed to create account. Please check the form for errors.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if username is available before continuing
    if (usernameAvailable !== true) {
      alert('Please choose an available username')
      return
    }

    // Save profile picture and username
    if (userId) {
      try {
        const fullPhone = formData.phone ? `${formData.countryCode}${formData.phone}` : ''

        const response = await fetch('/api/referee/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: fullPhone,
            profilePicture: profilePicturePreview || null,
            username,
            userId,
          }),
        })

        const data = await response.json()

        if (!data.success) {
          alert(data.error || 'Failed to save profile')
          return
        }
      } catch (error) {
        console.error('Error saving profile:', error)
        alert('Failed to save profile')
        return
      }
    }

    setStep(3)
  }

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setValidationErrors({})

    const skills = [skill1, skill2].filter(s => s.trim() !== '')

    try {
      // Combine country code and phone number
      const fullPhone = formData.phone ? `${formData.countryCode}${formData.phone}` : ''

      const response = await fetch('/api/referee/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: fullPhone,
          userId,
          skills,
          introRequest,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStep(4)
      } else {
        // Parse validation errors if available
        if (data.details && Array.isArray(data.details)) {
          const errors: Record<string, string> = {}
          data.details.forEach((detail: any) => {
            if (detail.path && detail.path.length > 0) {
              const fieldName = detail.path[0]
              errors[fieldName] = detail.message
            }
          })
          setValidationErrors(errors)
        }
        alert(data.error || 'Failed to update profile. Please check the form for errors.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const handleStep4Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setValidationErrors({})
    setGeneralError('')
    setIsGeneratingAI(true)

    const skills = [skill1, skill2].filter(s => s.trim() !== '')

    try {
      // Combine country code and phone number
      const fullPhone = formData.phone ? `${formData.countryCode}${formData.phone}` : ''

      // First, save the profile data (without AI-generated summary)
      const response = await fetch('/api/referee/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: fullPhone,
          profilePicture: profilePicturePreview || null,
          userId,
          skills,
          companyName: achievement.company,
          achievement: achievement.achievement,
          achievementMethod: achievement.achievementMethod,
          introRequest,
        }),
      })

      const data = await response.json()

      if (data.success) {
        console.log('Registration successful, user data:', data.user)

        // Generate AI summary if skills are provided and AI generation is enabled
        // Skip if user has existing profile and chose to disable regeneration
        if (skills.length > 0 && enableAIGeneration) {
          try {
            console.log('Generating AI summary with:', { skills, company: achievement.company, firstName: formData.firstName })
            const aiResponse = await fetch('/api/user/generate-statement-ai', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                skills,
                company: achievement.company,
                achievement: achievement.achievement,
                achievementMethod: achievement.achievementMethod,
                introRequest,
                firstName: formData.firstName,
              }),
            })

            const aiData = await aiResponse.json()
            console.log('AI generation response:', aiData)

            if (aiData.success && aiData.statementSummary) {
              // Save both AI-generated summaries (1st person and 3rd person)
              // Pass userId from the registration response since cookie may not be set yet
              const targetUserId = data.user?.id || userId
              console.log('Saving statement for userId:', targetUserId)

              const updatePayload = {
                statementSummary: aiData.statementSummary,
                statementSummary3rdPerson: aiData.statementSummary3rdPerson,
                userId: targetUserId,
              }
              console.log('Update statement payload:', updatePayload)

              const updateResponse = await fetch('/api/user/update-statement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
              })

              console.log('Update statement response status:', updateResponse.status)
              const updateText = await updateResponse.text()
              console.log('Update statement raw response:', updateText)

              let updateResult
              try {
                updateResult = JSON.parse(updateText)
              } catch (e) {
                console.error('Failed to parse update response:', e)
                updateResult = { error: 'Invalid JSON response' }
              }

              if (updateResponse.status !== 200 || updateResult.error) {
                console.error('Failed to save statement:', updateResult.error || `Status ${updateResponse.status}`)
              } else {
                console.log('Statement saved successfully')
              }
            } else {
              console.error('AI generation failed:', aiData.error || 'Unknown error')
            }
          } catch (aiError) {
            // AI generation failed, but profile was saved - continue to profile page
            console.error('AI generation error:', aiError)
          }
        } else {
          console.log('No skills provided, skipping AI generation')
        }

        // Small delay to ensure database write completes before redirect
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push(`/${username || userId}`)
      } else {
        console.log('Error response:', data)

        // Parse validation errors if available
        if (data.details && Array.isArray(data.details)) {
          const errors: Record<string, string> = {}
          data.details.forEach((detail: any) => {
            if (detail.path && detail.path.length > 0) {
              const fieldName = detail.path[0]
              errors[fieldName] = detail.message
            }
          })
          setValidationErrors(errors)

          // Only show general error if there are no field-specific errors
          if (Object.keys(errors).length === 0) {
            setGeneralError(data.error || 'Failed to complete profile')
          }
        } else {
          // No validation details, show general error
          setGeneralError(data.error || 'Failed to complete profile')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setGeneralError('An error occurred while saving your profile')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getStepBackgroundClass = () => {
    let bg = brandingSettings.flowCStep1Background
    if (step === 2) bg = brandingSettings.flowCStep2Background
    if (step === 3) bg = brandingSettings.flowCStep3Background
    if (step === 4) bg = brandingSettings.flowCStep4Background

    if (bg.startsWith('#') || bg.startsWith('rgb')) {
      return ''
    }
    return bg
  }

  const getStepBackgroundStyle = () => {
    let bg = brandingSettings.flowCStep1Background
    if (step === 2) bg = brandingSettings.flowCStep2Background
    if (step === 3) bg = brandingSettings.flowCStep3Background
    if (step === 4) bg = brandingSettings.flowCStep4Background

    if (bg.startsWith('#') || bg.startsWith('rgb')) {
      return { backgroundColor: bg }
    }
    return {}
  }

  const getFormBackgroundStyle = () => {
    let bg = brandingSettings.flowCStep1FormBg
    if (step === 2) bg = brandingSettings.flowCStep2FormBg
    if (step === 3) bg = brandingSettings.flowCStep3FormBg
    if (step === 4) bg = brandingSettings.flowCStep4FormBg

    // If it's a Tailwind gradient class (contains "from-" etc), don't apply inline style
    if (bg.includes('from-') || bg.includes('to-') || bg.includes('via-')) {
      return {}
    }
    // Otherwise it's a color value (hex, rgb, or named color like "white")
    return { backgroundColor: bg }
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${getStepBackgroundClass()} transition-all duration-700 ease-in-out`}
      style={getStepBackgroundStyle()}
    >
      <Header />
      <BottomProgressBar currentStep={step} totalSteps={4} />

      <main className="pt-16 pb-24 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Step 1: Contact Details */}
          {step === 1 && (
            <div className="backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 animate-fadeIn" style={getFormBackgroundStyle()}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Let's get started
              </h2>
              <p className="text-gray-600 mb-8">
                Tell us a bit about yourself
              </p>

              {/* LinkedIn Login Button */}
              {!magicLinkSent && (
                <>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/api/auth/linkedin?returnTo=/onboarding'}
                    className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] text-white font-semibold py-4 rounded-xl hover:bg-[#004182] transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Continue with LinkedIn
                  </button>

                  <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-gray-500 text-sm">or enter manually</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                </>
              )}

              {/* Magic Link Success Message */}
              {magicLinkSent && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-900 mb-2">
                        Welcome back!
                      </h3>
                      <p className="text-green-800 mb-3">
                        We've sent a login link to <strong>{userEmail}</strong>
                      </p>
                      <p className="text-green-700 text-sm mb-3">
                        Please check your email and click the link to access your account. The link will expire in 15 minutes.
                      </p>
                      {devLink && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                          <p className="text-sm text-yellow-900 font-semibold mb-2">Development Mode - Login Link:</p>
                          <a
                            href={devLink}
                            className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {devLink}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleStep1Submit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                >
                  Continue →
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Profile Picture */}
          {step === 2 && (
            <div className="backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 animate-fadeIn" style={getFormBackgroundStyle()}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Add your profile picture
              </h2>
              <p className="text-gray-600 mb-8">
                Help people recognize you
              </p>

              <form onSubmit={handleStep2Submit} className="space-y-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mb-6 overflow-hidden">
                    {profilePicturePreview ? (
                      <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  <label className="cursor-pointer bg-white border-2 border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                    Choose Photo
                  </label>

                  <p className="text-sm text-gray-500 mt-4">
                    JPG, PNG or GIF (Max 5MB)
                  </p>
                </div>

                {/* Username Field */}
                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Choose your username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="yourusername"
                      className={`w-full rounded-xl border-2 px-4 py-3 text-gray-900 focus:ring-2 transition-all ${
                        username.length >= 3 && usernameAvailable === false
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                          : username.length >= 3 && usernameAvailable === true
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      required
                      minLength={3}
                    />
                    {checkingUsername && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                    {!checkingUsername && username.length >= 3 && usernameAvailable === true && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {!checkingUsername && username.length >= 3 && usernameAvailable === false && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {username.length >= 3 && usernameAvailable === false && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      This username is already taken
                    </p>
                  )}
                  {username.length >= 3 && usernameAvailable === true && (
                    <p className="mt-2 text-sm text-green-600 font-medium">
                      {isCurrentUsername ? 'This is your current username.' : 'Username is available!'}
                    </p>
                  )}
                  {username.length > 0 && username.length < 3 && (
                    <p className="mt-2 text-sm text-gray-500">
                      Username must be at least 3 characters
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Only lowercase letters, numbers, and underscores
                  </p>
                </div>

                {/* Phone Number Field */}
                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex gap-3">
                    <CountryCodeSelect
                      value={formData.countryCode}
                      selectedCountryCode={countryCodeIso}
                      onChange={(value, code) => {
                        setFormData({ ...formData, countryCode: value })
                        setCountryCodeIso(code)
                      }}
                    />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Continue →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Skills and Intro Request */}
          {step === 3 && (
            <div className="backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 animate-fadeIn" style={getFormBackgroundStyle()}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Your skills & interests
              </h2>
              <p className="text-gray-600 mb-8">
                What are you great at?
              </p>

              <form onSubmit={handleStep3Submit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Skill
                  </label>
                  <input
                    type="text"
                    value={skill1}
                    onChange={(e) => setSkill1(e.target.value)}
                    placeholder="e.g., Product Management"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Secondary Skill (Optional)
                  </label>
                  <input
                    type="text"
                    value={skill2}
                    onChange={(e) => setSkill2(e.target.value)}
                    placeholder="e.g., Data Analytics"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    I'd love to be introduced to
                  </label>
                  <input
                    type="text"
                    value={introRequest}
                    onChange={(e) => setIntroRequest(e.target.value)}
                    placeholder="Roles, Sectors or People"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Continue →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 4: Top Achievement */}
          {step === 4 && (
            <div className="backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 animate-fadeIn" style={getFormBackgroundStyle()}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Your top achievement
              </h2>
              <p className="text-gray-600 mb-8">
                What are you most proud of?
              </p>

              {/* General error banner */}
              {generalError && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl">
                  <p className="text-red-700 font-medium">{generalError}</p>
                </div>
              )}

              <form onSubmit={handleStep4Submit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={achievement.company}
                    onChange={(e) => {
                      setAchievement({ ...achievement, company: e.target.value })
                      // Clear error when user starts typing
                      if (validationErrors.companyName) {
                        setValidationErrors({ ...validationErrors, companyName: '' })
                      }
                    }}
                    placeholder="e.g., Google"
                    className={`w-full rounded-xl border-2 px-4 py-3 text-gray-900 focus:ring-2 transition-all ${
                      validationErrors.companyName
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    required
                  />
                  {validationErrors.companyName && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {validationErrors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Achievement
                  </label>
                  <input
                    type="text"
                    value={achievement.achievement}
                    onChange={(e) => {
                      setAchievement({ ...achievement, achievement: e.target.value })
                      // Clear error when user starts typing
                      if (validationErrors.achievement) {
                        setValidationErrors({ ...validationErrors, achievement: '' })
                      }
                    }}
                    placeholder="e.g., increased user engagement by 40%"
                    className={`w-full rounded-xl border-2 px-4 py-3 text-gray-900 focus:ring-2 transition-all ${
                      validationErrors.achievement
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    required
                  />
                  {validationErrors.achievement && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {validationErrors.achievement}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    How did you achieve it?
                  </label>
                  <input
                    type="text"
                    value={achievement.achievementMethod}
                    onChange={(e) => {
                      setAchievement({ ...achievement, achievementMethod: e.target.value })
                      // Clear error when user starts typing
                      if (validationErrors.achievementMethod) {
                        setValidationErrors({ ...validationErrors, achievementMethod: '' })
                      }
                    }}
                    placeholder="e.g., implementing a new onboarding flow"
                    className={`w-full rounded-xl border-2 px-4 py-3 text-gray-900 focus:ring-2 transition-all ${
                      validationErrors.achievementMethod
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    required
                  />
                  {validationErrors.achievementMethod && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {validationErrors.achievementMethod}
                    </p>
                  )}
                </div>

                {/* AI Profile Toggle - only show if user already has an AI-generated profile */}
                {hasExistingAIProfile && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">AI-Generate Profile</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {enableAIGeneration
                            ? 'Your profile summary will be regenerated using AI based on your updated information.'
                            : 'Your existing AI-generated profile will be kept unchanged.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEnableAIGeneration(!enableAIGeneration)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          enableAIGeneration ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={enableAIGeneration}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            enableAIGeneration ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={isGeneratingAI}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isGeneratingAI}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGeneratingAI ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {enableAIGeneration ? 'Generating...' : 'Saving...'}
                      </>
                    ) : (
                      'Complete Profile →'
                    )}
                  </button>
                </div>
              </form>
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
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-gray-900">Loading...</h1>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OnboardingContent />
    </Suspense>
  )
}
