'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import BottomProgressBar from '@/components/BottomProgressBar'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [devLink, setDevLink] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Step 1: Contact Details
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
  })

  // Step 2: Profile Picture
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('')

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
          let phoneNumber = ''
          if (data.user.phone) {
            // Try to extract country code from phone number
            const phone = data.user.phone
            if (phone.startsWith('+1')) {
              countryCode = '+1'
              phoneNumber = phone.substring(2)
            } else if (phone.startsWith('+44')) {
              countryCode = '+44'
              phoneNumber = phone.substring(3)
            } else if (phone.startsWith('+61')) {
              countryCode = '+61'
              phoneNumber = phone.substring(3)
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
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

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
          setStep(2)
        }
      } else {
        alert(data.error || 'Failed to create account')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Save profile picture if one was uploaded
    if (profilePicturePreview && userId) {
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
            profilePicture: profilePicturePreview,
            userId,
          }),
        })

        const data = await response.json()

        if (!data.success) {
          alert(data.error || 'Failed to save profile picture')
          return
        }
      } catch (error) {
        console.error('Error saving profile picture:', error)
        alert('Failed to save profile picture')
        return
      }
    }

    setStep(3)
  }

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault()

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
        alert(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const handleStep4Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    const skills = [skill1, skill2].filter(s => s.trim() !== '')
    const skillsList = skills.join(' and ')
    const statementSummary = `I'm really good at ${skillsList}. I've worked at ${achievement.company} where I ${achievement.achievement} by ${achievement.achievementMethod}\n\nI'd love to meet ${introRequest}.`

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
          profilePicture: profilePicturePreview || null,
          userId,
          skills,
          companyName: achievement.company,
          achievement: achievement.achievement,
          achievementMethod: achievement.achievementMethod,
          statementSummary,
          introRequest,
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/profile/${userId}`)
      } else {
        alert(data.error || 'Failed to complete profile')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
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
      className={`min-h-screen bg-gradient-to-br ${getStepBackgroundClass()}`}
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex gap-3">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      className="rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    >
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+61">+61</option>
                    </select>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      required
                    />
                  </div>
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

              <form onSubmit={handleStep4Submit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={achievement.company}
                    onChange={(e) => setAchievement({ ...achievement, company: e.target.value })}
                    placeholder="e.g., Google"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Achievement
                  </label>
                  <input
                    type="text"
                    value={achievement.achievement}
                    onChange={(e) => setAchievement({ ...achievement, achievement: e.target.value })}
                    placeholder="e.g., increased user engagement by 40%"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    How did you achieve it?
                  </label>
                  <input
                    type="text"
                    value={achievement.achievementMethod}
                    onChange={(e) => setAchievement({ ...achievement, achievementMethod: e.target.value })}
                    placeholder="e.g., implementing a new onboarding flow"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Complete Profile →
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
