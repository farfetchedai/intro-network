'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Element {
  id: string
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'image' | 'button' | 'html' | 'li'
  content: string
  order: number
  url?: string // For buttons/links
  mobileContent?: string // For mobile-specific images
}

interface Column {
  id: string
  align: 'left' | 'center' | 'right'
  classes: string
  elements: Element[]
}

interface SectionContent {
  columns: Column[]
}

interface Section {
  id: string
  order: number
  sectionId?: string | null
  isFullWidth: boolean
  columns: number
  content: string // JSON string
}

interface Page {
  id: string
  title: string
  slug: string
  isPublished: boolean
  isHomepage: boolean
  sections: Section[]
}

export default function CMSEditorPage() {
  const router = useRouter()
  const params = useParams()
  const pageId = params.pageId as string

  const [page, setPage] = useState<Page | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  useEffect(() => {
    fetchPage()
  }, [pageId])

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/admin/cms/pages/${pageId}`)
      const data = await response.json()
      if (data.page) {
        setPage(data.page)
        setSections(data.page.sections || [])
        if (data.page.sections?.length > 0) {
          setExpandedSection(data.page.sections[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch page:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSection = async () => {
    const newOrder = sections.length
    const defaultContent: SectionContent = {
      columns: [
        {
          id: crypto.randomUUID(),
          align: 'left',
          classes: '',
          elements: [],
        },
      ],
    }

    try {
      const response = await fetch(`/api/admin/cms/pages/${pageId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: newOrder,
          isFullWidth: false,
          columns: 1,
          content: JSON.stringify(defaultContent),
        }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchPage()
        setExpandedSection(data.section.id)
      }
    } catch (error) {
      console.error('Failed to add section:', error)
    }
  }

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    // Update local state only
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    )
    setHasUnsavedChanges(true)
    setSaveSuccess(false)
  }

  const saveAllChanges = async () => {
    setSaving(true)
    setSaveSuccess(false)
    try {
      // Save all section updates
      for (const section of sections) {
        await fetch(`/api/admin/cms/pages/${pageId}/sections/${section.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: section.order,
            sectionId: section.sectionId,
            isFullWidth: section.isFullWidth,
            columns: section.columns,
            content: section.content,
          }),
        })
      }

      setHasUnsavedChanges(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save changes:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return

    try {
      const response = await fetch(
        `/api/admin/cms/pages/${pageId}/sections/${sectionId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        await fetchPage()
      }
    } catch (error) {
      console.error('Failed to delete section:', error)
    }
  }

  const moveSectionUp = async (index: number) => {
    if (index === 0) return
    const newSections = [...sections]
    ;[newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ]

    // Update order property
    const updates = newSections.map((s, i) => ({ id: s.id, order: i }))

    try {
      const response = await fetch(`/api/admin/cms/pages/${pageId}/sections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: updates }),
      })

      if (response.ok) {
        await fetchPage()
      }
    } catch (error) {
      console.error('Failed to reorder sections:', error)
    }
  }

  const moveSectionDown = async (index: number) => {
    if (index === sections.length - 1) return
    const newSections = [...sections]
    ;[newSections[index], newSections[index + 1]] = [
      newSections[index + 1],
      newSections[index],
    ]

    const updates = newSections.map((s, i) => ({ id: s.id, order: i }))

    try {
      const response = await fetch(`/api/admin/cms/pages/${pageId}/sections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: updates }),
      })

      if (response.ok) {
        await fetchPage()
      }
    } catch (error) {
      console.error('Failed to reorder sections:', error)
    }
  }

  const updateSectionContent = (
    sectionId: string,
    content: SectionContent
  ) => {
    updateSection(sectionId, { content: JSON.stringify(content) })
  }

  const updateSectionColumns = (sectionId: string, columnCount: number) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const currentContent: SectionContent = JSON.parse(section.content)
    const newColumns: Column[] = []

    // Keep existing columns or create new ones
    for (let i = 0; i < columnCount; i++) {
      if (i < currentContent.columns.length) {
        newColumns.push(currentContent.columns[i])
      } else {
        newColumns.push({
          id: crypto.randomUUID(),
          align: 'left',
          classes: '',
          elements: [],
        })
      }
    }

    updateSection(sectionId, {
      columns: columnCount,
      content: JSON.stringify({ columns: newColumns }),
    })
  }

  const addElement = (sectionId: string, columnIndex: number, type: Element['type']) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const content: SectionContent = JSON.parse(section.content)
    const column = content.columns[columnIndex]

    const newElement: Element = {
      id: crypto.randomUUID(),
      type,
      content: type === 'image' ? '' : type === 'html' ? '<div>\n  <!-- Your HTML here -->\n</div>' : type === 'li' ? 'List item text' : `New ${type}`,
      order: column.elements.length,
      url: type === 'button' ? '#' : undefined,
    }

    column.elements.push(newElement)
    updateSectionContent(sectionId, content)
  }

  const updateElement = (
    sectionId: string,
    columnIndex: number,
    elementId: string,
    updates: Partial<Element>
  ) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const content: SectionContent = JSON.parse(section.content)
    const element = content.columns[columnIndex].elements.find(
      (e) => e.id === elementId
    )

    if (element) {
      Object.assign(element, updates)
      updateSectionContent(sectionId, content)
    }
  }

  const deleteElement = (
    sectionId: string,
    columnIndex: number,
    elementId: string
  ) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const content: SectionContent = JSON.parse(section.content)
    content.columns[columnIndex].elements = content.columns[
      columnIndex
    ].elements.filter((e) => e.id !== elementId)

    // Reorder remaining elements
    content.columns[columnIndex].elements.forEach((e, i) => {
      e.order = i
    })

    updateSectionContent(sectionId, content)
  }

  const moveElement = (
    sectionId: string,
    columnIndex: number,
    elementIndex: number,
    direction: 'up' | 'down'
  ) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const content: SectionContent = JSON.parse(section.content)
    const elements = content.columns[columnIndex].elements

    if (direction === 'up' && elementIndex === 0) return
    if (direction === 'down' && elementIndex === elements.length - 1) return

    const newIndex = direction === 'up' ? elementIndex - 1 : elementIndex + 1
    ;[elements[elementIndex], elements[newIndex]] = [
      elements[newIndex],
      elements[elementIndex],
    ]

    // Update order property
    elements.forEach((e, i) => {
      e.order = i
    })

    updateSectionContent(sectionId, content)
  }

  const updateColumnAlign = (
    sectionId: string,
    columnIndex: number,
    align: Column['align']
  ) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const content: SectionContent = JSON.parse(section.content)
    content.columns[columnIndex].align = align
    updateSectionContent(sectionId, content)
  }

  const updateColumnClasses = (
    sectionId: string,
    columnIndex: number,
    classes: string
  ) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const content: SectionContent = JSON.parse(section.content)
    content.columns[columnIndex].classes = classes
    updateSectionContent(sectionId, content)
  }

  const handleImageUpload = async (
    sectionId: string,
    columnIndex: number,
    elementId: string,
    file: File,
    field: 'content' | 'mobileContent' = 'content'
  ) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      updateElement(sectionId, columnIndex, elementId, { [field]: base64 })
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading page...</div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Page not found</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Page: {page.title}
          </h1>
          <p className="text-gray-600 mt-2">/{page.slug}</p>
          {hasUnsavedChanges && (
            <p className="text-amber-600 text-sm mt-1">You have unsaved changes</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/admin/cms')}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Pages
          </button>
          <button
            onClick={addSection}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Section
          </button>
          <button
            onClick={saveAllChanges}
            disabled={!hasUnsavedChanges || saving}
            className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
              hasUnsavedChanges && !saving
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
          <span>✓</span>
          <span>Changes saved successfully!</span>
        </div>
      )}

      {sections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">
            No sections yet. Add your first section to get started.
          </p>
          <button
            onClick={addSection}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Section
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => {
            const content: SectionContent = JSON.parse(section.content)

            return (
              <div
                key={section.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Section Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === section.id ? null : section.id
                        )
                      }
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedSection === section.id ? '▼' : '▶'}
                    </button>
                    <span className="font-semibold text-gray-900">
                      Section {sectionIndex + 1}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({section.columns} column{section.columns !== 1 ? 's' : ''},{' '}
                      {section.isFullWidth ? 'full-width' : 'container'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveSectionUp(sectionIndex)}
                      disabled={sectionIndex === 0}
                      className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSectionDown(sectionIndex)}
                      disabled={sectionIndex === sections.length - 1}
                      className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Section Content (when expanded) */}
                {expandedSection === section.id && (
                  <div className="p-6 space-y-6">
                    {/* Section Settings */}
                    <div className="grid grid-cols-3 gap-4 pb-6 border-b border-gray-200">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Section ID
                        </label>
                        <input
                          type="text"
                          value={section.sectionId || ''}
                          onChange={(e) =>
                            updateSection(section.id, {
                              sectionId: e.target.value || null,
                            })
                          }
                          placeholder="e.g., #hero-section"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">For anchor link scrolling</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Layout Width
                        </label>
                        <select
                          value={section.isFullWidth ? 'full' : 'container'}
                          onChange={(e) =>
                            updateSection(section.id, {
                              isFullWidth: e.target.value === 'full',
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="container">Container</option>
                          <option value="full">Full Width</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Number of Columns
                        </label>
                        <select
                          value={section.columns}
                          onChange={(e) =>
                            updateSectionColumns(
                              section.id,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="1">1 Column</option>
                          <option value="2">2 Columns</option>
                          <option value="3">3 Columns</option>
                        </select>
                      </div>
                    </div>

                    {/* Columns */}
                    <div
                      className={`grid gap-6 ${
                        section.columns === 1
                          ? 'grid-cols-1'
                          : section.columns === 2
                          ? 'grid-cols-2'
                          : 'grid-cols-3'
                      }`}
                    >
                      {content.columns.map((column, columnIndex) => (
                        <div
                          key={column.id}
                          className="border-2 border-gray-200 rounded-lg p-4"
                        >
                          <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 mb-3">
                              Column {columnIndex + 1}
                            </h3>

                            {/* Column Alignment */}
                            <div className="mb-3">
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Alignment
                              </label>
                              <select
                                value={column.align}
                                onChange={(e) =>
                                  updateColumnAlign(
                                    section.id,
                                    columnIndex,
                                    e.target.value as Column['align']
                                  )
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                            </div>

                            {/* Column Classes */}
                            <div className="mb-3">
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                CSS Classes
                              </label>
                              <input
                                type="text"
                                value={column.classes}
                                onChange={(e) =>
                                  updateColumnClasses(
                                    section.id,
                                    columnIndex,
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., bg-blue-50 p-4"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                              />
                            </div>

                            {/* Add Element Buttons */}
                            <div className="mb-3">
                              <label className="block text-xs font-semibold text-gray-700 mb-2">
                                Add Element
                              </label>
                              <div className="flex flex-wrap gap-1">
                                <button
                                  onClick={() =>
                                    addElement(section.id, columnIndex, 'h1')
                                  }
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-900"
                                >
                                  H1
                                </button>
                                <button
                                  onClick={() =>
                                    addElement(section.id, columnIndex, 'h2')
                                  }
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-900"
                                >
                                  H2
                                </button>
                                <button
                                  onClick={() =>
                                    addElement(section.id, columnIndex, 'h3')
                                  }
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-900"
                                >
                                  H3
                                </button>
                                <button
                                  onClick={() =>
                                    addElement(section.id, columnIndex, 'h4')
                                  }
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-900"
                                >
                                  H4
                                </button>
                                <button
                                  onClick={() =>
                                    addElement(section.id, columnIndex, 'p')
                                  }
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-900"
                                >
                                  Text
                                </button>
                                <button
                                  onClick={() =>
                                    addElement(section.id, columnIndex, 'image')
                                  }
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-900"
                                >
                                  Image
                                </button>
                                <button
                                  onClick={() =>
                                    addElement(section.id, columnIndex, 'button')
                                  }
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-900"
                                >
                                  Button
                                </button>
                                <button
                                  onClick={() =>
                                    addElement(section.id, columnIndex, 'html')
                                  }
                                  className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 rounded text-purple-900"
                                >
                                  HTML
                                </button>
                                <button
                                  onClick={() =>
                                    addElement(section.id, columnIndex, 'li')
                                  }
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-900"
                                >
                                  List Item
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Elements */}
                          <div className="space-y-3">
                            {column.elements
                              .sort((a, b) => a.order - b.order)
                              .map((element, elementIndex) => (
                                <div
                                  key={element.id}
                                  className="bg-gray-50 border border-gray-200 rounded p-3"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-600 uppercase">
                                      {element.type}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() =>
                                          moveElement(
                                            section.id,
                                            columnIndex,
                                            elementIndex,
                                            'up'
                                          )
                                        }
                                        disabled={elementIndex === 0}
                                        className="px-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-30"
                                      >
                                        ↑
                                      </button>
                                      <button
                                        onClick={() =>
                                          moveElement(
                                            section.id,
                                            columnIndex,
                                            elementIndex,
                                            'down'
                                          )
                                        }
                                        disabled={
                                          elementIndex ===
                                          column.elements.length - 1
                                        }
                                        className="px-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-30"
                                      >
                                        ↓
                                      </button>
                                      <button
                                        onClick={() =>
                                          deleteElement(
                                            section.id,
                                            columnIndex,
                                            element.id
                                          )
                                        }
                                        className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>

                                  {element.type === 'html' ? (
                                    <div>
                                      <textarea
                                        value={element.content}
                                        onChange={(e) =>
                                          updateElement(
                                            section.id,
                                            columnIndex,
                                            element.id,
                                            { content: e.target.value }
                                          )
                                        }
                                        rows={6}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-y font-mono text-gray-900 bg-gray-50"
                                        placeholder="<div>Your HTML here</div>"
                                      />
                                      <p className="text-xs text-purple-600 mt-1">Raw HTML - will be rendered as-is</p>
                                    </div>
                                  ) : element.type === 'image' ? (
                                    <div className="space-y-3">
                                      {/* Desktop Image */}
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          Desktop Image
                                        </label>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                              handleImageUpload(
                                                section.id,
                                                columnIndex,
                                                element.id,
                                                file,
                                                'content'
                                              )
                                            }
                                          }}
                                          className="w-full text-xs mb-1"
                                        />
                                        {element.content && (
                                          <img
                                            src={element.content}
                                            alt="Desktop preview"
                                            className="w-full h-auto rounded border border-gray-200"
                                          />
                                        )}
                                      </div>

                                      {/* Mobile Image (Optional) */}
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          Mobile Image <span className="text-gray-400">(optional)</span>
                                        </label>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                              handleImageUpload(
                                                section.id,
                                                columnIndex,
                                                element.id,
                                                file,
                                                'mobileContent'
                                              )
                                            }
                                          }}
                                          className="w-full text-xs mb-1"
                                        />
                                        {element.mobileContent ? (
                                          <div className="relative">
                                            <img
                                              src={element.mobileContent}
                                              alt="Mobile preview"
                                              className="w-full h-auto rounded border border-gray-200"
                                            />
                                            <button
                                              onClick={() =>
                                                updateElement(
                                                  section.id,
                                                  columnIndex,
                                                  element.id,
                                                  { mobileContent: undefined }
                                                )
                                              }
                                              className="absolute top-1 right-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        ) : (
                                          <p className="text-xs text-gray-400">
                                            If not set, desktop image will be used on mobile
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ) : element.type === 'button' ? (
                                    <div>
                                      <input
                                        type="text"
                                        value={element.content}
                                        onChange={(e) =>
                                          updateElement(
                                            section.id,
                                            columnIndex,
                                            element.id,
                                            { content: e.target.value }
                                          )
                                        }
                                        placeholder="Button text"
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2 text-gray-900"
                                      />
                                      <input
                                        type="text"
                                        value={element.url || ''}
                                        onChange={(e) =>
                                          updateElement(
                                            section.id,
                                            columnIndex,
                                            element.id,
                                            { url: e.target.value }
                                          )
                                        }
                                        placeholder="Button URL"
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                                      />
                                    </div>
                                  ) : (
                                    <textarea
                                      value={element.content}
                                      onChange={(e) =>
                                        updateElement(
                                          section.id,
                                          columnIndex,
                                          element.id,
                                          { content: e.target.value }
                                        )
                                      }
                                      rows={element.type === 'p' ? 3 : 1}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none text-gray-900"
                                    />
                                  )}
                                </div>
                              ))}

                            {column.elements.length === 0 && (
                              <p className="text-xs text-gray-400 text-center py-4">
                                No elements yet. Add elements using the buttons
                                above.
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
