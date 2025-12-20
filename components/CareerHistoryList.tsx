'use client'

interface CareerEntry {
  id: string
  title: string
  companyName: string
  companyLogoUrl?: string | null
  location?: string | null
  description?: string | null
  startDate?: string | Date | null
  endDate?: string | Date | null
  isCurrent: boolean
  importedFromLinkedIn: boolean
}

interface CareerHistoryListProps {
  entries: CareerEntry[]
  loading?: boolean
  editable?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function getDateRange(entry: CareerEntry): string {
  const start = formatDate(entry.startDate)
  if (entry.isCurrent) {
    return start ? `${start} - Present` : 'Present'
  }
  const end = formatDate(entry.endDate)
  if (start && end) {
    return `${start} - ${end}`
  }
  return start || end || ''
}

export default function CareerHistoryList({
  entries,
  loading = false,
  editable = false,
  onEdit,
  onDelete,
}: CareerHistoryListProps) {
  if (loading) {
    return (
      <div className="py-12">
        <div className="flex justify-center items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-600">Loading career history...</span>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Career History Yet
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Add your work experience to build your professional profile.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className="relative p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
        >
          {/* Timeline connector */}
          {index < entries.length - 1 && (
            <div className="absolute left-9 top-20 bottom-0 w-0.5 bg-gray-200" style={{ height: 'calc(100% - 40px)' }} />
          )}

          <div className="flex gap-4">
            {/* Company logo */}
            <div className="flex-shrink-0">
              {entry.companyLogoUrl ? (
                <img
                  src={entry.companyLogoUrl}
                  alt={entry.companyName}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                  <span className="text-gray-500 font-semibold text-lg">
                    {entry.companyName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                  <p className="text-gray-700">{entry.companyName}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                    <span>{getDateRange(entry)}</span>
                    {entry.location && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span>{entry.location}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Badges and actions */}
                <div className="flex items-center gap-2">
                  {entry.isCurrent && (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Current
                    </span>
                  )}
                  {entry.importedFromLinkedIn && (
                    <span className="px-2 py-1 text-xs font-medium text-[#0A66C2] bg-blue-50 rounded-full">
                      LinkedIn
                    </span>
                  )}
                  {editable && (
                    <div className="flex items-center gap-1 ml-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(entry.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {entry.description && (
                <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap">
                  {entry.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
