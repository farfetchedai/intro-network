'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Branding', href: '/admin/branding', icon: '🎨' },
    { name: 'Message Templates', href: '/admin/message-templates', icon: '✉️' },
    { name: 'API Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center px-3 py-3 mb-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                {item.name}
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button
            onClick={() => router.push('/referee')}
            className="w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            ← Back to Site
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 bg-gray-900 text-white rounded-lg lg:hidden"
        >
          ☰
        </button>
      )}

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  )
}
