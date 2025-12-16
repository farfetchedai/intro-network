'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface Referee {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  company: string | null
  title: string | null
  statementSummary: string | null
  skills: string | null
  companyName: string | null
  achievement: string | null
  achievementMethod: string | null
  introRequest: string | null
}

interface FirstDegree {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

interface Referral {
  id: string
  status: string
  createdAt: string
  approvedAt: string | null
  deniedAt: string | null
  referee: Referee
  firstDegree: FirstDegree
}

export default function IntroductionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)

  const buildRefereeStatement = (referee: Referee) => {
    if (!referee) return ''

    // Parse skills if it's a JSON array
    let skillsList: string[] = []
    if (referee.skills) {
      try {
        skillsList = JSON.parse(referee.skills)
      } catch (e) {
        skillsList = [referee.skills]
      }
    }

    let fullStatement = ''

    // Start with skills
    if (skillsList.length > 0) {
      fullStatement = `${referee.firstName} ${referee.lastName} is great at ${skillsList.join(' and ')}.`
    }

    // Add company and achievement
    if (referee.companyName || referee.achievement || referee.achievementMethod) {
      if (fullStatement) fullStatement += ' '

      if (referee.companyName && referee.achievement && referee.achievementMethod) {
        fullStatement += `${referee.firstName} has worked at ${referee.companyName} where they ${referee.achievement} by ${referee.achievementMethod}.`
      } else if (referee.companyName && referee.achievement) {
        fullStatement += `${referee.firstName} has worked at ${referee.companyName} where they ${referee.achievement}.`
      } else if (referee.companyName) {
        fullStatement += `${referee.firstName} has worked at ${referee.companyName}.`
      }
    }

    // Add intro request
    if (referee.introRequest) {
      if (fullStatement) fullStatement += ' '
      fullStatement += `They would really appreciate ${referee.introRequest}.`
    }

    // Fallback to statementSummary if no components are available
    if (!fullStatement && referee.statementSummary) {
      fullStatement = referee.statementSummary
    }

    return fullStatement
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResponse = await fetch('/api/auth/me')
        if (authResponse.ok) {
          const authData = await authResponse.json()
          if (authData.success && authData.user) {
            setUser({ id: authData.user.id })

            // Fetch referrals
            const referralsResponse = await fetch(`/api/referrals?userId=${authData.user.id}`)
            if (referralsResponse.ok) {
              const data = await referralsResponse.json()
              // We want the initiated referrals (where user is the referee requesting introductions)
              setReferrals(data.referrals.initiated || [])
            }
          } else {
            router.push('/referee')
          }
        } else {
          router.push('/referee')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/referee')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </>
    )
  }

  const pendingReferrals = referrals.filter(r => r.status === 'PENDING')
  const approvedReferrals = referrals.filter(r => r.status === 'APPROVED')
  const deniedReferrals = referrals.filter(r => r.status === 'DENIED')

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Introductions</h1>
            <p className="text-gray-600 mt-2">Track all your introduction requests</p>
          </div>

          {referrals.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">You haven't received any introduction requests yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pending Introductions */}
              {pendingReferrals.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Pending ({pendingReferrals.length})
                  </h2>
                  <div className="space-y-4">
                    {pendingReferrals.map(referral => (
                      <div key={referral.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {referral.referee.firstName[0]}{referral.referee.lastName[0]}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {referral.referee.firstName} {referral.referee.lastName}
                                </h3>
                                {referral.referee.title && referral.referee.company && (
                                  <p className="text-sm text-gray-600">
                                    {referral.referee.title} at {referral.referee.company}
                                  </p>
                                )}
                              </div>
                            </div>

                            {buildRefereeStatement(referral.referee) && (
                              <div className="mt-3 bg-gray-50 p-4 rounded">
                                <p className="text-sm text-gray-700">{buildRefereeStatement(referral.referee)}</p>
                              </div>
                            )}

                            <div className="mt-3 text-sm text-gray-500">
                              Introduced by {referral.firstDegree.firstName} {referral.firstDegree.lastName}
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Introductions */}
              {approvedReferrals.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Approved ({approvedReferrals.length})
                  </h2>
                  <div className="space-y-4">
                    {approvedReferrals.map(referral => (
                      <div key={referral.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
                                {referral.referee.firstName[0]}{referral.referee.lastName[0]}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {referral.referee.firstName} {referral.referee.lastName}
                                </h3>
                                {referral.referee.title && referral.referee.company && (
                                  <p className="text-sm text-gray-600">
                                    {referral.referee.title} at {referral.referee.company}
                                  </p>
                                )}
                              </div>
                            </div>

                            {buildRefereeStatement(referral.referee) && (
                              <div className="mt-3 bg-gray-50 p-4 rounded">
                                <p className="text-sm text-gray-700">{buildRefereeStatement(referral.referee)}</p>
                              </div>
                            )}

                            <div className="mt-3 text-sm text-gray-500">
                              Introduced by {referral.firstDegree.firstName} {referral.firstDegree.lastName}
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            Approved
                          </span>
                        </div>

                        {/* Contact Details - Only shown for approved */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Contact Information:</h4>
                          <div className="space-y-1">
                            {referral.referee.email && (
                              <div className="flex items-center text-sm text-gray-700">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href={`mailto:${referral.referee.email}`} className="text-blue-600 hover:underline">
                                  {referral.referee.email}
                                </a>
                              </div>
                            )}
                            {referral.referee.phone && (
                              <div className="flex items-center text-sm text-gray-700">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href={`tel:${referral.referee.phone}`} className="text-blue-600 hover:underline">
                                  {referral.referee.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Declined Introductions */}
              {deniedReferrals.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Declined ({deniedReferrals.length})
                  </h2>
                  <div className="space-y-4">
                    {deniedReferrals.map(referral => (
                      <div key={referral.id} className="bg-white rounded-lg shadow p-6 opacity-75">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
                                {referral.referee.firstName[0]}{referral.referee.lastName[0]}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {referral.referee.firstName} {referral.referee.lastName}
                                </h3>
                                {referral.referee.title && referral.referee.company && (
                                  <p className="text-sm text-gray-600">
                                    {referral.referee.title} at {referral.referee.company}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-3 text-sm text-gray-500">
                              Introduced by {referral.firstDegree.firstName} {referral.firstDegree.lastName}
                            </div>
                          </div>
                          
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            Declined
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
