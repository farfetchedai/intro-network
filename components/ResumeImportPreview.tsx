'use client'

import { useState } from 'react'

export interface ParsedCareerEntry {
  title: string
  companyName: string
  location: string | null
  description: string | null
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  selected?: boolean
}

interface ResumeImportPreviewProps {
  entries: ParsedCareerEntry[]
  onImport: (entries: ParsedCareerEntry[]) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

function formatDateDisplay(dateStr: string | null): string {
  if (!dateStr) return ''
  // Handle YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const [year, month] = dateStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  // Try parsing as regular date
  const date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  return dateStr
}

export default function ResumeImportPreview({
  entries: initialEntries,
  onImport,
  onCancel,
  loading = false,
}: ResumeImportPreviewProps) {
  const [entries, setEntries] = useState<ParsedCareerEntry[]>(
    initialEntries.map((e) => ({ ...e, selected: true }))
  )
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const selectedCount = entries.filter((e) => e.selected).length

  const toggleEntry = (index: number) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, selected: !e.selected } : e))
    )
  }

  const updateEntry = (index: number, updates: Partial<ParsedCareerEntry>) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...updates } : e))
    )
  }

  const handleImport = async () => {
    const selectedEntries = entries.filter((e) => e.selected)
    await onImport(selectedEntries)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Review Imported Career History
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {entries.length} position{entries.length !== 1 ? 's' : ''} found.
            Uncheck any you don't want to import.
          </p>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {entries.map((entry, index) => (
            <div
              key={index}
              className={`border rounded-xl p-4 transition-all ${
                entry.selected
                  ? 'border-blue-200 bg-blue-50/50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={entry.selected}
                  onChange={() => toggleEntry(index)}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editingIndex === index ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={entry.title}
                        onChange={(e) =>
                          updateEntry(index, { title: e.target.value })
                        }
                        placeholder="Job Title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={entry.companyName}
                        onChange={(e) =>
                          updateEntry(index, { companyName: e.target.value })
                        }
                        placeholder="Company"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={entry.location || ''}
                        onChange={(e) =>
                          updateEntry(index, { location: e.target.value || null })
                        }
                        placeholder="Location"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex gap-2">
                        <input
                          type="month"
                          value={entry.startDate || ''}
                          onChange={(e) =>
                            updateEntry(index, { startDate: e.target.value || null })
                          }
                          placeholder="Start Date"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="month"
                          value={entry.endDate || ''}
                          onChange={(e) =>
                            updateEntry(index, { endDate: e.target.value || null })
                          }
                          placeholder="End Date"
                          disabled={entry.isCurrent}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={entry.isCurrent}
                          onChange={(e) =>
                            updateEntry(index, {
                              isCurrent: e.target.checked,
                              endDate: e.target.checked ? null : entry.endDate,
                            })
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        Current position
                      </label>
                      <textarea
                        value={entry.description || ''}
                        onChange={(e) =>
                          updateEntry(index, { description: e.target.value || null })
                        }
                        placeholder="Description"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Done Editing
                      </button>
                    </div>
                  ) : (
                    /* View Mode */
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {entry.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {entry.companyName}
                            {entry.location && (
                              <span className="text-gray-400">
                                {' '}
                                | {entry.location}
                              </span>
                            )}
                          </p>
                        </div>
                        {entry.isCurrent && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateDisplay(entry.startDate)}
                        {(entry.startDate || entry.endDate || entry.isCurrent) &&
                          ' - '}
                        {entry.isCurrent
                          ? 'Present'
                          : formatDateDisplay(entry.endDate)}
                      </p>
                      {entry.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {entry.description}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingIndex(index)}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {selectedCount} of {entries.length} selected
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={loading || selectedCount === 0}
              className="px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              Import {selectedCount} Position{selectedCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
