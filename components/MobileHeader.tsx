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
  const [brandingSettings, setBrandingSettings] = useState({
    mobileLogo: '',
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

    // Fetch branding settings
    fetch('/api/admin/branding')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setBrandingSettings({
            mobileLogo: data.settings.mobileLogo || '',
          })
        }
      })
      .catch(err => console.error('Failed to fetch branding settings:', err))
  }, [userName])

  return (
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

        {/* Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md active:scale-95 transition-transform duration-150"
          >
            {initials}
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <>
              <div
                className="fixed inset-0"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    router.push('/profile')
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                >
                  {userName || 'My Account'}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    router.push('/profile')
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                >
                  View Profile
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                  Settings
                </button>
                <hr className="my-2" />
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600">
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
