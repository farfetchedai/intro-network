'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import MobileProgressBar from '@/components/MobileProgressBar'

interface Referee {
  id: string
  firstName: string
  lastName: string
  username?: string
  email?: string
  phone?: string
  profilePicture?: string
  skills?: string
  companyName?: string
  achievement?: string
  achievementMethod?: string
  statementSummary?: string
  statementSummary3rdPerson?: string
  introRequest?: string
  linkedinUrl?: string
  twitterUrl?: string
  websiteUrl?: string
}

interface FirstDegree {
  id: string
  firstName: string
  lastName: string
  email?: string
}

interface ReferralData {
  id: string
  referee: Referee
  firstDegree: FirstDegree
  status: string
}

function SecondDegreeContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const refereeUsername = params.username as string
  const referralId = searchParams.get('r')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [direction, setDirection] = useState<'up' | 'down'>('down')
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [error, setError] = useState('')

  // Second degree contact info (for unauthenticated users)
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')

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
    flowCStep1Name: 'Review intro',
    flowCStep2Name: 'Accept or decline',
    flowCStep3Name: 'Connect',
    flowCStep4Name: 'Complete',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        const authResponse = await fetch('/api/auth/me')
        const authData = await authResponse.json()
        if (authData.success && authData.user) {
          setIsAuthenticated(true)
          setCurrentUserId(authData.user.id)
          setContactInfo({
            firstName: authData.user.firstName || '',
            lastName: authData.user.lastName || '',
            email: authData.user.email || '',
            phone: authData.user.phone || '',
          })
        }

        // Fetch branding settings
        const brandingResponse = await fetch('/api/admin/branding')
        if (brandingResponse.ok) {
          const brandingData = await brandingResponse.json()
          if (brandingData.success && brandingData.settings) {
            setBrandingSettings({
              flowCStep1Background: brandingData.settings.flowCStep1Background || 'from-blue-400 via-purple-400 to-pink-400',
              flowCStep2Background: brandingData.settings.flowCStep2Background || 'from-emerald-400 via-teal-400 to-cyan-400',
              flowCStep3Background: brandingData.settings.flowCStep3Background || 'from-orange-400 via-rose-400 to-pink-400',
              flowCStep4Background: brandingData.settings.flowCStep4Background || 'from-violet-400 via-purple-400 to-fuchsia-400',
              flowCStep1FormBg: brandingData.settings.flowCStep1FormBg || 'white',
              flowCStep2FormBg: brandingData.settings.flowCStep2FormBg || 'white',
              flowCStep3FormBg: brandingData.settings.flowCStep3FormBg || 'white',
              flowCStep4FormBg: brandingData.settings.flowCStep4FormBg || 'white',
              flowCStep1Name: brandingData.settings.flowCStep1Name || 'Review intro',
              flowCStep2Name: brandingData.settings.flowCStep2Name || 'Accept or decline',
              flowCStep3Name: brandingData.settings.flowCStep3Name || 'Connect',
              flowCStep4Name: brandingData.settings.flowCStep4Name || 'Complete',
            })
          }
        }

        // Fetch referral data
        let url = `/api/seconddegree/referral?refereeUsername=${refereeUsername}`
        if (referralId) {
          url += `&referralId=${referralId}`
        }
        if (authData.success && authData.user) {
          url += `&userId=${authData.user.id}`
        }

        const referralResponse = await fetch(url)
        if (referralResponse.ok) {
          const data = await referralResponse.json()
          if (data.success && data.referral) {
            setReferralData(data.referral)
            // If already responded, skip to appropriate step
            if (data.referral.status === 'APPROVED') {
              setStep(3)
            } else if (data.referral.status === 'DENIED') {
              setStep(4)
            }
          } else {
            setError(data.error || 'Referral not found')
          }
        } else {
          setError('Failed to load referral data')
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('An error occurred while loading the page')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [refereeUsername, referralId])

  const handleAccept = async () => {
    if (!referralData) return

    try {
      const response = await fetch('/api/seconddegree/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralId: referralData.id,
          response: 'APPROVED',
          contactInfo: !isAuthenticated ? contactInfo : undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setDirection('down')
        setStep(3)
      } else {
        setError(data.error || 'Failed to accept introduction')
      }
    } catch (err) {
      console.error('Error accepting:', err)
      setError('An error occurred')
    }
  }

  const handleDecline = async () => {
    if (!referralData) return

    try {
      const response = await fetch('/api/seconddegree/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralId: referralData.id,
          response: 'DENIED',
        }),
      })

      const data = await response.json()
      if (data.success) {
        setDirection('down')
        setStep(4)
      } else {
        setError(data.error || 'Failed to decline introduction')
      }
    } catch (err) {
      console.error('Error declining:', err)
      setError('An error occurred')
    }
  }

  const getStepBackgroundClass = () => {
    let bg = brandingSettings.flowCStep1Background
    if (step === 2) bg = brandingSettings.flowCStep2Background
    if (step === 3) bg = brandingSettings.flowCStep3Background
    if (step === 4) bg = brandingSettings.flowCStep4Background
    if (bg.startsWith('#') || bg.startsWith('rgb')) return ''
    return bg
  }

  const getStepBackgroundStyle = () => {
    let bg = brandingSettings.flowCStep1Background
    if (step === 2) bg = brandingSettings.flowCStep2Background
    if (step === 3) bg = brandingSettings.flowCStep3Background
    if (step === 4) bg = brandingSettings.flowCStep4Background
    if (bg.startsWith('#') || bg.startsWith('rgb')) return { backgroundColor: bg }
    return {}
  }

  const getFormBackgroundStyle = () => {
    let bg = brandingSettings.flowCStep1FormBg
    if (step === 2) bg = brandingSettings.flowCStep2FormBg
    if (step === 3) bg = brandingSettings.flowCStep3FormBg
    if (step === 4) bg = brandingSettings.flowCStep4FormBg
    if (bg.includes('from-') || bg.includes('to-') || bg.includes('via-')) {
      return {}
    }
    return { backgroundColor: bg }
  }

  const handleBack = (targetStep: number) => {
    setDirection('up')
    setStep(targetStep)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !referralData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Introduction Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      </>
    )
  }

  const referee = referralData?.referee
  const firstDegree = referralData?.firstDegree

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br ${getStepBackgroundClass()} transition-all duration-700 ease-in-out`} style={getStepBackgroundStyle()}>
      <Header />
      <MobileProgressBar currentStep={step} totalSteps={4} />

      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4 lg:p-8">
          <div className={`w-full max-w-3xl transition-all duration-500 ${
            direction === 'down' ? 'animate-slideDown' : 'animate-slideUp'
          }`}>
            <div className="backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12" style={getFormBackgroundStyle()}>

              {/* Step 1: Review Intro */}
              {step === 1 && referee && firstDegree && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {firstDegree.firstName} wants to introduce you to {referee.firstName}
                  </h2>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
                    <div className="flex items-start gap-4">
                      {referee.profilePicture ? (
                        <img
                          src={referee.profilePicture}
                          alt={`${referee.firstName} ${referee.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                          {referee.firstName?.[0]}{referee.lastName?.[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {referee.firstName} {referee.lastName}
                        </h3>
                        {referee.companyName && (
                          <p className="text-gray-600">{referee.companyName}</p>
                        )}
                        {(referee.statementSummary3rdPerson || referee.statementSummary) && (
                          <p className="mt-2 text-gray-700">
                            {referee.statementSummary3rdPerson || referee.statementSummary}
                          </p>
                        )}
                        {referee.introRequest && (
                          <p className="mt-2 text-gray-700">
                            <strong>Looking for:</strong> {referee.introRequest}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6">
                    {firstDegree.firstName} {firstDegree.lastName} thinks you two should connect.
                    Would you like to be introduced?
                  </p>

                  <button
                    onClick={() => {
                      setDirection('down')
                      setStep(2)
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Accept or Decline */}
              {step === 2 && referee && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Would you like to connect with {referee.firstName}?
                  </h2>

                  {!isAuthenticated && (
                    <div className="mb-6 space-y-4">
                      <p className="text-gray-600 text-sm">
                        Please confirm your details so {referee.firstName} can reach you:
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={contactInfo.firstName}
                            onChange={(e) => setContactInfo({ ...contactInfo, firstName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your first name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={contactInfo.lastName}
                            onChange={(e) => setContactInfo({ ...contactInfo, lastName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your last name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={contactInfo.email}
                          onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+1 555 123 4567"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <button
                      onClick={handleAccept}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                    >
                      Yes, I'd like to connect
                    </button>
                    <button
                      onClick={handleDecline}
                      className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      No thanks, not right now
                    </button>
                  </div>

                  <button
                    onClick={() => handleBack(1)}
                    className="mt-4 text-gray-500 hover:text-gray-700 font-medium"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {/* Step 3: Connect */}
              {step === 3 && referee && (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Great! You're now connected
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {referee.firstName} has been notified that you'd like to connect.
                  </p>

                  <div className="bg-gray-50 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      {referee.profilePicture ? (
                        <img
                          src={referee.profilePicture}
                          alt={`${referee.firstName} ${referee.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                          {referee.firstName?.[0]}{referee.lastName?.[0]}
                        </div>
                      )}
                      <div className="text-left">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {referee.firstName} {referee.lastName}
                        </h3>
                        {referee.companyName && (
                          <p className="text-gray-600">{referee.companyName}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                      {referee.username && (
                        <a
                          href={`/${referee.username}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                          View Business Card
                        </a>
                      )}
                      {referee.email && (
                        <a
                          href={`mailto:${referee.email}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Email
                        </a>
                      )}
                      {referee.linkedinUrl && (
                        <a
                          href={referee.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white font-medium rounded-lg hover:bg-[#004182] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDirection('down')
                      setStep(4)
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Step 4: Complete */}
              {step === 4 && (
                <div className="text-center py-8">
                  <div className="mb-6">
                    {referralData?.status === 'APPROVED' ? (
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {referralData?.status === 'APPROVED' ? 'All Done!' : 'Thanks for letting us know'}
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {referralData?.status === 'APPROVED'
                      ? `We hope you have a great connection with ${referee?.firstName}!`
                      : 'No worries - maybe another time.'}
                  </p>

                  <a
                    href="/"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    Go Home
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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

export default function SecondDegreePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SecondDegreeContent />
    </Suspense>
  )
}
