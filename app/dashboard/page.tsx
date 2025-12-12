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

interface Referral {
  id: string
  status: string
  approvedAt: string | null
  deniedAt: string | null
  createdAt: string
  referee: {
    firstName: string
    lastName: string
  }
  firstDegree: {
    firstName: string
    lastName: string
  }
  referral: {
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
  }
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [referrals, setReferrals] = useState<{
    initiated: Referral[]
    received: Referral[]
    facilitated: Referral[]
  }>({
    initiated: [],
    received: [],
    facilitated: [],
  })
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
      const [userRes, contactsRes, messagesRes, referralsRes] = await Promise.all([
        fetch(`/api/user?userId=${userId}`),
        fetch(`/api/contacts?userId=${userId}`),
        fetch(`/api/messages?userId=${userId}`),
        fetch(`/api/referrals?userId=${userId}`),
      ])

      const userData = await userRes.json()
      const contactsData = await contactsRes.json()
      const messagesData = await messagesRes.json()
      const referralsData = await referralsRes.json()

      if (userData.user) {
        setUser(userData.user)
      }

      if (contactsData.contacts) {
        setContacts(contactsData.contacts)
      }

      if (messagesData.messages) {
        setMessages(messagesData.messages)
      }

      if (referralsData.referrals) {
        setReferrals(referralsData.referrals)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
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
        setContacts(contacts.filter((c) => c.id !== contactId))
      } else {
        alert('Failed to delete contact')
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('An error occurred')
    }
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

        {/* Recent Contacts */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Contacts</h2>
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You haven't added any contacts yet</p>
              <button
                onClick={() => router.push('/referee')}
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Add Contacts
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </p>
                      {contact.requestSentAt && (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Request Sent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {contact.email && (
                        <p className="text-sm text-gray-600">{contact.email}</p>
                      )}
                      {contact.phone && (
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                      )}
                    </div>
                    {contact.company && (
                      <p className="text-sm text-gray-500 mt-1">{contact.company}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {contact.degreeType.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete contact"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Introduction Requests */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction Requests</h2>
          {[...referrals.initiated, ...referrals.received, ...referrals.facilitated].length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No introduction requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Initiated Introductions */}
              {referrals.initiated.map((referral) => (
                <div
                  key={referral.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-gray-900">
                          Your intro request to {referral.referral.firstName} {referral.referral.lastName}
                        </p>
                        {referral.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                            ✓ Successful Intro!
                          </span>
                        )}
                        {referral.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
                            ⏳ Pending
                          </span>
                        )}
                        {referral.status === 'DENIED' && (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                            ✗ Declined
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        via {referral.firstDegree.firstName} {referral.firstDegree.lastName}
                      </p>
                      {referral.status === 'APPROVED' && (referral.referral.email || referral.referral.phone) && (
                        <div className="mt-2 text-sm text-gray-700 bg-green-50 px-3 py-2 rounded">
                          {referral.referral.email && <p>Email: {referral.referral.email}</p>}
                          {referral.referral.phone && <p>Phone: {referral.referral.phone}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Received Introductions */}
              {referrals.received.map((referral) => (
                <div
                  key={referral.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-gray-900">
                          Intro request from {referral.referee.firstName} {referral.referee.lastName}
                        </p>
                        {referral.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                            ✓ Successful Intro!
                          </span>
                        )}
                        {referral.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
                            ⏳ Pending Your Response
                          </span>
                        )}
                        {referral.status === 'DENIED' && (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                            ✗ Declined
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        via {referral.firstDegree.firstName} {referral.firstDegree.lastName}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Facilitated Introductions */}
              {referrals.facilitated.map((referral) => (
                <div
                  key={referral.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-gray-900">
                          You facilitated: {referral.referee.firstName} {referral.referee.lastName} → {referral.referral.firstName} {referral.referral.lastName}
                        </p>
                        {referral.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                            ✓ Successful Intro!
                          </span>
                        )}
                        {referral.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
                            ⏳ Pending
                          </span>
                        )}
                        {referral.status === 'DENIED' && (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                            ✗ Declined
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No messages sent yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="border-2 border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {message.receiver.firstName} {message.receiver.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{message.subject}</p>
                    </div>
                    <div className="flex gap-2">
                      {message.sentViaEmail && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                          Email
                        </span>
                      )}
                      {message.sentViaSms && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                          SMS
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
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
