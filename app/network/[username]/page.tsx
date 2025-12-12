'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

export default function NetworkPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const firstDegreeId = params.username as string
  const referralId = searchParams.get('referralId')
  const refereeId = searchParams.get('refereeId')

  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [referralData, setReferralData] = useState<any>(null)
  const [responded, setResponded] = useState(false)
  const [response, setResponse] = useState('')

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!referralId || !refereeId || !firstDegreeId) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(
          `/api/referral/respond?referralId=${referralId}&refereeId=${refereeId}&firstDegreeId=${firstDegreeId}`
        )

        if (res.ok) {
          const data = await res.json()
          setReferralData(data.referral)
        }
      } catch (error) {
        console.error('Error fetching referral:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [referralId, refereeId, firstDegreeId])

  const buildRefereeStatement = (referee: any) => {
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

  const handleResponse = async (responseType: 'APPROVED' | 'DENIED') => {
    if (!referralData) return

    setResponding(true)

    try {
      const res = await fetch('/api/referral/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralId: referralData.id,
          response: responseType,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setResponded(true)
        setResponse(responseType)
        // Redirect to introductions page after brief delay to show success message
        setTimeout(() => {
          router.push('/introductions')
        }, 1500)
      } else {
        alert(data.error || 'Failed to respond')
      }
    } catch (error) {
      console.error('Error responding:', error)
      alert('An error occurred')
    } finally {
      setResponding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!referralData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white shadow rounded-lg p-8">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Introduction Not Found
            </h2>
            <p className="mt-2 text-gray-600">
              This introduction request could not be found or may have expired.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (responded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white shadow rounded-lg p-8">
            <div className="mb-6">
              <svg
                className={`mx-auto h-16 w-16 ${
                  response === 'APPROVED' ? 'text-green-500' : 'text-gray-500'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {response === 'APPROVED' ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              {response === 'APPROVED'
                ? 'Introduction Approved!'
                : 'Introduction Declined'}
            </h2>
            <p className="text-gray-600">
              {response === 'APPROVED'
                ? `Thank you! ${referralData.referee.firstName} and ${referralData.firstDegree.firstName} have been notified.`
                : `Your response has been recorded. ${referralData.referee.firstName} and ${referralData.firstDegree.firstName} have been notified.`}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (referralData.status !== 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white shadow rounded-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Already Responded
            </h2>
            <p className="mt-2 text-gray-600">
              You have already responded to this introduction request.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Introduction Request
          </h1>

          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-4">
              Hi {referralData.referral.firstName},
            </p>
            <p className="text-gray-700">
              {referralData.firstDegree.firstName}{' '}
              {referralData.firstDegree.lastName} thought you should meet{' '}
              {referralData.referee.firstName} {referralData.referee.lastName}.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3 text-lg">
              About {referralData.referee.firstName}:
            </h3>
            <p className="text-blue-800 whitespace-pre-line">
              {buildRefereeStatement(referralData.referee)}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Would you like to connect with {referralData.referee.firstName}?
            </h3>
            <p className="text-sm text-gray-600">
              If you approve, your contact information will be shared with{' '}
              {referralData.referee.firstName}.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleResponse('APPROVED')}
              disabled={responding}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {responding ? 'Processing...' : 'Approve Introduction'}
            </button>
            <button
              onClick={() => handleResponse('DENIED')}
              disabled={responding}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {responding ? 'Processing...' : 'Decline'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              This introduction was facilitated through the Intro Network
              platform
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
