'use client'

import { useState, useEffect } from 'react'

const DEFAULT_TEMPLATE = `{firstName} {lastName} is great at {skills}.{companySection}{introRequestSection}`

const PLACEHOLDERS = [
  { name: '{firstName}', description: 'Referee first name' },
  { name: '{lastName}', description: 'Referee last name' },
  { name: '{skills}', description: 'Skills joined with "and"' },
  { name: '{companySection}', description: 'Auto-generated: " FirstName has worked at Company where they Achievement by Method."' },
  { name: '{introRequestSection}', description: 'Auto-generated: " They would really appreciate IntroRequest."' },
]

const SAMPLE_DATA = {
  firstName: 'Alex',
  lastName: 'Smith',
  skills: ['Python', 'Machine Learning'],
  companyName: 'TechCorp',
  achievement: 'increased revenue by 40%',
  achievementMethod: 'implementing AI-driven analytics',
  introRequest: 'an introduction to venture capital investors in the AI space',
}

export default function StatementTemplatePage() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTemplate()
  }, [])

  const fetchTemplate = async () => {
    try {
      const res = await fetch('/api/admin/statement-template')
      const data = await res.json()
      if (data.success) {
        setTemplate(data.template)
      }
    } catch (error) {
      console.error('Failed to fetch template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/statement-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template }),
      })

      const data = await res.json()
      if (data.success) {
        alert('Template saved successfully!')
      } else {
        alert('Failed to save template')
      }
    } catch (error) {
      console.error('Save template error:', error)
      alert('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Reset to default template? This will overwrite your current template.')) {
      setTemplate(DEFAULT_TEMPLATE)
    }
  }

  const insertPlaceholder = (placeholder: string) => {
    setTemplate(prev => prev + placeholder)
  }

  const buildPreview = () => {
    let result = template

    // Replace basic placeholders
    result = result.replace(/{firstName}/g, SAMPLE_DATA.firstName)
    result = result.replace(/{lastName}/g, SAMPLE_DATA.lastName)
    result = result.replace(/{skills}/g, SAMPLE_DATA.skills.join(' and '))

    // Build company section
    let companySection = ''
    if (SAMPLE_DATA.companyName) {
      if (SAMPLE_DATA.achievement && SAMPLE_DATA.achievementMethod) {
        companySection = ` ${SAMPLE_DATA.firstName} has worked at ${SAMPLE_DATA.companyName} where they ${SAMPLE_DATA.achievement} by ${SAMPLE_DATA.achievementMethod}.`
      } else if (SAMPLE_DATA.achievement) {
        companySection = ` ${SAMPLE_DATA.firstName} has worked at ${SAMPLE_DATA.companyName} where they ${SAMPLE_DATA.achievement}.`
      } else {
        companySection = ` ${SAMPLE_DATA.firstName} has worked at ${SAMPLE_DATA.companyName}.`
      }
    }
    result = result.replace(/{companySection}/g, companySection)

    // Build intro request section
    let introRequestSection = ''
    if (SAMPLE_DATA.introRequest) {
      introRequestSection = ` They would really appreciate ${SAMPLE_DATA.introRequest}.`
    }
    result = result.replace(/{introRequestSection}/g, introRequestSection)

    return result
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading template...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Statement Summary Template</h1>
        <p className="text-gray-600 mt-2">
          Customize how referee statements are built throughout the application
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Editor</h2>

        {/* Placeholders */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Placeholders</h3>
          <div className="space-y-2 mb-4">
            {PLACEHOLDERS.map((p) => (
              <div key={p.name} className="flex items-start gap-3">
                <button
                  onClick={() => insertPlaceholder(p.name)}
                  className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-mono rounded hover:bg-purple-200 transition-colors shrink-0"
                >
                  {p.name}
                </button>
                <p className="text-sm text-gray-600">{p.description}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Click a placeholder to insert it into your template at the end, or type it manually.
          </p>
        </div>

        {/* Template Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Template
          </label>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter your template with placeholders..."
          />
        </div>

        {/* Preview */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-800">{buildPreview()}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Preview uses sample data: {SAMPLE_DATA.firstName} {SAMPLE_DATA.lastName}, skills: {SAMPLE_DATA.skills.join(', ')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving || !template}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset to Default
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">How it works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>Use placeholders like <code className="bg-blue-100 px-1 rounded">{'{firstName}'}</code> to insert dynamic values</li>
          <li><code className="bg-blue-100 px-1 rounded">{'{companySection}'}</code> and <code className="bg-blue-100 px-1 rounded">{'{introRequestSection}'}</code> are automatically built from multiple fields</li>
          <li>These sections only appear if the referee has filled in the relevant fields</li>
          <li>The template is used in emails, pages, and everywhere referee statements are displayed</li>
        </ul>
      </div>
    </div>
  )
}
