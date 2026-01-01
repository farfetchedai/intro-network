'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginModal from './LoginModal'

interface SidebarProps {
  currentStep: number
  totalSteps: number
  userName?: string
  stepTitles?: string[]
}

export default function Sidebar({ currentStep, totalSteps, userName, stepTitles }: SidebarProps) {
  const router = useRouter()
  const [initials, setInitials] = useState('U')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [brandingSettings, setBrandingSettings] = useState({
    productName: 'Intro Network',
    desktopSidebarLogo: '',
    flowAStep1Name: 'What do you do?',
    flowAStep2Name: 'Who do you know?',
    flowAStep3Name: 'Request Intros',
    flowAStep4Name: 'Track responses',
  })

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.userId) {
          fetchUser(data.userId)
        }
      })
      .catch(err => console.error('Failed to fetch current user:', err))

    if (userName) {
      const parts = userName.split(' ')
      setInitials(
        parts.length > 1
          ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
          : parts[0][0].toUpperCase()
      )
    }

    // Fetch branding settings
    fetch('/api/branding')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setBrandingSettings({
            productName: data.settings.productName || 'Intro Network',
            desktopSidebarLogo: data.settings.desktopSidebarLogo || '',
            flowAStep1Name: data.settings.flowAStep1Name || 'Your Profile',
            flowAStep2Name: data.settings.flowAStep2Name || 'Your Network',
            flowAStep3Name: data.settings.flowAStep3Name || 'Referrals',
            flowAStep4Name: data.settings.flowAStep4Name || 'Complete',
          })
        }
      })
      .catch(err => console.error('Failed to fetch branding settings:', err))
  }, [userName])

  const fetchUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/user?userId=${userId}`)
      const data = await response.json()
      if (data.user) {
        setUser(data.user)
        const parts = `${data.user.firstName} ${data.user.lastName}`.split(' ')
        setInitials(
          parts.length > 1
            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            : parts[0][0].toUpperCase()
        )
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      // Clear all localStorage to prevent data leakage between users
      localStorage.removeItem('userId')
      localStorage.removeItem('userName')
      localStorage.removeItem('formData') // Clear form data
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      // Still clear localStorage and redirect even if logout fails
      localStorage.removeItem('userId')
      localStorage.removeItem('userName')
      localStorage.removeItem('formData')
      setUser(null)
      router.push('/')
    }
  }

  const stepNames = stepTitles || [
    brandingSettings.flowAStep1Name,
    brandingSettings.flowAStep2Name,
    brandingSettings.flowAStep3Name,
    brandingSettings.flowAStep4Name,
  ]

  return (
    <>
    <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 shadow-lg z-50">
      {/* Logo and Tagline */}
      <div className="flex flex-col items-start p-8 space-y-2">
        <div className="flex items-center space-x-3">
          {brandingSettings.desktopSidebarLogo ? (
            <img
              src={brandingSettings.desktopSidebarLogo}
              alt="Logo"
              className="logo-desktop h-10 w-auto object-contain"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{brandingSettings.productName}</h1>
          )}
        </div>
        <p className="tagline-desktop text-sm text-gray-600"></p>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 px-8 py-6 relative">
        {/* Progress Line - positioned behind the steps */}
        <div
          className="absolute left-[3.25rem] top-6 w-0.5 bg-gray-200 z-0"
          style={{
            height: `${(totalSteps - 1) * 3.5}rem`, // 3.5rem = 56px (40px step + 16px gap)
          }}
        >
          <div
            className="bg-gradient-to-b from-blue-500 to-purple-600 transition-all duration-700 ease-out w-full"
            style={{
              height: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-4 relative z-10">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1
            const isActive = stepNumber === currentStep
            const isCompleted = stepNumber < currentStep

            return (
              <div key={stepNumber} className="progress-bar-step flex items-center space-x-3">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-500 ease-out
                    ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110 shadow-lg'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={`
                      progress-bar-titles transition-colors duration-300
                      ${
                        isActive
                          ? 'text-gray-900'
                          : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }
                    `}
                  >
                    {stepNames[index]}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Account Link or Login/Create Account */}
      <div className="p-6 border-t border-gray-200 space-y-3">
        {user || userName ? (
          <>
            <button
              onClick={() => router.push(user?.username ? `/${user.username}` : '/dashboard')}
              className="flex items-center space-x-3 w-full hover:bg-gray-50 rounded-lg p-3 transition-colors duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : userName}
                </div>
                <div className="text-xs text-gray-500">View Business Card</div>
              </div>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center justify-center space-x-2 w-full bg-red-600 hover:bg-red-700 text-white rounded-lg p-3 transition-colors duration-200 font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="w-full text-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/referee')}
              className="w-full text-center py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Account
            </button>
          </>
        )}
      </div>
    </aside>

    <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  )
}
