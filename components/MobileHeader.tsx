'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface MobileHeaderProps {
  userName?: string
}

export default function MobileHeader({ userName }: MobileHeaderProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [initials, setInitials] = useState('U')
  const [username, setUsername] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [brandingSettings, setBrandingSettings] = useState({
    mobileLogo: '',
    footerLogo: '',
  })

  useEffect(() => {
    if (userName) {
      const parts = userName.split(' ')
      setInitials(
        parts.length > 1
          ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
          : parts[0][0].toUpperCase()
      )
    }

    // Fetch user data to get username and email
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUsername(data.user.username)
          setEmail(data.user.email)
        }
      })
      .catch(err => console.error('Failed to fetch user:', err))

    // Fetch branding settings
    fetch('/api/branding')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setBrandingSettings({
            mobileLogo: data.settings.mobileLogo || '',
            footerLogo: data.settings.footerLogo || '',
          })
        }
      })
      .catch(err => console.error('Failed to fetch branding settings:', err))
  }, [userName])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (err) {
      console.error('Failed to sign out:', err)
    }
  }

  const handleNavigation = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo and Tagline */}
          <div className="flex items-center space-x-2">
            {brandingSettings.mobileLogo ? (
              <img
                src={brandingSettings.mobileLogo}
                alt="Logo"
                className="logo-mobile h-8 w-auto object-contain"
              />
            ) : (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">I</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Intro Network</h1>
                  <p className="text-xs text-gray-600">Expand your network</p>
                </div>
              </>
            )}
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md active:scale-95 transition-transform duration-150"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              initials
            )}
          </button>
        </div>
      </header>

      {/* Full Screen Menu Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-blue-900 flex flex-col"
          style={{ zIndex: 999 }}
        >
          {/* Header with Logo and Close */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-blue-800">
            {/* Footer Logo */}
            <div className="flex items-center">
              {brandingSettings.footerLogo ? (
                <img
                  src={brandingSettings.footerLogo}
                  alt="Logo"
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">I</span>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Menu Links */}
          <nav className="flex-1 flex flex-col justify-center px-6 space-y-6">
            <button
              onClick={() => handleNavigation('/dashboard')}
              className="text-white text-3xl font-semibold text-left hover:text-blue-200 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNavigation('/getintros')}
              className="text-white text-3xl font-semibold text-left hover:text-blue-200 transition-colors"
            >
              Get Intros
            </button>
            <button
              onClick={() => handleNavigation(username ? `/${username}` : '/dashboard')}
              className="text-white text-3xl font-semibold text-left hover:text-blue-200 transition-colors"
            >
              Business Card
            </button>
            <button
              onClick={() => handleNavigation('/connections')}
              className="text-white text-3xl font-semibold text-left hover:text-blue-200 transition-colors"
            >
              Connections
            </button>
          </nav>

          {/* User Info Fixed to Bottom */}
          <div className="px-6 py-6 border-t border-blue-800 bg-blue-950">
            <div className="flex items-center space-x-4 mb-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {initials}
              </div>
              {/* Name and Email */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-lg truncate">
                  {userName || 'User'}
                </p>
                {email && (
                  <p className="text-blue-300 text-sm truncate">
                    {email}
                  </p>
                )}
              </div>
            </div>
            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
