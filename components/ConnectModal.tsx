'use client'

import { useState } from 'react'

interface ConnectModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: {
    id: string
    firstName: string
    lastName: string
    profilePicture?: string | null
    companyName?: string | null
  }
  onSuccess: () => void
}

export default function ConnectModal({
  isOpen,
  onClose,
  targetUser,
  onSuccess,
}: ConnectModalProps) {
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: targetUser.id,
          note: note.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
        onClose()
        setNote('')
      } else {
        setError(data.error || 'Failed to send connection request')
      }
    } catch (err) {
      console.error('Connection request error:', err)
      setError('Failed to send connection request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setNote('')
      setError(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
            {targetUser.profilePicture ? (
              <img
                src={targetUser.profilePicture}
                alt={`${targetUser.firstName} ${targetUser.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              `${targetUser.firstName.charAt(0)}${targetUser.lastName.charAt(0)}`
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Connect with {targetUser.firstName}
          </h3>
          {targetUser.companyName && (
            <p className="text-sm text-gray-500 mt-1">{targetUser.companyName}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder={`Hi ${targetUser.firstName}, I'd like to connect with you...`}
              className="w-full px-4 py-3 text-gray-800 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {note.length}/500 characters
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          {targetUser.firstName} will receive an email notification about your request.
        </p>
      </div>
    </div>
  )
}
