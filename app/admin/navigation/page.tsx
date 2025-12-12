'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HeaderLink {
  label: string
  href: string
  scrollToId?: string
}

interface FooterSection {
  title: string
  links: { label: string; href: string }[]
}

export default function NavigationAdmin() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Navigation data
  const [headerLinks, setHeaderLinks] = useState<HeaderLink[]>([])
  const [footerLinks, setFooterLinks] = useState<FooterSection[]>([])
  const [tagline, setTagline] = useState('')
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    fetchNavigation()
  }, [])

  const fetchNavigation = async () => {
    try {
      const response = await fetch('/api/admin/navigation')
      const data = await response.json()

      if (data.navigation) {
        setHeaderLinks(data.navigation.headerLinks || [])
        setFooterLinks(data.navigation.footerLinks || [])
        setTagline(data.navigation.tagline || '')
        setCompanyName(data.navigation.companyName || '')
      }
    } catch (error) {
      console.error('Failed to fetch navigation:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveNavigation = async () => {
    setSaving(true)
    setSaveSuccess(false)

    try {
      const response = await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headerLinks,
          footerLinks,
          tagline,
          companyName,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save navigation')
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save navigation:', error)
      alert('Failed to save navigation. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Header link handlers
  const addHeaderLink = () => {
    setHeaderLinks([...headerLinks, { label: '', href: '', scrollToId: '' }])
  }

  const updateHeaderLink = (index: number, field: keyof HeaderLink, value: string) => {
    const updated = [...headerLinks]
    updated[index] = { ...updated[index], [field]: value }
    setHeaderLinks(updated)
  }

  const removeHeaderLink = (index: number) => {
    setHeaderLinks(headerLinks.filter((_, i) => i !== index))
  }

  const moveHeaderLink = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === headerLinks.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const updated = [...headerLinks]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    setHeaderLinks(updated)
  }

  // Footer link handlers
  const addFooterSection = () => {
    setFooterLinks([...footerLinks, { title: '', links: [] }])
  }

  const updateFooterSectionTitle = (index: number, title: string) => {
    const updated = [...footerLinks]
    updated[index].title = title
    setFooterLinks(updated)
  }

  const addFooterLink = (sectionIndex: number) => {
    const updated = [...footerLinks]
    updated[sectionIndex].links.push({ label: '', href: '' })
    setFooterLinks(updated)
  }

  const updateFooterLink = (
    sectionIndex: number,
    linkIndex: number,
    field: 'label' | 'href',
    value: string
  ) => {
    const updated = [...footerLinks]
    updated[sectionIndex].links[linkIndex][field] = value
    setFooterLinks(updated)
  }

  const removeFooterLink = (sectionIndex: number, linkIndex: number) => {
    const updated = [...footerLinks]
    updated[sectionIndex].links = updated[sectionIndex].links.filter((_, i) => i !== linkIndex)
    setFooterLinks(updated)
  }

  const removeFooterSection = (index: number) => {
    setFooterLinks(footerLinks.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Navigation Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage header and footer links and tagline
            </p>
          </div>
          <div className="flex items-center gap-4">
            {saveSuccess && (
              <span className="text-green-600 font-semibold">Saved successfully!</span>
            )}
            <button
              onClick={saveNavigation}
              disabled={saving}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                saving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Back to Admin
            </Link>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Footer Branding</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Intro Network"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Expand your professional network through trusted introductions"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Header Links */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Header Links</h2>
            <button
              onClick={addHeaderLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Link
            </button>
          </div>

          <div className="space-y-4">
            {headerLinks.map((link, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => moveHeaderLink(index, 'up')}
                    disabled={index === 0}
                    className={`px-2 py-1 rounded ${
                      index === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveHeaderLink(index, 'down')}
                    disabled={index === headerLinks.length - 1}
                    className={`px-2 py-1 rounded ${
                      index === headerLinks.length - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ↓
                  </button>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateHeaderLink(index, 'label', e.target.value)}
                    placeholder="Label (e.g., About)"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateHeaderLink(index, 'href', e.target.value)}
                    placeholder="URL (e.g., /about)"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={link.scrollToId || ''}
                    onChange={(e) => updateHeaderLink(index, 'scrollToId', e.target.value)}
                    placeholder="Scroll ID (optional, e.g., #section-1)"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => removeHeaderLink(index)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}

            {headerLinks.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No header links. Click "Add Link" to create one.
              </p>
            )}
          </div>
        </div>

        {/* Footer Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Footer Links</h2>
            <button
              onClick={addFooterSection}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Section
            </button>
          </div>

          <div className="space-y-6">
            {footerLinks.map((section, sectionIndex) => (
              <div key={sectionIndex} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateFooterSectionTitle(sectionIndex, e.target.value)
                    }
                    placeholder="Section Title (e.g., Product)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => addFooterLink(sectionIndex)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Link
                  </button>
                  <button
                    onClick={() => removeFooterSection(sectionIndex)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Remove Section
                  </button>
                </div>

                <div className="space-y-2 ml-8">
                  {section.links.map((link, linkIndex) => (
                    <div key={linkIndex} className="flex items-center gap-4">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) =>
                          updateFooterLink(sectionIndex, linkIndex, 'label', e.target.value)
                        }
                        placeholder="Link Label"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) =>
                          updateFooterLink(sectionIndex, linkIndex, 'href', e.target.value)
                        }
                        placeholder="URL"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeFooterLink(sectionIndex, linkIndex)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {section.links.length === 0 && (
                    <p className="text-gray-500 text-sm py-2">
                      No links in this section. Click "Add Link" to create one.
                    </p>
                  )}
                </div>
              </div>
            ))}

            {footerLinks.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No footer sections. Click "Add Section" to create one.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
