'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import LoginModal from './LoginModal'

export default function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [branding, setBranding] = useState<any>(null)
  const [navigation, setNavigation] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in from session cookie
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          fetchUser(data.user.id)
        }
      })
      .catch(err => console.error('Failed to fetch current user:', err))

    fetchBranding()
    fetchNavigation()
  }, [])

  const fetchUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/user?userId=${userId}`)
      const data = await response.json()
      if (data.user) {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  const fetchBranding = async () => {
    try {
      const response = await fetch('/api/admin/branding')
      const data = await response.json()
      if (data.settings) {
        setBranding(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error)
    }
  }

  const fetchNavigation = async () => {
    try {
      const response = await fetch('/api/admin/navigation')
      const data = await response.json()
      if (data.navigation) {
        setNavigation(data.navigation)
      }
    } catch (error) {
      console.error('Failed to fetch navigation:', error)
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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, scrollToId?: string) => {
    if (scrollToId && window.location.pathname === '/') {
      e.preventDefault()
      const element = document.querySelector(scrollToId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const menuItems = navigation?.headerLinks || [
    { label: 'About', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Features', href: '/features' },
    { label: 'Contact', href: '/contact' },
  ]

  const userMenuItems = user ? [
    { label: 'My Business Card', href: user.username ? `/${user.username}` : `/profile/${user.id}` },
    { label: 'My Profile', href: '/profile' },
    { label: 'Edit Business Card', href: '/onboarding' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Request Introductions', href: '/getintros' },
    { label: 'Introductions', href: '/introductions' },
    { label: 'Contacts', href: '/contacts' },
    { label: 'Settings', href: '/settings' },
  ] : []

  return (
    <>
      <header className="sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              {branding?.desktopHeaderLogo ? (
                <img
                  src={branding.desktopHeaderLogo}
                  alt="Logo"
                  className="h-8 w-auto"
                />
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  {branding?.productName || 'Intro Network'}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/getintros"
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        `${user.firstName?.[0]}${user.lastName?.[0]}`
                      )}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Login
                </button>
                <Link
                  href="/onboarding"
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <div className="pt-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        `${user.firstName?.[0]}${user.lastName?.[0]}`
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/getintros"
                    className="block w-full mb-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-center transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left py-2 text-red-600 hover:text-red-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setLoginModalOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className="block py-2 text-gray-700 hover:text-blue-600 font-medium w-full text-left"
                  >
                    Login
                  </button>
                  <Link
                    href="/onboarding"
                    className="block w-full mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-center transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </header>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  )
}
