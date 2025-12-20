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

type TabType = 'contacts' | 'linkedin'

export default function ConnectionsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('contacts')
  const [userId, setUserId] = useState('')
  const [linkedInConnected, setLinkedInConnected] = useState(false)
  const [connections, setConnections] = useState<Connection[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [connectionsLoading, setConnectionsLoading] = useState(false)
  const [connectionsSyncing, setConnectionsSyncing] = useState(false)
  const [userName, setUserName] = useState('')

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
        if (data.user.linkedInAccount) {
          setLinkedInConnected(true)
        }
        setIsLoading(false)
        fetchContacts(data.user.id)
        fetchConnections()
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

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) => {
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
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px ${
                activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                My Contacts
                {contacts.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {contacts.length}
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
              ) : contacts.length === 0 ? (
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
                    {filteredContacts.map((contact) => (
                      <div key={contact.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          {contact.linkedUser?.profilePicture ? (
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
                            <p className="font-semibold text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </p>
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
                            {contact.linkedUser?.username && contact.linkedUser?.hasCompletedOnboarding && (
                              <a
                                href={`/${contact.linkedUser.username}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:shadow-md transition-all"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                View Card
                              </a>
                            )}
                            {contact.degreeType && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                {contact.degreeType === 'FIRST_DEGREE' ? '1st Degree' : contact.degreeType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
