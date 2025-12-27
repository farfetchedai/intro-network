'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ConnectionsList from '@/components/ConnectionsList'
import LinkedInIcon from '@/components/LinkedInIcon'

interface Connection {
  id: string
  firstName: string
  lastName: string
  headline?: string | null
  profilePictureUrl?: string | null
  profileUrl?: string | null
}

interface LinkedUser {
  id: string
  username: string | null
  firstName: string
  lastName: string
  profilePicture: string | null
  hasCompletedOnboarding: boolean
}

interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  company?: string | null
  degreeType?: string
  createdAt: string
  linkedUser?: LinkedUser | null
}

type TabType = 'requests' | 'contacts' | 'introductions' | 'linkedin'

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
  personAUserId: string | null
  personAAccepted: boolean
  personBEmail: string
  personBName: string
  personBCompany: string | null
  personBUserId: string | null
  personBAccepted: boolean
  message: string
  status: string
  createdAt: string
  introducer?: ConnectionUser
  personAUser?: ConnectionUser | null
  personBUser?: ConnectionUser | null
}

export default function ConnectionsPage() {
  const router = useRouter()
  const [requestError, setRequestError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('requests')
  const [userId, setUserId] = useState('')
  const [linkedInConnected, setLinkedInConnected] = useState(false)
  const [connections, setConnections] = useState<Connection[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [connectionsLoading, setConnectionsLoading] = useState(false)
  const [connectionsSyncing, setConnectionsSyncing] = useState(false)
  const [userName, setUserName] = useState('')

  // Connection requests state
  const [myConnections, setMyConnections] = useState<ConnectionUser[]>([])
  const [pendingReceived, setPendingReceived] = useState<ConnectionRequest[]>([])
  const [pendingSent, setPendingSent] = useState<ConnectionRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)

  // Introductions state
  const [introductionsMade, setIntroductionsMade] = useState<Introduction[]>([])
  const [introductionsReceived, setIntroductionsReceived] = useState<Introduction[]>([])
  const [currentUserEmail, setCurrentUserEmail] = useState('')

  // Search and Add Contact states
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addingContact, setAddingContact] = useState(false)
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
  })

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.user) {
          router.push('/login')
          return
        }
        setUserId(data.user.id)
        setUserName(`${data.user.firstName} ${data.user.lastName}`)
        setCurrentUserEmail(data.user.email || '')
        if (data.user.linkedInAccount) {
          setLinkedInConnected(true)
        }
        setIsLoading(false)
        fetchContacts(data.user.id)
        fetchConnections()
        fetchConnectionRequests()
        fetchIntroductions()
      })
      .catch(err => {
        console.error('Failed to check auth:', err)
        router.push('/login')
      })
  }, [router])

  const fetchContacts = async (uid: string) => {
    setContactsLoading(true)
    try {
      const response = await fetch(`/api/contacts?userId=${uid}`)
      const data = await response.json()
      if (data.contacts) {
        setContacts(data.contacts)
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err)
    } finally {
      setContactsLoading(false)
    }
  }

  const fetchConnections = async () => {
    setConnectionsLoading(true)
    try {
      const response = await fetch('/api/linkedin/connections')
      const data = await response.json()
      if (data.success) {
        setConnections(data.connections || [])
        setLinkedInConnected(true)
      } else if (data.notConnected) {
        setLinkedInConnected(false)
      }
    } catch (err) {
      console.error('Failed to fetch connections:', err)
    } finally {
      setConnectionsLoading(false)
    }
  }

  const fetchConnectionRequests = async () => {
    setRequestsLoading(true)
    try {
      const response = await fetch('/api/connections')
      const data = await response.json()
      if (data.success) {
        setMyConnections(data.connections || [])
        setPendingReceived(data.pendingReceived || [])
        setPendingSent(data.pendingSent || [])
      }
    } catch (err) {
      console.error('Failed to fetch connection requests:', err)
    } finally {
      setRequestsLoading(false)
    }
  }

  const fetchIntroductions = async () => {
    try {
      const response = await fetch('/api/introductions')
      const data = await response.json()
      if (data.success) {
        setIntroductionsMade(data.introductionsMade || [])
        setIntroductionsReceived(data.introductionsReceived || [])
      }
    } catch (err) {
      console.error('Failed to fetch introductions:', err)
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

  const getOtherPerson = (intro: Introduction) => {
    const isPersonA = intro.personAUserId === userId || intro.personAEmail === currentUserEmail
    return {
      name: isPersonA ? intro.personBName : intro.personAName,
      company: isPersonA ? intro.personBCompany : intro.personACompany,
      user: isPersonA ? intro.personBUser : intro.personAUser,
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
        setRequestError('')
        const request = pendingReceived.find(r => r.id === requestId)
        setPendingReceived(prev => prev.filter(r => r.id !== requestId))
        if (action === 'accept' && request?.fromUser) {
          setMyConnections(prev => [request.fromUser!, ...prev])
        }
      } else {
        setRequestError(data.error || 'Failed to respond to request. Please try again.')
      }
    } catch (err) {
      console.error('Failed to respond to request:', err)
      setRequestError('An unexpected error occurred. Please try again.')
    } finally {
      setRespondingTo(null)
    }
  }

  const handleSyncConnections = async () => {
    setConnectionsSyncing(true)
    try {
      const response = await fetch('/api/linkedin/connections', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        setConnections(data.connections || [])
      }
    } catch (err) {
      console.error('Failed to sync connections:', err)
    } finally {
      setConnectionsSyncing(false)
    }
  }

  const handleConnectLinkedIn = () => {
    window.location.href = '/api/auth/linkedin?returnTo=/connections'
  }

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContact.firstName || !newContact.lastName) return

    setAddingContact(true)
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          contacts: [newContact],
        }),
      })
      const data = await response.json()
      if (data.success) {
        setContacts(data.contacts)
        setShowAddModal(false)
        setNewContact({ firstName: '', lastName: '', email: '', phone: '', company: '' })
      }
    } catch (err) {
      console.error('Failed to add contact:', err)
    } finally {
      setAddingContact(false)
    }
  }

  // Deduplicate contacts by email (keep first occurrence)
  const deduplicatedContacts = contacts.reduce((acc, contact) => {
    // Skip if we already have a contact with this email
    if (contact.email) {
      const existingIndex = acc.findIndex(c => c.email?.toLowerCase() === contact.email?.toLowerCase())
      if (existingIndex !== -1) {
        // If the new one has linkedUser and existing doesn't, replace it
        if (contact.linkedUser && !acc[existingIndex].linkedUser) {
          acc[existingIndex] = contact
        }
        return acc
      }
    }
    acc.push(contact)
    return acc
  }, [] as Contact[])

  // Filter contacts based on search query
  const filteredContacts = deduplicatedContacts.filter((contact) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      contact.firstName.toLowerCase().includes(query) ||
      contact.lastName.toLowerCase().includes(query) ||
      (contact.email && contact.email.toLowerCase().includes(query)) ||
      (contact.company && contact.company.toLowerCase().includes(query)) ||
      (contact.phone && contact.phone.includes(query))
    )
  })

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-gray-600 text-lg">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-white mb-2">My Connections</h1>
            <p className="text-blue-100">
              View and manage your contacts and connections
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex justify-center border-b border-gray-200 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Requests
                {pendingReceived.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                    {pendingReceived.length}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Contacts
                {deduplicatedContacts.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {deduplicatedContacts.length}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('introductions')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === 'introductions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Introductions
                {(introductionsMade.length + introductionsReceived.length) > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {introductionsMade.length + introductionsReceived.length}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('linkedin')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px ${
                activeTab === 'linkedin'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <LinkedInIcon className="w-5 h-5" />
                LinkedIn
                {connections.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {connections.length}
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* Requests Tab Content */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Error Banner */}
              {requestError && (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 font-medium text-sm">{requestError}</p>
                  <button onClick={() => setRequestError('')} className="ml-auto text-red-500 hover:text-red-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Pending Received */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  Requests Received
                  {pendingReceived.length > 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                      {pendingReceived.length}
                    </span>
                  )}
                </h3>
                {requestsLoading ? (
                  <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-gray-600">Loading...</p>
                  </div>
                ) : pendingReceived.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
                    No pending requests
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingReceived.map((request) => (
                      <div key={request.id} className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex items-start gap-4">
                          <a href={`/${request.fromUser?.username || request.fromUser?.id}`} className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold overflow-hidden">
                              {request.fromUser?.profilePicture ? (
                                <img src={request.fromUser.profilePicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                `${request.fromUser?.firstName.charAt(0)}${request.fromUser?.lastName.charAt(0)}`
                              )}
                            </div>
                          </a>
                          <div className="flex-1 min-w-0">
                            <a href={`/${request.fromUser?.username || request.fromUser?.id}`} className="hover:underline">
                              <h4 className="font-semibold text-gray-900">
                                {request.fromUser?.firstName} {request.fromUser?.lastName}
                              </h4>
                            </a>
                            {request.fromUser?.companyName && (
                              <p className="text-sm text-gray-500">{request.fromUser.companyName}</p>
                            )}
                            {request.note && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 italic">"{request.note}"</p>
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleRespondToRequest(request.id, 'decline')}
                            disabled={respondingTo === request.id}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleRespondToRequest(request.id, 'accept')}
                            disabled={respondingTo === request.id}
                            className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-emerald-500 to-teal-500 font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors disabled:opacity-50"
                          >
                            {respondingTo === request.id ? 'Processing...' : 'Accept'}
                          </button>
                          <a
                            href={`/api/user/vcard/${request.fromUser?.username || request.fromUser?.id}`}
                            download
                            className="px-4 py-2 text-blue-600 bg-blue-50 font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                            title="Download VCF Card"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            VCF
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Sent */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  Requests Sent
                  {pendingSent.length > 0 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {pendingSent.length}
                    </span>
                  )}
                </h3>
                {pendingSent.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
                    No pending sent requests
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingSent.map((request) => (
                      <div key={request.id} className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
                        <a href={`/${request.toUser?.username || request.toUser?.id}`} className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold overflow-hidden">
                            {request.toUser?.profilePicture ? (
                              <img src={request.toUser.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : (
                              `${request.toUser?.firstName.charAt(0)}${request.toUser?.lastName.charAt(0)}`
                            )}
                          </div>
                        </a>
                        <div className="flex-1 min-w-0">
                          <a href={`/${request.toUser?.username || request.toUser?.id}`} className="hover:underline">
                            <h4 className="font-semibold text-gray-900">
                              {request.toUser?.firstName} {request.toUser?.lastName}
                            </h4>
                          </a>
                          {request.toUser?.companyName && (
                            <p className="text-sm text-gray-500">{request.toUser.companyName}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-sm rounded-full">
                            Pending
                          </span>
                          <a
                            href={`/api/user/vcard/${request.toUser?.username || request.toUser?.id}`}
                            download
                            className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Download VCF Card"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* My Connections */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  My Connections
                  {myConnections.length > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                      {myConnections.length}
                    </span>
                  )}
                </h3>
                {myConnections.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
                    No connections yet
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden divide-y divide-gray-200">
                    {myConnections.map((user) => (
                      <div key={user.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <a href={`/${user.username || user.id}`} className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : (
                              `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                            )}
                          </div>
                        </a>
                        <div className="flex-1 min-w-0">
                          <a href={`/${user.username || user.id}`} className="hover:underline">
                            <h4 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h4>
                          </a>
                          {user.companyName && (
                            <p className="text-sm text-gray-500">{user.companyName}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`/${user.username || user.id}`}
                            className="px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            View Profile
                          </a>
                          <a
                            href={`/api/user/vcard/${user.username || user.id}`}
                            download
                            className="px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                            title="Download VCF Card"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            VCF
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Contacts Tab Content */}
          {activeTab === 'contacts' && (
            <div>
              {/* Search Bar and Add Button */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Contact
                </button>
              </div>

              {contactsLoading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-gray-600">Loading contacts...</p>
                </div>
              ) : deduplicatedContacts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Contacts Yet</h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    You haven't added any contacts yet. Click "Add Contact" above to get started.
                  </p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    No contacts match "{searchQuery}". Try a different search term.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {filteredContacts.map((contact) => {
                      const hasBusinessCard = contact.linkedUser?.username && contact.linkedUser?.hasCompletedOnboarding
                      const profileUrl = hasBusinessCard ? `/${contact.linkedUser!.username}` : null

                      return (
                        <div key={contact.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            {/* Profile Picture - clickable if has Business Card */}
                            {profileUrl ? (
                              <a href={profileUrl} className="flex-shrink-0">
                                {contact.linkedUser?.profilePicture ? (
                                  <img
                                    src={contact.linkedUser.profilePicture}
                                    alt={`${contact.firstName} ${contact.lastName}`}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200 hover:ring-purple-400 transition-all"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg ring-2 ring-purple-200 hover:ring-purple-400 transition-all">
                                    {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                                  </div>
                                )}
                              </a>
                            ) : contact.linkedUser?.profilePicture ? (
                              <img
                                src={contact.linkedUser.profilePicture}
                                alt={`${contact.firstName} ${contact.lastName}`}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              {/* Name - clickable if has Business Card */}
                              {profileUrl ? (
                                <a href={profileUrl} className="font-semibold text-purple-600 hover:text-purple-800 hover:underline">
                                  {contact.firstName} {contact.lastName}
                                </a>
                              ) : (
                                <p className="font-semibold text-gray-900">
                                  {contact.firstName} {contact.lastName}
                                </p>
                              )}
                              {contact.company && (
                                <p className="text-sm text-gray-600">{contact.company}</p>
                              )}
                              <div className="flex items-center gap-4 mt-1">
                                {contact.email && (
                                  <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline">
                                    {contact.email}
                                  </a>
                                )}
                                {contact.phone && (
                                  <span className="text-sm text-gray-500">{contact.phone}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {hasBusinessCard && (
                                <a
                                  href={profileUrl!}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:shadow-md transition-all"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                  </svg>
                                  View Card
                                </a>
                              )}
                              {contact.linkedUser?.id && (
                                <a
                                  href={`/api/user/vcard/${contact.linkedUser.username || contact.linkedUser.id}`}
                                  download
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-all"
                                  title="Download VCF Card"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  VCF
                                </a>
                              )}
                              {contact.degreeType && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                  {contact.degreeType === 'FIRST_DEGREE' ? '1st Degree' : contact.degreeType === 'SECOND_DEGREE' ? '2nd Degree' : contact.degreeType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Introductions Tab Content */}
          {activeTab === 'introductions' && (
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
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

              {/* Introductions Received */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  Introductions Received
                  {introductionsReceived.length > 0 && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {introductionsReceived.length}
                    </span>
                  )}
                </h3>
                {introductionsReceived.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
                    No introductions received yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {introductionsReceived.map((intro) => {
                      const otherPerson = getOtherPerson(intro)
                      return (
                        <div key={intro.id} className="bg-white rounded-xl shadow-md p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {intro.introducer && (
                                <a
                                  href={`/${intro.introducer.username || intro.introducer.id}`}
                                  className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden hover:ring-2 hover:ring-purple-400 transition-all"
                                >
                                  {intro.introducer.profilePicture ? (
                                    <img src={intro.introducer.profilePicture} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    `${intro.introducer.firstName[0]}${intro.introducer.lastName[0]}`
                                  )}
                                </a>
                              )}
                              <p className="text-sm text-gray-500">
                                Introduced by {intro.introducer ? (
                                  <a href={`/${intro.introducer.username || intro.introducer.id}`} className="font-medium hover:text-purple-600">
                                    {intro.introducer.firstName} {intro.introducer.lastName}
                                  </a>
                                ) : 'Unknown'}
                              </p>
                            </div>
                            {getIntroStatusBadge(intro)}
                          </div>
                          <div className="flex items-center gap-4">
                            {otherPerson.user ? (
                              <a href={`/${otherPerson.user.username || otherPerson.user.id}`} className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all">
                                  {otherPerson.user.profilePicture ? (
                                    <img src={otherPerson.user.profilePicture} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    `${otherPerson.user.firstName[0]}${otherPerson.user.lastName[0]}`
                                  )}
                                </div>
                              </a>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {otherPerson.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              {otherPerson.user ? (
                                <a href={`/${otherPerson.user.username || otherPerson.user.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                                  {otherPerson.name}
                                </a>
                              ) : (
                                <p className="font-semibold text-gray-900">{otherPerson.name}</p>
                              )}
                              {otherPerson.company && (
                                <p className="text-sm text-gray-500">{otherPerson.company}</p>
                              )}
                            </div>
                            {intro.status === 'both_accepted' && otherPerson.user && (
                              <a
                                href={`/${otherPerson.user.username || otherPerson.user.id}`}
                                className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-200 transition-colors"
                              >
                                View Card
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Introductions Made */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  Introductions Made
                  {introductionsMade.length > 0 && (
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full">
                      {introductionsMade.length}
                    </span>
                  )}
                </h3>
                {introductionsMade.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
                    No introductions made yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {introductionsMade.map((intro) => (
                      <div key={intro.id} className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm text-gray-400">{new Date(intro.createdAt).toLocaleDateString()}</p>
                          {getIntroStatusBadge(intro)}
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Person A */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {intro.personAUser ? (
                              <a href={`/${intro.personAUser.username || intro.personAUser.id}`} className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all">
                                  {intro.personAUser.profilePicture ? (
                                    <img src={intro.personAUser.profilePicture} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    `${intro.personAUser.firstName[0]}${intro.personAUser.lastName[0]}`
                                  )}
                                </div>
                              </a>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {intro.personAName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              {intro.personAUser ? (
                                <a href={`/${intro.personAUser.username || intro.personAUser.id}`} className="font-medium text-gray-900 text-sm truncate block hover:text-blue-600">
                                  {intro.personAName}
                                </a>
                              ) : (
                                <p className="font-medium text-gray-900 text-sm truncate">{intro.personAName}</p>
                              )}
                              <span className={`inline-block w-2 h-2 rounded-full ${intro.personAAccepted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </div>

                          {/* Person B */}
                          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                            <div className="min-w-0 text-right">
                              {intro.personBUser ? (
                                <a href={`/${intro.personBUser.username || intro.personBUser.id}`} className="font-medium text-gray-900 text-sm truncate block hover:text-purple-600">
                                  {intro.personBName}
                                </a>
                              ) : (
                                <p className="font-medium text-gray-900 text-sm truncate">{intro.personBName}</p>
                              )}
                              <span className={`inline-block w-2 h-2 rounded-full ${intro.personBAccepted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            </div>
                            {intro.personBUser ? (
                              <a href={`/${intro.personBUser.username || intro.personBUser.id}`} className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden hover:ring-2 hover:ring-purple-400 transition-all">
                                  {intro.personBUser.profilePicture ? (
                                    <img src={intro.personBUser.profilePicture} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    `${intro.personBUser.firstName[0]}${intro.personBUser.lastName[0]}`
                                  )}
                                </div>
                              </a>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {intro.personBName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        {intro.status === 'both_accepted' && (
                          <div className="flex items-center gap-2 mt-3 p-2 bg-emerald-50 rounded-lg text-sm text-emerald-700">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Successfully connected!
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LinkedIn Tab Content */}
          {activeTab === 'linkedin' && (
            <div>
              {/* LinkedIn Status Banner */}
              {linkedInConnected ? (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0A66C2] rounded-full flex items-center justify-center">
                      <LinkedInIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">LinkedIn Connected</p>
                      <p className="text-sm text-gray-600">Your LinkedIn account is linked</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSyncConnections}
                    disabled={connectionsSyncing}
                    className="px-4 py-2 text-sm font-medium text-[#0A66C2] bg-white border border-[#0A66C2] rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connectionsSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
              ) : (
                <div className="mb-6 p-6 bg-white border border-gray-200 rounded-xl text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#0A66C2] rounded-full flex items-center justify-center">
                    <LinkedInIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your LinkedIn</h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    Link your LinkedIn account to view your professional connections here.
                  </p>
                  <button
                    onClick={handleConnectLinkedIn}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A66C2] text-white font-semibold rounded-xl hover:bg-[#004182] transition-colors"
                  >
                    <LinkedInIcon className="w-5 h-5" />
                    Connect LinkedIn
                  </button>
                </div>
              )}

              {/* Connections List */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <ConnectionsList
                  connections={connections}
                  loading={connectionsLoading}
                  onSync={handleSyncConnections}
                  syncing={connectionsSyncing}
                  linkedInConnected={linkedInConnected}
                  onConnectLinkedIn={handleConnectLinkedIn}
                />
              </div>

              {/* Info Note */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Note about LinkedIn Connections</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Full access to LinkedIn connections requires LinkedIn Partner Program approval.
                      If you don't see all your connections, this feature may be limited.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Contact</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddContact} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newContact.firstName}
                    onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newContact.lastName}
                    onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Acme Inc."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingContact || !newContact.firstName || !newContact.lastName}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingContact ? 'Adding...' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
