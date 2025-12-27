'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  company: string | null
  degreeType: string
  requestSentAt: string | null
  createdAt: string
  linkedUser?: {
    id: string
    username: string | null
    firstName: string
    lastName: string
    profilePicture: string | null
    hasCompletedOnboarding: boolean
  } | null
}

interface Message {
  id: string
  messageType: string
  subject: string
  body: string
  sentViaEmail: boolean
  sentViaSms: boolean
  emailSentAt: string | null
  smsSentAt: string | null
  createdAt: string
  receiver: {
    firstName: string
    lastName: string
    email: string | null
  }
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface ConnectionUser {
  id: string
  firstName: string
  lastName: string
  username: string | null
  profilePicture: string | null
  companyName: string | null
}

interface ConnectionRequest {
  id: string
  note: string | null
  createdAt: string
  fromUser?: ConnectionUser
  toUser?: ConnectionUser
}

interface Introduction {
  id: string
  personAEmail: string
  personAName: string
  personACompany: string | null
  personAContext: string | null
  personAUserId: string | null
  personAAccepted: boolean
  personBEmail: string
  personBName: string
  personBCompany: string | null
  personBContext: string | null
  personBUserId: string | null
  personBAccepted: boolean
  message: string
  status: string
  createdAt: string
  acceptedAt: string | null
  introducer?: {
    id: string
    firstName: string
    lastName: string
    username: string | null
    profilePicture: string | null
  }
  personAUser?: ConnectionUser | null
  personBUser?: ConnectionUser | null
}

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

export default function DashboardPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Connection requests state
  const [myConnections, setMyConnections] = useState<ConnectionUser[]>([])
  const [pendingReceived, setPendingReceived] = useState<ConnectionRequest[]>([])
  const [pendingSent, setPendingSent] = useState<ConnectionRequest[]>([])
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  // Introductions state
  const [introductionsMade, setIntroductionsMade] = useState<Introduction[]>([])
  const [introductionsReceived, setIntroductionsReceived] = useState<Introduction[]>([])
  const [respondingToIntro, setRespondingToIntro] = useState<string | null>(null)

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Get current user from session cookie
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.user) {
          router.push('/login')
          return
        }
        fetchData(data.user.id)
      })
      .catch(err => {
        console.error('Failed to fetch current user:', err)
        router.push('/login')
      })
  }, [router])

  const fetchData = async (userId: string) => {
    try {
      const [userRes, contactsRes, messagesRes, connectionsRes, introductionsRes, notificationsRes] = await Promise.all([
        fetch(`/api/user?userId=${userId}`),
        fetch(`/api/contacts?userId=${userId}`),
        fetch(`/api/messages?userId=${userId}`),
        fetch('/api/connections'),
        fetch('/api/introductions'),
        fetch('/api/notifications?limit=5'),
      ])

      const userData = await userRes.json()
      const contactsData = await contactsRes.json()
      const messagesData = await messagesRes.json()
      const connectionsData = await connectionsRes.json()
      const introductionsData = await introductionsRes.json()
      const notificationsData = await notificationsRes.json()

      if (userData.user) {
        setUser(userData.user)
      }

      if (contactsData.contacts) {
        setContacts(contactsData.contacts)
      }

      if (messagesData.messages) {
        setMessages(messagesData.messages)
      }

      if (connectionsData.success) {
        setMyConnections(connectionsData.connections || [])
        setPendingReceived(connectionsData.pendingReceived || [])
        setPendingSent(connectionsData.pendingSent || [])
      }

      if (introductionsData.success) {
        setIntroductionsMade(introductionsData.introductionsMade || [])
        setIntroductionsReceived(introductionsData.introductionsReceived || [])
      }

      if (notificationsData.success) {
        setNotifications(notificationsData.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
    setRespondingTo(requestId)
    try {
      const response = await fetch('/api/connections/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      })
      const data = await response.json()
      if (data.success) {
        setActionError('')
        const request = pendingReceived.find(r => r.id === requestId)
        setPendingReceived(prev => prev.filter(r => r.id !== requestId))
        if (action === 'accept' && request?.fromUser) {
          setMyConnections(prev => [request.fromUser!, ...prev])
        }
      } else {
        setActionError(data.error || 'Failed to respond to request. Please try again.')
      }
    } catch (err) {
      console.error('Failed to respond to request:', err)
      setActionError('An unexpected error occurred. Please try again.')
    } finally {
      setRespondingTo(null)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return
    }

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setActionError('')
        setContacts(contacts.filter((c) => c.id !== contactId))
      } else {
        setActionError('Failed to delete contact. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      setActionError('An unexpected error occurred while deleting the contact.')
    }
  }

  const handleRespondToIntro = async (introductionId: string, action: 'accept' | 'decline') => {
    setRespondingToIntro(introductionId)
    try {
      const response = await fetch('/api/introductions/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ introductionId, action }),
      })

      const data = await response.json()

      if (data.success) {
        setActionError('')
        setIntroductionsReceived(prev => prev.map(intro => {
          if (intro.id === introductionId) {
            const isPersonA = intro.personAUserId === user?.id || intro.personAEmail === user?.email
            return {
              ...intro,
              status: data.status,
              personAAccepted: isPersonA ? (action === 'accept') : intro.personAAccepted,
              personBAccepted: !isPersonA ? (action === 'accept') : intro.personBAccepted,
            }
          }
          return intro
        }))
      } else {
        setActionError(data.error || 'Failed to respond to introduction')
      }
    } catch (err) {
      console.error('Failed to respond to introduction:', err)
      setActionError('An unexpected error occurred')
    } finally {
      setRespondingToIntro(null)
    }
  }

  const getIntroStatusBadge = (intro: Introduction) => {
    switch (intro.status) {
      case 'pending':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Pending</span>
      case 'personA_accepted':
      case 'personB_accepted':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Partially Accepted</span>
      case 'both_accepted':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Connected</span>
      case 'declined':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">Declined</span>
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{intro.status}</span>
    }
  }

  const getIntroUserStatus = (intro: Introduction) => {
    const isPersonA = intro.personAUserId === user?.id || intro.personAEmail === user?.email
    const myAccepted = isPersonA ? intro.personAAccepted : intro.personBAccepted

    if (intro.status === 'declined') {
      return { canRespond: false }
    }

    return {
      canRespond: !myAccepted && intro.status !== 'both_accepted',
    }
  }

  const getOtherPerson = (intro: Introduction) => {
    const isPersonA = intro.personAUserId === user?.id || intro.personAEmail === user?.email
    return {
      name: isPersonA ? intro.personBName : intro.personAName,
      company: isPersonA ? intro.personBCompany : intro.personACompany,
      user: isPersonA ? intro.personBUser : intro.personAUser,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600">Here's an overview of your network activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Contacts</p>
                <p className="text-3xl font-bold text-gray-900">{contacts.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Requests Sent</p>
                <p className="text-3xl font-bold text-gray-900">
                  {contacts.filter((c) => c.requestSentAt).length}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">First Degree</p>
                <p className="text-3xl font-bold text-gray-900">
                  {contacts.filter((c) => c.degreeType === 'FIRST_DEGREE').length}
                </p>
              </div>
              <div className="bg-pink-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Requests */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Connection Requests</h2>
            <a
              href="/connections"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </a>
          </div>

          {/* Error Banner */}
          {actionError && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium text-sm">{actionError}</p>
              <button onClick={() => setActionError('')} className="ml-auto text-red-500 hover:text-red-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Requests Received */}
            <div className="border-2 border-amber-200 rounded-lg p-4 bg-amber-50">
              <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                Received
                {pendingReceived.length > 0 && (
                  <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingReceived.length}
                  </span>
                )}
              </h3>
              <div className="space-y-3">
                {pendingReceived.length === 0 ? (
                  <p className="text-sm text-amber-700 italic">No pending requests</p>
                ) : (
                  pendingReceived.slice(0, 3).map((request) => (
                    <div key={request.id} className="bg-white border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <a
                          href={`/${request.fromUser?.username || request.fromUser?.id}`}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-blue-400 transition-all"
                        >
                          {request.fromUser?.profilePicture ? (
                            <img src={request.fromUser.profilePicture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            `${request.fromUser?.firstName.charAt(0)}${request.fromUser?.lastName.charAt(0)}`
                          )}
                        </a>
                        <div className="flex-1 min-w-0">
                          <a
                            href={`/${request.fromUser?.username || request.fromUser?.id}`}
                            className="font-semibold text-gray-900 text-sm truncate block hover:text-blue-600 transition-colors"
                          >
                            {request.fromUser?.firstName} {request.fromUser?.lastName}
                          </a>
                          {request.fromUser?.companyName && (
                            <p className="text-xs text-gray-500 truncate">{request.fromUser.companyName}</p>
                          )}
                        </div>
                      </div>
                      {request.note && (
                        <p className="text-xs text-gray-600 italic mb-2 line-clamp-2">"{request.note}"</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespondToRequest(request.id, 'decline')}
                          disabled={respondingTo === request.id}
                          className="flex-1 px-3 py-1.5 text-xs text-gray-700 bg-gray-100 font-medium rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleRespondToRequest(request.id, 'accept')}
                          disabled={respondingTo === request.id}
                          className="flex-1 px-3 py-1.5 text-xs text-white bg-emerald-500 font-medium rounded hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                          {respondingTo === request.id ? '...' : 'Accept'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Requests Sent */}
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Sent
                {pendingSent.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingSent.length}
                  </span>
                )}
              </h3>
              <div className="space-y-3">
                {pendingSent.length === 0 ? (
                  <p className="text-sm text-blue-700 italic">No pending requests</p>
                ) : (
                  pendingSent.slice(0, 3).map((request) => (
                    <div key={request.id} className="bg-white border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <a
                          href={`/${request.toUser?.username || request.toUser?.id}`}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-blue-400 transition-all"
                        >
                          {request.toUser?.profilePicture ? (
                            <img src={request.toUser.profilePicture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            `${request.toUser?.firstName.charAt(0)}${request.toUser?.lastName.charAt(0)}`
                          )}
                        </a>
                        <div className="flex-1 min-w-0">
                          <a
                            href={`/${request.toUser?.username || request.toUser?.id}`}
                            className="font-semibold text-gray-900 text-sm truncate block hover:text-blue-600 transition-colors"
                          >
                            {request.toUser?.firstName} {request.toUser?.lastName}
                          </a>
                          <span className="text-xs text-amber-600">Pending</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* My Connections */}
            <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50">
              <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Connected
                {myConnections.length > 0 && (
                  <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {myConnections.length}
                  </span>
                )}
              </h3>
              <div className="space-y-3">
                {myConnections.length === 0 ? (
                  <p className="text-sm text-emerald-700 italic">No connections yet</p>
                ) : (
                  myConnections.slice(0, 3).map((user) => (
                    <a
                      key={user.id}
                      href={`/${user.username || user.id}`}
                      className="block bg-white border border-emerald-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.companyName && (
                            <p className="text-xs text-gray-500 truncate">{user.companyName}</p>
                          )}
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Introductions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Introductions</h2>
            <div className="flex items-center gap-3">
              <a
                href="/introductions"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </a>
              <a
                href="/getintros"
                className="px-4 py-2 bg-white border-2 border-purple-500 text-purple-600 text-sm font-semibold rounded-lg hover:bg-purple-50 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Get Introduced
              </a>
              <a
                href="/giveintros"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Give Intro
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Introductions Received */}
            <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
              <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                Received
                {introductionsReceived.filter(i => getIntroUserStatus(i).canRespond).length > 0 && (
                  <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {introductionsReceived.filter(i => getIntroUserStatus(i).canRespond).length}
                  </span>
                )}
              </h3>
              <div className="space-y-3">
                {introductionsReceived.length === 0 ? (
                  <p className="text-sm text-purple-700 italic">No introductions received</p>
                ) : (
                  introductionsReceived.slice(0, 3).map((intro) => {
                    const otherPerson = getOtherPerson(intro)
                    const status = getIntroUserStatus(intro)

                    return (
                      <div key={intro.id} className="bg-white border border-purple-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {intro.introducer && (
                              <a
                                href={`/${intro.introducer.username || intro.introducer.id}`}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-purple-400 transition-all"
                              >
                                {intro.introducer.profilePicture ? (
                                  <img src={intro.introducer.profilePicture} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  `${intro.introducer.firstName[0]}${intro.introducer.lastName[0]}`
                                )}
                              </a>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">
                                via {intro.introducer ? (
                                  <a
                                    href={`/${intro.introducer.username || intro.introducer.id}`}
                                    className="hover:text-purple-600 hover:underline"
                                  >
                                    {intro.introducer.firstName} {intro.introducer.lastName}
                                  </a>
                                ) : 'Unknown'}
                              </p>
                            </div>
                          </div>
                          {getIntroStatusBadge(intro)}
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          {otherPerson.user ? (
                            <a
                              href={`/${otherPerson.user.username || otherPerson.user.id}`}
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-blue-400 transition-all"
                            >
                              {otherPerson.user.profilePicture ? (
                                <img src={otherPerson.user.profilePicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                `${otherPerson.user.firstName[0]}${otherPerson.user.lastName[0]}`
                              )}
                            </a>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {otherPerson.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {otherPerson.user ? (
                              <a
                                href={`/${otherPerson.user.username || otherPerson.user.id}`}
                                className="font-semibold text-gray-900 text-sm truncate block hover:text-blue-600 transition-colors"
                              >
                                {otherPerson.name}
                              </a>
                            ) : (
                              <p className="font-semibold text-gray-900 text-sm truncate">{otherPerson.name}</p>
                            )}
                            {otherPerson.company && (
                              <p className="text-xs text-gray-500 truncate">{otherPerson.company}</p>
                            )}
                          </div>
                        </div>

                        {status.canRespond && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleRespondToIntro(intro.id, 'decline')}
                              disabled={respondingToIntro === intro.id}
                              className="flex-1 px-3 py-1.5 text-xs text-gray-700 bg-gray-100 font-medium rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleRespondToIntro(intro.id, 'accept')}
                              disabled={respondingToIntro === intro.id}
                              className="flex-1 px-3 py-1.5 text-xs text-white bg-emerald-500 font-medium rounded hover:bg-emerald-600 transition-colors disabled:opacity-50"
                            >
                              {respondingToIntro === intro.id ? '...' : 'Accept'}
                            </button>
                          </div>
                        )}

                        {intro.status === 'both_accepted' && (
                          <div className="flex items-center justify-between gap-2 mt-2 p-2 bg-emerald-50 rounded text-xs text-emerald-700">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Connected!
                            </div>
                            {otherPerson.user && (
                              <a
                                href={`/${otherPerson.user.username || otherPerson.user.id}`}
                                className="px-2 py-1 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 transition-colors"
                              >
                                View Card
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Introductions Made */}
            <div className="border-2 border-teal-200 rounded-lg p-4 bg-teal-50">
              <h3 className="text-lg font-bold text-teal-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Made by You
                {introductionsMade.length > 0 && (
                  <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {introductionsMade.length}
                  </span>
                )}
              </h3>
              <div className="space-y-3">
                {introductionsMade.length === 0 ? (
                  <p className="text-sm text-teal-700 italic">No introductions made yet</p>
                ) : (
                  introductionsMade.slice(0, 3).map((intro) => (
                    <div key={intro.id} className="bg-white border border-teal-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">{new Date(intro.createdAt).toLocaleDateString()}</p>
                        {getIntroStatusBadge(intro)}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          {intro.personAUser ? (
                            <a
                              href={`/${intro.personAUser.username || intro.personAUser.id}`}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-blue-400 transition-all"
                            >
                              {intro.personAUser.profilePicture ? (
                                <img src={intro.personAUser.profilePicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                `${intro.personAUser.firstName[0]}${intro.personAUser.lastName[0]}`
                              )}
                            </a>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {intro.personAName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${intro.personAAccepted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        </div>

                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>

                        <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${intro.personBAccepted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {intro.personBUser ? (
                            <a
                              href={`/${intro.personBUser.username || intro.personBUser.id}`}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-purple-400 transition-all"
                            >
                              {intro.personBUser.profilePicture ? (
                                <img src={intro.personBUser.profilePicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                `${intro.personBUser.firstName[0]}${intro.personBUser.lastName[0]}`
                              )}
                            </a>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {intro.personBName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between mt-2 text-xs text-gray-600">
                        {intro.personAUser ? (
                          <a
                            href={`/${intro.personAUser.username || intro.personAUser.id}`}
                            className="truncate max-w-[45%] hover:text-blue-600 hover:underline"
                          >
                            {intro.personAName.split(' ')[0]}
                          </a>
                        ) : (
                          <span className="truncate max-w-[45%]">{intro.personAName.split(' ')[0]}</span>
                        )}
                        {intro.personBUser ? (
                          <a
                            href={`/${intro.personBUser.username || intro.personBUser.id}`}
                            className="truncate max-w-[45%] text-right hover:text-purple-600 hover:underline"
                          >
                            {intro.personBName.split(' ')[0]}
                          </a>
                        ) : (
                          <span className="truncate max-w-[45%] text-right">{intro.personBName.split(' ')[0]}</span>
                        )}
                      </div>

                      {intro.status === 'both_accepted' && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-emerald-50 rounded text-xs text-emerald-700">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Successfully connected!
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contacts and Connections */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Contacts and Connections</h2>
            <a
              href="/connections"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1st Degree */}
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                1st Degree
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {contacts.filter(c => c.degreeType === 'FIRST_DEGREE').length}
                </span>
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {contacts.filter(c => c.degreeType === 'FIRST_DEGREE').length === 0 ? (
                  <p className="text-sm text-blue-700 italic">No 1st degree contacts</p>
                ) : (
                  contacts.filter(c => c.degreeType === 'FIRST_DEGREE').slice(0, 10).map((contact) => {
                    const hasProfile = contact.linkedUser?.username
                    return (
                      <div
                        key={contact.id}
                        className="bg-white border border-blue-200 rounded-lg p-3 hover:shadow-md hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <a href={hasProfile ? `/${contact.linkedUser?.username}` : '#'} className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                              {contact.linkedUser?.profilePicture ? (
                                <img src={contact.linkedUser.profilePicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`
                              )}
                            </div>
                          </a>
                          <div className="flex-1 min-w-0">
                            <a href={hasProfile ? `/${contact.linkedUser?.username}` : '#'}>
                              <p className={`font-semibold text-sm truncate ${hasProfile ? 'text-blue-600 hover:text-blue-800' : 'text-gray-900'}`}>
                                {contact.firstName} {contact.lastName}
                              </p>
                            </a>
                            {contact.company && (
                              <p className="text-xs text-gray-500 truncate">{contact.company}</p>
                            )}
                          </div>
                          {contact.linkedUser?.id && (
                            <a
                              href={`/api/user/vcard/${contact.linkedUser.username || contact.linkedUser.id}`}
                              download
                              className="p-1.5 text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors flex-shrink-0"
                              title="Download VCF"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* 2nd Degree */}
            <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
              <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                2nd Degree
                <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {contacts.filter(c => c.degreeType === 'SECOND_DEGREE').length}
                </span>
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {contacts.filter(c => c.degreeType === 'SECOND_DEGREE').length === 0 ? (
                  <p className="text-sm text-purple-700 italic">No 2nd degree contacts</p>
                ) : (
                  contacts.filter(c => c.degreeType === 'SECOND_DEGREE').slice(0, 10).map((contact) => {
                    const hasProfile = contact.linkedUser?.username
                    return (
                      <div
                        key={contact.id}
                        className="bg-white border border-purple-200 rounded-lg p-3 hover:shadow-md hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <a href={hasProfile ? `/${contact.linkedUser?.username}` : '#'} className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                              {contact.linkedUser?.profilePicture ? (
                                <img src={contact.linkedUser.profilePicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`
                              )}
                            </div>
                          </a>
                          <div className="flex-1 min-w-0">
                            <a href={hasProfile ? `/${contact.linkedUser?.username}` : '#'}>
                              <p className={`font-semibold text-sm truncate ${hasProfile ? 'text-purple-600 hover:text-purple-800' : 'text-gray-900'}`}>
                                {contact.firstName} {contact.lastName}
                              </p>
                            </a>
                            {contact.company && (
                              <p className="text-xs text-gray-500 truncate">{contact.company}</p>
                            )}
                          </div>
                          {contact.linkedUser?.id && (
                            <a
                              href={`/api/user/vcard/${contact.linkedUser.username || contact.linkedUser.id}`}
                              download
                              className="p-1.5 text-purple-600 bg-purple-100 rounded hover:bg-purple-200 transition-colors flex-shrink-0"
                              title="Download VCF"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* 3rd Degree */}
            <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50">
              <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                3rd Degree
                <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {contacts.filter(c => c.degreeType === 'THIRD_DEGREE').length}
                </span>
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {contacts.filter(c => c.degreeType === 'THIRD_DEGREE').length === 0 ? (
                  <p className="text-sm text-emerald-700 italic">No 3rd degree contacts</p>
                ) : (
                  contacts.filter(c => c.degreeType === 'THIRD_DEGREE').slice(0, 10).map((contact) => {
                    const hasProfile = contact.linkedUser?.username
                    return (
                      <div
                        key={contact.id}
                        className="bg-white border border-emerald-200 rounded-lg p-3 hover:shadow-md hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <a href={hasProfile ? `/${contact.linkedUser?.username}` : '#'} className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                              {contact.linkedUser?.profilePicture ? (
                                <img src={contact.linkedUser.profilePicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`
                              )}
                            </div>
                          </a>
                          <div className="flex-1 min-w-0">
                            <a href={hasProfile ? `/${contact.linkedUser?.username}` : '#'}>
                              <p className={`font-semibold text-sm truncate ${hasProfile ? 'text-emerald-600 hover:text-emerald-800' : 'text-gray-900'}`}>
                                {contact.firstName} {contact.lastName}
                              </p>
                            </a>
                            {contact.company && (
                              <p className="text-xs text-gray-500 truncate">{contact.company}</p>
                            )}
                          </div>
                          {contact.linkedUser?.id && (
                            <a
                              href={`/api/user/vcard/${contact.linkedUser.username || contact.linkedUser.id}`}
                              download
                              className="p-1.5 text-emerald-600 bg-emerald-100 rounded hover:bg-emerald-200 transition-colors flex-shrink-0"
                              title="Download VCF"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <a
              href="/connections"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </a>
          </div>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-gray-600">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <a
                  key={notification.id}
                  href={notification.link || '#'}
                  className={`block border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                    notification.isRead ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                      {notification.fromUser?.profilePicture ? (
                        <img src={notification.fromUser.profilePicture} alt="" className="w-full h-full object-cover" />
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
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}
