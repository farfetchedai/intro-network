'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface FooterProps {
  backgroundColor?: string
  textColor?: string
}

export default function Footer({ backgroundColor, textColor }: FooterProps = {}) {
  const [branding, setBranding] = useState<any>(null)
  const [navigation, setNavigation] = useState<any>(null)

  useEffect(() => {
    fetchBranding()
    fetchNavigation()
  }, [])

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

  // Use headerLinks for footer navigation
  const footerLinks = navigation?.headerLinks || [
    { label: 'About', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Features', href: '/features' },
    { label: 'Contact', href: '/contact' },
  ]

  const socialLinks = [
    {
      name: 'Twitter',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
  ]

  // Determine effective colors
  const effectiveBgColor = backgroundColor || undefined
  const effectiveTextColor = textColor || undefined

  return (
    <footer
      className={backgroundColor ? '' : 'bg-gray-900'}
      style={{ backgroundColor: effectiveBgColor }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Footer Logo */}
          <div className="flex-shrink-0">
            {branding?.footerLogo ? (
              <img
                src={branding.footerLogo}
                alt="Logo"
                className={`h-8 w-auto ${!backgroundColor ? 'brightness-0 invert' : ''}`}
              />
            ) : (
              <span
                className={`font-bold text-lg ${!textColor ? 'text-white' : ''}`}
                style={{ color: effectiveTextColor }}
              >
                {branding?.productName || 'Intro Network'}
              </span>
            )}
          </div>

          {/* Center: Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLinks.filter((link: any) => link && link.href).map((link: any, index: number) => (
              <Link
                key={`${link.href}-${index}`}
                href={link.href}
                className={`transition-colors text-sm ${!textColor ? 'text-gray-400 hover:text-white' : 'hover:opacity-80'}`}
                style={{ color: effectiveTextColor }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className={`transition-colors ${!textColor ? 'text-gray-400 hover:text-white' : 'hover:opacity-80'}`}
                style={{ color: effectiveTextColor }}
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
