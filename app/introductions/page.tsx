'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface User {
  id: string
  firstName: string
  lastName: string
  username: string | null
  profilePicture: string | null
  companyName?: string | null
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
  introducer?: User
  personAUser?: User | null
  personBUser?: User | null
}

type TabType = 'received' | 'made'

export default function IntroductionsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('received')
  const [introductionsMade, setIntroductionsMade] = useState<Introduction[]>([])
  const [introductionsReceived, setIntroductionsReceived] = useState<Introduction[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentUserEmail, setCurrentUserEmail] = useState('')
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.user) {
          router.push('/login')
          return
        }
        setCurrentUserId(data.user.id)
        setCurrentUserEmail(data.user.email)
        setIsLoading(false)
        fetchIntroductions()
      })
      .catch(err => {
        console.error('Failed to check auth:', err)
        router.push('/login')
      })
  }, [router])

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

  const handleRespond = async (introductionId: string, action: 'accept' | 'decline') => {
    setRespondingTo(introductionId)
    setError('')

    try {
      const response = await fetch('/api/introductions/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ introductionId, action }),
      })

      const data = await response.json()

      if (data.success) {
        setIntroductionsReceived(prev => prev.map(intro => {
          if (intro.id === introductionId) {
            const isPersonA = intro.personAUserId === currentUserId || intro.personAEmail === currentUserEmail
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
        setError(data.error || 'Failed to respond')
      }
    } catch (err) {
      console.error('Failed to respond:', err)
      setError('An unexpected error occurred')
    } finally {
      setRespondingTo(null)
    }
  }

  const getStatusBadge = (intro: Introduction) => {
    switch (intro.status) {
      case 'pending':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Pending</span>
      case 'personA_accepted':
      case 'personB_accepted':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Partially Accepted</span>
      case 'both_accepted':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Connected</span>
      case 'declined':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Declined</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{intro.status}</span>
    }
  }

  const getUserAcceptanceStatus = (intro: Introduction) => {
    const isPersonA = intro.personAUserId === currentUserId || intro.personAEmail === currentUserEmail
    const myAccepted = isPersonA ? intro.personAAccepted : intro.personBAccepted
    const theirAccepted = isPersonA ? intro.personBAccepted : intro.personAAccepted

    if (intro.status === 'declined') {
      return { canRespond: false, myStatus: 'declined', theirStatus: 'declined' }
    }

    return {
      canRespond: !myAccepted && intro.status !== 'both_accepted',
      myStatus: myAccepted ? 'accepted' : 'pending',
      theirStatus: theirAccepted ? 'accepted' : 'pending',
    }
  }

  const getOtherPerson = (intro: Introduction) => {
    const isPersonA = intro.personAUserId === currentUserId || intro.personAEmail === currentUserEmail
    return {
      name: isPersonA ? intro.personBName : intro.personAName,
      email: isPersonA ? intro.personBEmail : intro.personAEmail,
      company: isPersonA ? intro.personBCompany : intro.personACompany,
      context: isPersonA ? intro.personBContext : intro.personAContext,
      user: isPersonA ? intro.personBUser : intro.personAUser,
    }
  }

  const pendingCount = introductionsReceived.filter(intro => {
    const status = getUserAcceptanceStatus(intro)
    return status.canRespond
  }).length

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

  const receivedTabClass = activeTab === 'received'
    ? 'border-blue-500 text-blue-600'
    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'

  const madeTabClass = activeTab === 'made'
    ? 'border-blue-500 text-blue-600'
    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-white mb-2">Introductions</h1>
            <p className="text-blue-100">View and manage your introductions</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={() => router.push('/getintros')}
              className="px-5 py-2.5 bg-white border-2 border-purple-500 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Get Introduced
            </button>
            <button
              onClick={() => router.push('/giveintros')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Give an Introduction
            </button>
          </div>

          <div className="flex justify-center border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px ${receivedTabClass}`}
            >
              <span className="flex items-center gap-2">
                Received
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                    {pendingCount}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('made')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px ${madeTabClass}`}
            >
              <span className="flex items-center gap-2">
                Made by You
                {introductionsMade.length > 0 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {introductionsMade.length}
                  </span>
                )}
              </span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <p className="text-red-700 font-medium">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {activeTab === 'received' && (
            <div className="space-y-4">
              {introductionsReceived.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Introductions Received</h3>
                  <p className="text-gray-600">When someone introduces you to others, they will appear here.</p>
                </div>
              ) : (
                introductionsReceived.map((intro) => {
                  const otherPerson = getOtherPerson(intro)
                  const status = getUserAcceptanceStatus(intro)

                  return (
                    <div key={intro.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {intro.introducer && (
                              <a href={`/${intro.introducer.username || intro.introducer.id}`} className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                  {intro.introducer.profilePicture ? (
                                    <img src={intro.introducer.profilePicture} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    intro.introducer.firstName[0] + intro.introducer.lastName[0]
                                  )}
                                </div>
                              </a>
                            )}
                            <div>
                              <p className="text-sm text-gray-600">
                                Introduction from{' '}
                                {intro.introducer ? (
                                  <a href={`/${intro.introducer.username || intro.introducer.id}`} className="font-medium text-gray-900 hover:underline">
                                    {intro.introducer.firstName} {intro.introducer.lastName}
                                  </a>
                                ) : (
                                  'Unknown'
                                )}
                              </p>
                              <p className="text-xs text-gray-400">{new Date(intro.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {getStatusBadge(intro)}
                        </div>

                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                          <p className="text-sm text-gray-600 mb-3">Meet:</p>
                          <div className="flex items-center gap-4">
                            {otherPerson.user ? (
                              <a href={`/${otherPerson.user.username || otherPerson.user.id}`} className="flex-shrink-0">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                                  {otherPerson.user.profilePicture ? (
                                    <img src={otherPerson.user.profilePicture} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    otherPerson.user.firstName[0] + otherPerson.user.lastName[0]
                                  )}
                                </div>
                              </a>
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {otherPerson.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              {otherPerson.user ? (
                                <a href={`/${otherPerson.user.username || otherPerson.user.id}`} className="font-semibold text-gray-900 hover:underline text-lg">
                                  {otherPerson.name}
                                </a>
                              ) : (
                                <p className="font-semibold text-gray-900 text-lg">{otherPerson.name}</p>
                              )}
                              {otherPerson.company && <p className="text-gray-600">{otherPerson.company}</p>}
                              {otherPerson.context && <p className="text-sm text-gray-500 mt-1">{otherPerson.context}</p>}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap">{intro.message}</p>
                        </div>

                        <div className="flex items-center gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${status.myStatus === 'accepted' ? 'bg-emerald-500' : status.myStatus === 'declined' ? 'bg-red-500' : 'bg-amber-500'}`} />
                            <span className="text-gray-600">Your response: <span className="font-medium capitalize">{status.myStatus}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${status.theirStatus === 'accepted' ? 'bg-emerald-500' : status.theirStatus === 'declined' ? 'bg-red-500' : 'bg-amber-500'}`} />
                            <span className="text-gray-600">{otherPerson.name.split(' ')[0]}&apos;s response: <span className="font-medium capitalize">{status.theirStatus}</span></span>
                          </div>
                        </div>

                        {status.canRespond && (
                          <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => handleRespond(intro.id, 'decline')}
                              disabled={respondingTo === intro.id}
                              className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleRespond(intro.id, 'accept')}
                              disabled={respondingTo === intro.id}
                              className="flex-1 px-4 py-2.5 text-white bg-gradient-to-r from-emerald-500 to-teal-500 font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors disabled:opacity-50"
                            >
                              {respondingTo === intro.id ? 'Processing...' : 'Accept Introduction'}
                            </button>
                          </div>
                        )}

                        {intro.status === 'both_accepted' && (
                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between gap-3 p-3 bg-emerald-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-emerald-700 font-medium">You&apos;re now connected with {otherPerson.name}!</p>
                              </div>
                              {otherPerson.user && (
                                <a
                                  href={`/${otherPerson.user.username || otherPerson.user.id}`}
                                  className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2H15" />
                                  </svg>
                                  View Card
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {activeTab === 'made' && (
            <div className="space-y-4">
              {introductionsMade.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Introductions Made Yet</h3>
                  <p className="text-gray-600 mb-6">Connect people who should meet each other.</p>
                  <button
                    onClick={() => router.push('/giveintros')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Make Your First Introduction
                  </button>
                </div>
              ) : (
                introductionsMade.map((intro) => (
                  <div key={intro.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <p className="text-xs text-gray-400">{new Date(intro.createdAt).toLocaleDateString()}</p>
                        {getStatusBadge(intro)}
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 p-4 bg-blue-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            {intro.personAUser ? (
                              <a href={`/${intro.personAUser.username || intro.personAUser.id}`} className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                                  {intro.personAUser.profilePicture ? (
                                    <img src={intro.personAUser.profilePicture} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    intro.personAUser.firstName[0] + intro.personAUser.lastName[0]
                                  )}
                                </div>
                              </a>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {intro.personAName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              {intro.personAUser ? (
                                <a href={`/${intro.personAUser.username || intro.personAUser.id}`} className="font-semibold text-gray-900 hover:underline truncate block">
                                  {intro.personAName}
                                </a>
                              ) : (
                                <p className="font-semibold text-gray-900 truncate">{intro.personAName}</p>
                              )}
                              {intro.personACompany && <p className="text-sm text-gray-500 truncate">{intro.personACompany}</p>}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${intro.personAAccepted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-xs text-gray-500">{intro.personAAccepted ? 'Accepted' : 'Pending'}</span>
                          </div>
                        </div>

                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>

                        <div className="flex-1 p-4 bg-purple-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            {intro.personBUser ? (
                              <a href={`/${intro.personBUser.username || intro.personBUser.id}`} className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold overflow-hidden">
                                  {intro.personBUser.profilePicture ? (
                                    <img src={intro.personBUser.profilePicture} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    intro.personBUser.firstName[0] + intro.personBUser.lastName[0]
                                  )}
                                </div>
                              </a>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                {intro.personBName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              {intro.personBUser ? (
                                <a href={`/${intro.personBUser.username || intro.personBUser.id}`} className="font-semibold text-gray-900 hover:underline truncate block">
                                  {intro.personBName}
                                </a>
                              ) : (
                                <p className="font-semibold text-gray-900 truncate">{intro.personBName}</p>
                              )}
                              {intro.personBCompany && <p className="text-sm text-gray-500 truncate">{intro.personBCompany}</p>}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${intro.personBAccepted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-xs text-gray-500">{intro.personBAccepted ? 'Accepted' : 'Pending'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 line-clamp-2">{intro.message}</p>
                      </div>

                      {intro.status === 'both_accepted' && (
                        <div className="mt-4 flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <p className="text-emerald-700 font-medium">Successfully connected!</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
