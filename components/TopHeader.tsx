'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface TopHeaderProps {
  userName?: string
}

export default function TopHeader({ userName: userNameProp }: TopHeaderProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState(userNameProp || '')
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setIsAuthenticated(true)
            setUserName(`${data.user.firstName} ${data.user.lastName}`)
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      }
    }
    checkAuth()
  }, [])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <button
            onClick={() => router.push('/')}
            className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
          >
            IntroNetwork
          </button>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {isAuthenticated && userName ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        router.push('/dashboard')
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        router.push('/introductions/request')
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Request Introductions
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleSignOut()
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/login')}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/referee')}
                className="text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
