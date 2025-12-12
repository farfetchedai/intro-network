'use client'

import { useEffect, useState, useRef } from 'react'

type TemplateType = 'FIRST_DEGREE_REQUEST' | 'REFERRAL_REQUEST' | 'APPROVAL_NOTIFICATION_TO_REFEREE' | 'APPROVAL_NOTIFICATION_TO_FIRST_DEGREE' | 'APPROVAL_NOTIFICATION_TO_REFERRAL'
type MessageChannel = 'EMAIL' | 'SMS'

interface Template {
  id: string
  templateType: TemplateType
  messageChannel: MessageChannel
  subject?: string
  bodyHtml?: string
  bodySms?: string
  isActive: boolean
}

const TEMPLATE_TYPES: { value: TemplateType; label: string; description: string }[] = [
  {
    value: 'FIRST_DEGREE_REQUEST',
    label: 'First Degree Request',
    description: 'Sent to 1st degree contacts asking them to help with introductions'
  },
  {
    value: 'REFERRAL_REQUEST',
    label: 'Referral Request',
    description: 'Sent to potential referrals via 1st degree contacts'
  },
  {
    value: 'APPROVAL_NOTIFICATION_TO_REFEREE',
    label: 'Approval Notification to Referee',
    description: 'Sent to Referee when referral approves the introduction'
  },
  {
    value: 'APPROVAL_NOTIFICATION_TO_FIRST_DEGREE',
    label: 'Approval Notification to First Degree',
    description: 'Sent to First Degree contact when referral approves'
  },
  {
    value: 'APPROVAL_NOTIFICATION_TO_REFERRAL',
    label: 'Approval Notification to Referral',
    description: 'Sent to Referral after they approve the introduction'
  },
]

