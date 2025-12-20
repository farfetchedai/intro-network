'use client'

import { useState } from 'react'
import LinkedInIcon from './LinkedInIcon'

interface Connection {
  id: string
  firstName: string
  lastName: string
  headline?: string | null
  profilePictureUrl?: string | null
  profileUrl?: string | null
}

interface ConnectionsListProps {
  connections: Connection[]
  loading?: boolean
  onSync?: () => void
  syncing?: boolean
  linkedInConnected?: boolean
  onConnectLinkedIn?: () => void
}

export default function ConnectionsList({
  connections,
  loading = false,
  onSync,
  syncing = false,
  linkedInConnected = false,
  onConnectLinkedIn,
}: ConnectionsListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConnections = connections.filter((connection) => {
    const fullName = `${connection.firstName} ${connection.lastName}`.toLowerCase()
    const headline = (connection.headline || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) || headline.includes(query)
  })

  if (!linkedInConnected) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#0A66C2] rounded-full flex items-center justify-center">
          <LinkedInIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect LinkedIn to View Connections
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Link your LinkedIn account to view your professional connections here.
        </p>
        {onConnectLinkedIn && (
          <button
            onClick={onConnectLinkedIn}
            className="inline-flex items-center gap-2 bg-[#0A66C2] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#004182] transition-colors"
          >
            <LinkedInIcon className="w-5 h-5" />
            Connect LinkedIn
          </button>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex justify-center items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-600">Loading connections...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with search and sync */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {onSync && (
          <button
            onClick={onSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
        )}
      </div>

      {/* Connections count */}
      <p className="text-sm text-gray-500">
        {filteredConnections.length} {filteredConnections.length === 1 ? 'connection' : 'connections'}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* Connections list */}
      {filteredConnections.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchQuery ? 'No connections found matching your search.' : 'No connections to display.'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Note: LinkedIn connections API requires Partner Program approval for full access.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredConnections.map((connection) => (
            <div
              key={connection.id}
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              {/* Profile picture */}
              <div className="flex-shrink-0">
                {connection.profilePictureUrl ? (
                  <img
                    src={connection.profilePictureUrl}
                    alt={`${connection.firstName} ${connection.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {connection.firstName.charAt(0)}{connection.lastName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {connection.firstName} {connection.lastName}
                </h4>
                {connection.headline && (
                  <p className="text-sm text-gray-500 truncate">{connection.headline}</p>
                )}
              </div>

              {/* Actions */}
              {connection.profileUrl && (
                <a
                  href={connection.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-[#0A66C2] transition-colors"
                  title="View on LinkedIn"
                >
                  <LinkedInIcon className="w-5 h-5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
