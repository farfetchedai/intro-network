'use client'

import { useState, useEffect } from 'react'

interface BusinessCardProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    profilePicture: string | null
    statementSummary: string | null
    linkedinUrl: string | null
    twitterUrl: string | null
    facebookUrl: string | null
    instagramUrl: string | null
    websiteUrl: string | null
    username?: string | null
  }
  formBackground?: string
}

// Helper function to determine background style
function getBackgroundStyle(background: string): { className?: string; style?: React.CSSProperties } {
  if (background.startsWith('from-') || background.includes('via-') || background.includes('to-')) {
    // Tailwind gradient classes
    return { className: `bg-gradient-to-br ${background}` }
  } else if (background.startsWith('#') || background.startsWith('rgb') || background.startsWith('hsl')) {
    // CSS color value
    return { style: { backgroundColor: background } }
  } else if (background === 'white' || background === 'transparent') {
    // Common color keywords
    return { className: `bg-${background}` }
  } else {
    // CSS class name
    return { className: background }
  }
}

export default function BusinessCard({ user, formBackground = 'white' }: BusinessCardProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    // Check if user is logged inw-32
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setIsLoggedIn(true)
        }
      })
      .catch(() => {
        setIsLoggedIn(false)
      })
  }, [])

  const handleIconClick = (e: React.MouseEvent<HTMLAnchorElement>, url?: string | null) => {
    if (!isLoggedIn) {
      e.preventDefault()
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 5000)
    } else if (!url) {
      e.preventDefault()
    }
  }

  const hasContactInfo = user.email || user.phone || user.linkedinUrl || user.twitterUrl || user.facebookUrl || user.instagramUrl || user.websiteUrl

  const formStyle = getBackgroundStyle(formBackground)

  return (
    <div
      className={`rounded-3xl shadow-2xl p-8 md:p-12 ${formStyle.className || 'bg-white'}`}
      style={formStyle.style}
    >
      {/* Profile Header - Centered */}
      <div className="flex flex-col items-center text-center mb-8">
        {/* Profile Picture */}
        <div className="bus-card-profile-pic w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden mb-4">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
          )}
        </div>

        {/* Name */}
        <h2 className="text-3xl font-bold text-gray-900 mb-1">
          Hi, I'm {user.firstName} {user.lastName}
        </h2>

        {/* Username */}
        {user.username && (
          <h3 className="bus-card-username">@{user.username}</h3>
        )}
      </div>

      {/* Statement Summary */}
      {user.statementSummary && (
        <div className="summary-container mb-6">
          <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-line text-center">
            {user.statementSummary}
          </p>
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
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Email */}
        {user.email && (
          <a
            href={isLoggedIn ? `mailto:${user.email}` : '#'}
            onClick={(e) => handleIconClick(e, user.email)}
            className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors cursor-pointer ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30'}`}
            title={isLoggedIn ? user.email : 'Login to see contact details'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </a>
        )}

        {/* Phone */}
        {user.phone && (
          <a
            href={isLoggedIn ? `tel:${user.phone}` : '#'}
            onClick={(e) => handleIconClick(e, user.phone)}
            className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white transition-colors cursor-pointer ${isLoggedIn ? 'hover:bg-gray-800' : 'opacity-30'}`}
            title={isLoggedIn ? user.phone : 'Login to see contact details'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </a>
        )}

        {/* LinkedIn */}
        {user.linkedinUrl && (
          <a
            href={isLoggedIn ? user.linkedinUrl : '#'}
            onClick={(e) => handleIconClick(e, user.linkedinUrl)}
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

        {/* Twitter */}
        {user.twitterUrl && (
          <a
            href={isLoggedIn ? user.twitterUrl : '#'}
            onClick={(e) => handleIconClick(e, user.twitterUrl)}
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

        {/* Facebook */}
        {user.facebookUrl && (
          <a
            href={isLoggedIn ? user.facebookUrl : '#'}
            onClick={(e) => handleIconClick(e, user.facebookUrl)}
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

        {/* Instagram */}
        {user.instagramUrl && (
          <a
            href={isLoggedIn ? user.instagramUrl : '#'}
            onClick={(e) => handleIconClick(e, user.instagramUrl)}
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

        {/* Website */}
        {user.websiteUrl && (
          <a
            href={isLoggedIn ? user.websiteUrl : '#'}
            onClick={(e) => handleIconClick(e, user.websiteUrl)}
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

      {/* Introduce Button */}
      <div className="pt-8">
        <a
          href={`/firstdegree/${user.username || user.id}`}
          className="block w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-center"
        >
          Introduce {user.firstName} to someone
        </a>
      </div>
    </div>
  )
}