const DEFAULT_TEMPLATES = {
  FIRST_DEGREE_REQUEST: {
    EMAIL: {
      subject: '{refereeFirstName} needs your help with introductions',
      bodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333; margin-bottom: 16px;">Hi {contactFirstName}!</h2>
  <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
    <strong>{refereeFirstName} {refereeLastName}</strong> is looking for introductions and thought you might be able to help.
  </p>
  <div style="background: #F3F4F6; border-left: 4px solid #3B82F6; padding: 16px; margin: 20px 0; border-radius: 4px;">
    <p style="color: #333; margin: 0; font-style: italic;">"{statementSummary}"</p>
  </div>
  <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
    Click the button below to see who they're looking to connect with and share any connections you might have.
  </p>
  <a href="{link}" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
    Review Request
  </a>
  <p style="color: #999; font-size: 12px; margin-top: 30px;">
    You received this because {refereeFirstName} added you as a trusted connection.
  </p>
</div>`,
    },
    SMS: {
      bodySms: 'Hi {contactFirstName}! {refereeFirstName} {refereeLastName} needs your help with introductions. Review: {link}'
    }
  },
  REFERRAL_REQUEST: {
    EMAIL: {
      subject: '{firstDegreeFirstName} wants to introduce you to {refereeFirstName}',
      bodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333; margin-bottom: 16px;">Hi {referralFirstName}!</h2>
  <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
    <strong>{firstDegreeFirstName} {firstDegreeLastName}</strong> thought you might be interested in connecting with <strong>{refereeFirstName} {refereeLastName}</strong>.
  </p>
  <div style="background: #F3F4F6; border-left: 4px solid #8B5CF6; padding: 16px; margin: 20px 0; border-radius: 4px;">
    <p style="color: #333; margin: 0; font-style: italic;">"{statementSummary}"</p>
  </div>
  <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
    Click below to learn more and decide if you'd like to connect.
  </p>
  <a href="{link}" style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
    View Introduction
  </a>
  <p style="color: #999; font-size: 12px; margin-top: 30px;">
    This introduction was facilitated through our network platform.
  </p>
</div>`,
    },
    SMS: {
      bodySms: 'Hi {referralFirstName}! {firstDegreeFirstName} wants to introduce you to {refereeFirstName}. Learn more: {link}'
    }
  },
  APPROVAL_NOTIFICATION_TO_REFEREE: {
    EMAIL: {
      subject: 'Successful Intro!',
      bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
    <h2 style="margin: 0;">Successful Intro!</h2>
  </div>
  <h2>Great news, {refereeFirstName}!</h2>
  <p>{referralFirstName} {referralLastName} has approved the introduction request.</p>
  <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
    <h3 style="margin-top: 0; color: #065f46;">Contact Information:</h3>
    <p style="margin: 0; font-size: 16px;">{referralEmail}<br>{referralPhone}</p>
  </div>
  <p>Feel free to reach out to {referralFirstName} directly to continue the conversation!</p>
  <p style="color: #666; font-size: 14px; margin-top: 30px;">
    This notification was sent through the Intro Network platform.
  </p>
</div>`,
    },
    SMS: {
      bodySms: 'Great news {refereeFirstName}! {referralFirstName} approved your intro request. Contact: {referralEmail}'
    }
  },
  APPROVAL_NOTIFICATION_TO_FIRST_DEGREE: {
    EMAIL: {
      subject: 'Successful Intro!',
      bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
    <h2 style="margin: 0;">Successful Intro!</h2>
  </div>
  <h2>Great news, {firstDegreeFirstName}!</h2>
  <p>{referralFirstName} {referralLastName} has approved the introduction to {refereeFirstName} {refereeLastName}.</p>
  <p>Thank you for facilitating this connection! The introduction has been successfully completed.</p>
  <p style="color: #666; font-size: 14px; margin-top: 30px;">
    This notification was sent through the Intro Network platform.
  </p>
</div>`,
    },
    SMS: {
      bodySms: 'Great news {firstDegreeFirstName}! {referralFirstName} approved the intro to {refereeFirstName}. Thanks for helping!'
    }
  },
  APPROVAL_NOTIFICATION_TO_REFERRAL: {
    EMAIL: {
      subject: 'Introduction Accepted!',
      bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
    <h2 style="margin: 0;">Introduction Accepted!</h2>
  </div>
  <h2>Thank you, {referralFirstName}!</h2>
  <p>You have accepted the introduction to {refereeFirstName} {refereeLastName}.</p>
  <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
    <h3 style="margin-top: 0; color: #065f46;">Contact Information for {refereeFirstName} {refereeLastName}:</h3>
    <p style="margin: 0; font-size: 16px;">{refereeEmail}<br>{refereePhone}</p>
  </div>
  <p>Feel free to reach out to {refereeFirstName} directly to continue the conversation!</p>
  <p style="color: #666; font-size: 14px; margin-top: 30px;">
    This notification was sent through the Intro Network platform.
  </p>
</div>`,
    },
    SMS: {
      bodySms: 'Thank you {referralFirstName}! You accepted the intro to {refereeFirstName}. Contact: {refereeEmail}'
    }
  },
}

export default function MessageTemplatesPage() {
  const [activeTab, setActiveTab] = useState<MessageChannel>('EMAIL')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('FIRST_DEGREE_REQUEST')
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Current template being edited
  const [subject, setSubject] = useState('')
  const [bodyHtml, setBodyHtml] = useState('')
  const [bodySms, setBodySms] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    // Load the selected template
    const template = templates.find(
      t => t.templateType === selectedTemplate && t.messageChannel === activeTab
    )

    if (template) {
      setSubject(template.subject || '')
      setBodyHtml(template.bodyHtml || '')
      setBodySms(template.bodySms || '')
    } else {
      // Load default template
      loadDefaultTemplate()
    }
  }, [selectedTemplate, activeTab, templates])

  const loadDefaultTemplate = () => {
    const defaults = DEFAULT_TEMPLATES[selectedTemplate][activeTab]
    if (activeTab === 'EMAIL') {
      setSubject(defaults.subject || '')
      setBodyHtml(defaults.bodyHtml || '')
    } else {
      setBodySms(defaults.bodySms || '')
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/message-templates')
      const data = await response.json()
      if (data.success && data.templates) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/message-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: selectedTemplate,
          messageChannel: activeTab,
          subject: activeTab === 'EMAIL' ? subject : undefined,
          bodyHtml: activeTab === 'EMAIL' ? bodyHtml : undefined,
          bodySms: activeTab === 'SMS' ? bodySms : undefined,
          isActive: true,
        }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchTemplates()
        alert('Template saved successfully!')
      } else {
        alert(`Failed to save template: ${data.error}`)
      }
    } catch (error) {
      console.error('Save template error:', error)
      alert('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Convert image to base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      const imgTag = `<img src="${base64}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`

      // Insert at cursor position or append
      setBodyHtml(prevHtml => prevHtml + '\n' + imgTag)
    }
    reader.readAsDataURL(file)
  }

  const getPersonalizationTokens = () => {
    switch (selectedTemplate) {
      case 'FIRST_DEGREE_REQUEST':
        return [
          '{contactName}',
          '{contactFirstName}',
          '{contactLastName}',
          '{firstName}',
          '{refereeFirstName}',
          '{refereeLastName}',
          '{statementSummary}',
          '{link}'
        ]
      case 'REFERRAL_REQUEST':
        return [
          '{contactName}',
          '{refereeFirstName}',
          '{refereeLastName}',
          '{firstName}',
          '{firstDegreeFirstName}',
          '{firstDegreeLastName}',
          '{referralFirstName}',
          '{referralLastName}',
          '{statementSummary}',
          '{link}'
        ]
      case 'APPROVAL_NOTIFICATION_TO_REFEREE':
        return [
          '{refereeFirstName}',
          '{refereeLastName}',
          '{referralFirstName}',
          '{referralLastName}',
          '{referralEmail}',
          '{referralPhone}'
        ]
      case 'APPROVAL_NOTIFICATION_TO_FIRST_DEGREE':
        return [
          '{firstDegreeFirstName}',
          '{firstDegreeLastName}',
          '{refereeFirstName}',
          '{refereeLastName}',
          '{referralFirstName}',
          '{referralLastName}'
        ]
      case 'APPROVAL_NOTIFICATION_TO_REFERRAL':
        return [
          '{referralFirstName}',
          '{referralLastName}',
          '{refereeFirstName}',
          '{refereeLastName}',
          '{refereeEmail}',
          '{refereePhone}'
        ]
      default:
        return ['{contactName}', '{firstName}', '{statementSummary}']
    }
  }

  const insertToken = (token: string) => {
    if (activeTab === 'EMAIL') {
      if (document.activeElement?.id === 'subject-input') {
        setSubject(prev => prev + token)
      } else {
        setBodyHtml(prev => prev + token)
      }
    } else {
      setBodySms(prev => prev + token)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading templates...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Message Templates</h1>
        <p className="text-gray-600 mt-2">Customize email and SMS templates for each user flow</p>
      </div>

      {/* Template Type Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Template Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedTemplate(type.value)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedTemplate === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <p className="font-semibold text-gray-900">{type.label}</p>
              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('EMAIL')}
              className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'EMAIL'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Email Template
            </button>
            <button
              onClick={() => setActiveTab('SMS')}
              className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'SMS'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              SMS Template
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Personalization Tokens */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Variables</h3>
            <div className="flex flex-wrap gap-2">
              {getPersonalizationTokens().map((token) => (
                <button
                  key={token}
                  onClick={() => insertToken(token)}
                  className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-mono rounded hover:bg-purple-200 transition-colors"
                >
                  {token}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click a variable to insert it into your template. It will be replaced with actual values when sent.
            </p>
          </div>

          {activeTab === 'EMAIL' ? (
            <>
              {/* Subject Line */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject Line
                </label>
                <input
                  id="subject-input"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email subject..."
                />
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
                >
                  Upload Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Images will be embedded as base64 data URLs
                </p>
              </div>

              {/* HTML Editor with Preview */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Body (HTML with CSS)
                  </label>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* HTML Editor */}
                  <div>
                    <textarea
                      value={bodyHtml}
                      onChange={(e) => setBodyHtml(e.target.value)}
                      className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="Enter HTML content with inline CSS..."
                    />
                  </div>

                  {/* Preview Pane */}
                  {showPreview && (
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                        <p className="text-sm font-semibold text-gray-700">Email Preview</p>
                      </div>
                      <div
                        className="h-[348px] overflow-auto p-4 bg-white"
                        dangerouslySetInnerHTML={{ __html: bodyHtml }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* SMS Editor */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Body (Plain Text)
                </label>
                <textarea
                  value={bodySms}
                  onChange={(e) => setBodySms(e.target.value)}
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter SMS message (160 characters recommended)..."
                  maxLength={320}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {bodySms.length} / 320 characters (messages over 160 characters may be split)
                </p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Template'}
            </button>
            <button
              onClick={loadDefaultTemplate}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
