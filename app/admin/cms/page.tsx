'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Page {
  id: string
  title: string
  slug: string
  isPublished: boolean
  isHomepage: boolean
  sections: any[]
  updatedAt: string
}

export default function CMSPagesPage() {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPageModal, setShowNewPageModal] = useState(false)
  const [newPage, setNewPage] = useState({
    title: '',
    slug: '',
    isPublished: false,
    isHomepage: false,
  })

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/cms/pages')
      const data = await response.json()
      if (data.pages) {
        setPages(data.pages)
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePage = async () => {
    try {
      const response = await fetch('/api/admin/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage),
      })

      const data = await response.json()
      if (data.success) {
        setShowNewPageModal(false)
        setNewPage({ title: '', slug: '', isPublished: false, isHomepage: false })
        fetchPages()
        router.push(`/admin/cms/editor/${data.page.id}`)
      } else {
        alert(data.error || 'Failed to create page')
      }
    } catch (error) {
      console.error('Create page error:', error)
      alert('Failed to create page')
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      const response = await fetch(`/api/admin/cms/pages/${pageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPages()
      } else {
        alert('Failed to delete page')
      }
    } catch (error) {
      console.error('Delete page error:', error)
      alert('Failed to delete page')
    }
  }

  const handleTogglePublish = async (page: Page) => {
    try {
      const response = await fetch(`/api/admin/cms/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: page.title,
          slug: page.slug,
          isPublished: !page.isPublished,
          isHomepage: page.isHomepage,
        }),
      })

      if (response.ok) {
        fetchPages()
      }
    } catch (error) {
      console.error('Toggle publish error:', error)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading pages...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pages & Content</h1>
          <p className="text-gray-600 mt-2">Manage your website pages and content</p>
        </div>
        <button
          onClick={() => setShowNewPageModal(true)}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Page
        </button>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sections</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No pages yet. Create your first page to get started.
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{page.title}</span>
                      {page.isHomepage && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                          Homepage
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">/{page.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{page.sections.length}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublish(page)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        page.isPublished
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/cms/editor/${page.id}`)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Page Modal */}
      {showNewPageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Page</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={newPage.title}
                  onChange={(e) => {
                    setNewPage({
                      ...newPage,
                      title: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="About Us"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="about-us"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPage.isHomepage}
                    onChange={(e) => setNewPage({ ...newPage, isHomepage: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Set as Homepage</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPage.isPublished}
                    onChange={(e) => setNewPage({ ...newPage, isPublished: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Publish immediately</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreatePage}
                disabled={!newPage.title || !newPage.slug}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Page
              </button>
              <button
                onClick={() => {
                  setShowNewPageModal(false)
                  setNewPage({ title: '', slug: '', isPublished: false, isHomepage: false })
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
