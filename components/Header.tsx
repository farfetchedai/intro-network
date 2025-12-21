'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import LoginModal from './LoginModal'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
  fromUser?: {
    id: string
    firstName: string
    lastName: string
    profilePicture: string | null
  }
}

export default function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [branding, setBranding] = useState<any>(null)
  const [navigation, setNavigation] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Check if user is logged in from session cookie
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          fetchUser(data.user.id)
          fetchNotifications()
        }
      })
      .catch(err => console.error('Failed to fetch current user:', err))

    fetchBranding()
    fetchNavigation()
  }, [])

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [user])

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

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=10')
      const data = await response.json()
      if (data.success) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark this notification as read
    if (!notification.isRead) {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationIds: [notification.id] }),
        })
        setNotifications(notifications.map(n =>
          n.id === notification.id ? { ...n, isRead: true } : n
        ))
        setUnreadCount(Math.max(0, unreadCount - 1))
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }

    // Navigate to link if present
    if (notification.link) {
      setNotificationsOpen(false)
      router.push(notification.link)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
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
    { label: 'My Business Card', href: `/${user.username || user.id}` },
    { label: 'Edit Business Card', href: '/onboarding' },
    { label: 'Request Introductions', href: '/getintros' },
    { label: 'Introductions', href: '/introductions' },
    { label: 'Connections', href: '/connections' },
    { label: 'Profile', href: '/profile' },
    { label: 'Dashboard', href: '/dashboard' },
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

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen)
                      setUserMenuOpen(false)
                    }}
                    className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                !notification.isRead ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                                  {notification.fromUser?.profilePicture ? (
                                    <img
                                      src={notification.fromUser.profilePicture}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : notification.fromUser ? (
                                    `${notification.fromUser.firstName[0]}${notification.fromUser.lastName[0]}`
                                  ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''} text-gray-900`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {getTimeAgo(notification.createdAt)}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                          <Link
                            href="/connections"
                            onClick={() => setNotificationsOpen(false)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View all activity
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen)
                      setNotificationsOpen(false)
                    }}
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
