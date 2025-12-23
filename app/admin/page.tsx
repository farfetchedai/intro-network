'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    referees: 0,
    firstDegree: 0,
    referrals: 0,
    totalContacts: 0,
    totalReferrals: 0,
  })
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    checkAdminAndFetchStats()
  }, [])

  const checkAdminAndFetchStats = async () => {
    try {
      // Check if user is admin
      const authResponse = await fetch('/api/auth/check-admin')
      const authData = await authResponse.json()

      if (!authData.isAdmin) {
        router.push('/dashboard')
        return
      }

      setAuthorized(true)

      // Fetch stats
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load admin page:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'bg-blue-500' },
    { title: 'Referees', value: stats.referees, icon: '🎯', color: 'bg-purple-500' },
    { title: '1st Degree Contacts', value: stats.firstDegree, icon: '🤝', color: 'bg-green-500' },
    { title: 'Referrals', value: stats.referrals, icon: '📬', color: 'bg-orange-500' },
    { title: 'Total Contacts', value: stats.totalContacts, icon: '📇', color: 'bg-pink-500' },
    { title: 'Total Referral Requests', value: stats.totalReferrals, icon: '🔄', color: 'bg-teal-500' },
  ]

  if (loading || !authorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/users"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl mr-3">👥</span>
            <div>
              <p className="font-semibold text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-600">View and edit all users</p>
            </div>
          </a>
          <a
            href="/admin/branding"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <span className="text-2xl mr-3">🎨</span>
            <div>
              <p className="font-semibold text-gray-900">Customize Branding</p>
              <p className="text-sm text-gray-600">Update logos and styles</p>
            </div>
          </a>
          <a
            href="/admin/settings"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <span className="text-2xl mr-3">⚙️</span>
            <div>
              <p className="font-semibold text-gray-900">API Settings</p>
              <p className="text-sm text-gray-600">Configure Resend and Twilio</p>
            </div>
          </a>
          <a
            href="/admin/templates"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors"
          >
            <span className="text-2xl mr-3">📧</span>
            <div>
              <p className="font-semibold text-gray-900">Message Templates</p>
              <p className="text-sm text-gray-600">Customize Email & SMS templates</p>
            </div>
          </a>
          <a
            href="/admin/cms"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <span className="text-2xl mr-3">📝</span>
            <div>
              <p className="font-semibold text-gray-900">Pages & Content</p>
              <p className="text-sm text-gray-600">Manage website pages</p>
            </div>
          </a>
          <a
            href="/admin/navigation"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-colors"
          >
            <span className="text-2xl mr-3">🔗</span>
            <div>
              <p className="font-semibold text-gray-900">Navigation</p>
              <p className="text-sm text-gray-600">Manage header & footer links</p>
            </div>
          </a>
          <a
            href="/referee"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <span className="text-2xl mr-3">🌐</span>
            <div>
              <p className="font-semibold text-gray-900">View Site</p>
              <p className="text-sm text-gray-600">Go to main application</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
