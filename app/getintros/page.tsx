'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import BottomProgressBar from '@/components/BottomProgressBar'

export default function GetIntrosPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState({ firstName: '', lastName: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Contact form
  const [contacts, setContacts] = useState<Array<{
    id?: string
    firstName: string
    lastName: string
    email: string
    phone: string
    company: string
  }>>([])

  // Track existing contacts from database
  const [existingContacts, setExistingContacts] = useState<Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    company: string
  }>>([])
  const [hasExistingContacts, setHasExistingContacts] = useState(false)

  // Email/SMS templates
  const [emailSubject, setEmailSubject] = useState('Introduction Request')
  const [emailTemplate, setEmailTemplate] = useState(
    "Hi [Contact Name],\n\nI hope this message finds you well. I'm reaching out because I'm looking to connect with people in your network who might be able to help me with [your goal].\n\nWould you be willing to make an introduction?\n\nThank you for considering this request.\n\nBest regards"
  )
  const [smsTemplate, setSmsTemplate] = useState(
    "Hi [Contact Name], I'm looking to connect with people in your network. Would you be willing to make an introduction? Thanks!"
  )

  // Preview state
  const [previewContactIndex, setPreviewContactIndex] = useState(0)

  // Track which contacts have been sent to
  const [sentContactIndices, setSentContactIndices] = useState<Set<number>>(new Set())

  // Branding settings
  const [brandingSettings, setBrandingSettings] = useState({
    flowAStep1Background: 'from-blue-400 via-purple-400 to-pink-400',
    flowAStep2Background: 'from-emerald-400 via-teal-400 to-cyan-400',
    flowAStep3Background: 'from-orange-400 via-rose-400 to-pink-400',
    flowAStep1FormBg: 'white',
    flowAStep2FormBg: 'white',
    flowAStep3FormBg: 'white',
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const authResponse = await fetch('/api/auth/me')
        console.log('[GetIntros] Auth response status:', authResponse.status)

        if (authResponse.ok) {
          const authData = await authResponse.json()
          console.log('[GetIntros] Auth data:', authData)

          if (authData.success && authData.user && authData.user.id) {
            console.log('[GetIntros] Setting userId:', authData.user.id)
            setUserId(authData.user.id)

            // Set user name from auth data
            if (authData.user.firstName && authData.user.lastName) {
              setUserName({
                firstName: authData.user.firstName,
                lastName: authData.user.lastName
              })
            }

            // Fetch existing contacts for this user
            fetch(`/api/contacts?userId=${authData.user.id}`)
              .then(res => res.json())
              .then(data => {
                if (data.contacts && data.contacts.length > 0) {
                  setExistingContacts(data.contacts)
                  setHasExistingContacts(true)
                }
              })
              .catch(err => console.error('Failed to fetch existing contacts:', err))
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }

      // Fetch branding settings
      fetch('/api/admin/branding')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.settings) {
            setBrandingSettings({
              flowAStep1Background: data.settings.flowAStep1Background || 'from-blue-400 via-purple-400 to-pink-400',
              flowAStep2Background: data.settings.flowAStep2Background || 'from-emerald-400 via-teal-400 to-cyan-400',
              flowAStep3Background: data.settings.flowAStep3Background || 'from-orange-400 via-rose-400 to-pink-400',
              flowAStep1FormBg: data.settings.flowAStep1FormBg || 'white',
              flowAStep2FormBg: data.settings.flowAStep2FormBg || 'white',
              flowAStep3FormBg: data.settings.flowAStep3FormBg || 'white',
            })
          }
        })
        .catch(err => console.error('Failed to fetch branding settings:', err))
        .finally(() => setIsLoading(false))
    }

    loadUserData()
  }, [])

  // Fetch message templates on mount
  useEffect(() => {
    // Fetch EMAIL template
    fetch('/api/admin/message-templates?templateType=FIRST_DEGREE_REQUEST&messageChannel=EMAIL')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.templates && data.templates.length > 0) {
          const template = data.templates[0]
          setEmailSubject(template.subject || 'Introduction Request')
          setEmailTemplate(template.bodyHtml || emailTemplate)
        }
      })
      .catch(err => console.error('Failed to fetch email template:', err))

    // Fetch SMS template
    fetch('/api/admin/message-templates?templateType=FIRST_DEGREE_REQUEST&messageChannel=SMS')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.templates && data.templates.length > 0) {
          const template = data.templates[0]
          setSmsTemplate(template.bodySms || smsTemplate)
        }
      })
      .catch(err => console.error('Failed to fetch SMS template:', err))
  }, [])

  const handleAddContact = () => {
    setContacts([
      ...contacts,
      { firstName: '', lastName: '', email: '', phone: '', company: '' },
    ])
  }

  const handleContactChange = (index: number, field: string, value: string) => {
    const newContacts = [...contacts]
    newContacts[index] = { ...newContacts[index], [field]: value }
    setContacts(newContacts)
  }

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index))
  }

  const handleLoadPreviousContacts = () => {
    if (existingContacts.length > 0) {
      setContacts(existingContacts.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email || '',
        phone: c.phone || '',
        company: c.company || '',
      })))
    }
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('[GetIntros] Submit - userId:', userId)

    if (!userId) {
      console.log('[GetIntros] No userId found, redirecting to /referee')
      alert('Please log in first')
      router.push('/referee')
      return
    }

    const validContacts = contacts.filter(
      (c) => c.firstName && c.lastName && (c.email || c.phone)
    )

    if (validContacts.length === 0) {
      alert('Please add at least one contact with name and email or phone')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, contacts: validContacts }),
      })

      const data = await response.json()

      if (data.success) {
        // Move to step 2
        setStep(2)
        setIsSubmitting(false)
      } else {
        alert(data.error || 'Failed to add contacts')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
      setIsSubmitting(false)
    }
  }

  // Helper to capitalize first letter
  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Generate preview subject with actual contact data substituted
  const getPreviewSubject = () => {
    if (contacts.length === 0 || !emailSubject) {
      return emailSubject
    }

    const contact = contacts[previewContactIndex] || contacts[0]

    // Replace template variables with actual values
    let previewSubject = emailSubject
      .replace(/\{contactName\}/g, `${contact.firstName} ${contact.lastName}`)
      .replace(/\{contactFirstName\}/g, contact.firstName)
      .replace(/\{contactLastName\}/g, contact.lastName)
      .replace(/\{firstName\}/g, userName.firstName)
      .replace(/\{refereeFirstName\}/g, userName.firstName)
      .replace(/\{refereeLastName\}/g, userName.lastName)

    return previewSubject
  }

  // Generate preview HTML with actual contact data substituted
  const getPreviewHtml = () => {
    if (contacts.length === 0 || !emailTemplate) {
      return emailTemplate
    }

    const contact = contacts[previewContactIndex] || contacts[0]

    // Replace template variables with actual values (capitalize first names)
    let previewHtml = emailTemplate
      .replace(/\{contactName\}/g, `${capitalizeFirstLetter(contact.firstName)} ${contact.lastName}`)
      .replace(/\{contactFirstName\}/g, capitalizeFirstLetter(contact.firstName))
      .replace(/\{contactLastName\}/g, contact.lastName)
      .replace(/\{firstName\}/g, userName.firstName)
      .replace(/\{refereeFirstName\}/g, userName.firstName)
      .replace(/\{refereeLastName\}/g, userName.lastName)

    return previewHtml
  }

  // Generate preview SMS with actual contact data substituted
  const getPreviewSms = () => {
    if (contacts.length === 0 || !smsTemplate) {
      return smsTemplate
    }

    const contact = contacts[previewContactIndex] || contacts[0]

    // Replace template variables with actual values (capitalize first names)
    let previewSms = smsTemplate
      .replace(/\{contactName\}/g, `${capitalizeFirstLetter(contact.firstName)} ${contact.lastName}`)
      .replace(/\{contactFirstName\}/g, capitalizeFirstLetter(contact.firstName))
      .replace(/\{contactLastName\}/g, contact.lastName)
      .replace(/\{firstName\}/g, userName.firstName)
      .replace(/\{refereeFirstName\}/g, userName.firstName)
      .replace(/\{refereeLastName\}/g, userName.lastName)

    return previewSms
  }

  const handleSendRequests = async (contactIndex?: number) => {
    setIsSubmitting(true)

    try {
      // Determine which contact(s) to send to
      let contactIds: string[]
      if (contactIndex !== undefined) {
        // Individual contact
        const contact = contacts[contactIndex]
        if (!contact.id) {
          alert('Contact ID not found. Please try again.')
          setIsSubmitting(false)
          return
        }
        contactIds = [contact.id]
      } else {
        // All contacts
        contactIds = contacts.filter(c => c.id).map(c => c.id!)
        if (contactIds.length === 0) {
          alert('No contacts found')
          setIsSubmitting(false)
          return
        }
      }

      // Send the requests via API
      const response = await fetch('/api/referee/send-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          contactIds,
          customMessage: emailTemplate,
          customSmsMessage: smsTemplate,
          emailSubject,
          sendViaEmail: true,
          sendViaSms: false,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (contactIndex !== undefined) {
          // Individual contact - mark as sent and stay on page
          setSentContactIndices(prev => new Set([...prev, contactIndex]))
          setIsSubmitting(false)
        } else {
          // "Ask Everyone" - navigate to success page
          setStep(3)
          setIsSubmitting(false)
        }
      } else {
        alert(data.error || 'Failed to send requests')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error sending requests:', error)
      alert('An error occurred')
      setIsSubmitting(false)
    }
  }

  const getStepBackgroundClass = () => {
    let bg = brandingSettings.flowAStep1Background
    if (step === 2) bg = brandingSettings.flowAStep2Background
    if (step === 3) bg = brandingSettings.flowAStep3Background

    if (bg.startsWith('#') || bg.startsWith('rgb')) {
      return ''
    }
    return bg
  }

  const getStepBackgroundStyle = () => {
    let bg = brandingSettings.flowAStep1Background
    if (step === 2) bg = brandingSettings.flowAStep2Background
    if (step === 3) bg = brandingSettings.flowAStep3Background

    if (bg.startsWith('#') || bg.startsWith('rgb')) {
      return { backgroundColor: bg }
    }
    return {}
  }

  const getFormBackgroundStyle = () => {
    let bg = brandingSettings.flowAStep1FormBg
    if (step === 2) bg = brandingSettings.flowAStep2FormBg
    if (step === 3) bg = brandingSettings.flowAStep3FormBg

    // If it's a Tailwind gradient class (contains "from-" etc), don't apply inline style
    if (bg.includes('from-') || bg.includes('to-') || bg.includes('via-')) {
      return {}
    }
    // Otherwise it's a color value (hex, rgb, or named color like "white")
    return { backgroundColor: bg }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div
      className={`flex-1 flex flex-col bg-gradient-to-br ${getStepBackgroundClass()}`}
      style={getStepBackgroundStyle()}
    >
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12" style={getFormBackgroundStyle()}>
            {/* Step 1: Add Contacts */}
            {step === 1 && (
              <>
                <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
                  Request Introductions
                </h2>
                <p className="text-gray-600 mb-8 text-center text-lg">
                  Who can help introduce you to people in their network?
                </p>

                {hasExistingContacts && contacts.length === 0 && (
                  <div className="mb-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-emerald-600 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            You have {existingContacts.length} saved contact{existingContacts.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-emerald-700 mt-0.5">
                            Load your previous contacts to continue where you left off
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleLoadPreviousContacts}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 text-sm whitespace-nowrap"
                      >
                        Load Previous Contacts
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleStep1Submit} className="space-y-6">
                  {contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-2xl p-6 bg-white"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={contact.firstName}
                            onChange={(e) =>
                              handleContactChange(index, 'firstName', e.target.value)
                            }
                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-[#191919] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={contact.lastName}
                            onChange={(e) =>
                              handleContactChange(index, 'lastName', e.target.value)
                            }
                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-[#191919] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) =>
                              handleContactChange(index, 'email', e.target.value)
                            }
                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-[#191919] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={contact.phone}
                            onChange={(e) =>
                              handleContactChange(index, 'phone', e.target.value)
                            }
                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-[#191919] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Company
                          </label>
                          <input
                            type="text"
                            value={contact.company}
                            onChange={(e) =>
                              handleContactChange(index, 'company', e.target.value)
                            }
                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-[#191919] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(index)}
                        className="text-red-600 text-sm font-semibold hover:text-red-700"
                      >
                        Remove Contact
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddContact}
                    className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-6 text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold text-lg"
                  >
                    + Add Contact
                  </button>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard')}
                      className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Saving...' : 'Craft Message'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 2: Review Templates */}
            {step === 2 && (
              <>
                <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
                  Craft Your Message
                </h2>
                <p className="text-gray-600 mb-8 text-center text-lg">
                  Review and customize your introduction request
                </p>

                <div className="space-y-6">
                  {/* Preview As Dropdown */}
                  {contacts.length > 0 && (
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                      <label className="text-sm font-semibold text-gray-700">
                        Preview message as:
                      </label>
                      <select
                        value={previewContactIndex}
                        onChange={(e) => setPreviewContactIndex(Number(e.target.value))}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                      >
                        {contacts.map((contact, index) => (
                          <option key={index} value={index}>
                            {contact.firstName} {contact.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Email Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Subject
                    </label>
                    <div className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50 text-[#191919]">
                      {getPreviewSubject()}
                    </div>
                  </div>

                  {/* Email Template */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Message
                    </label>
                    <div
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-[#191919] min-h-[200px]"
                      dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                    />
                  </div>

                  {/* SMS Template */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SMS Message
                    </label>
                    <div className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50">
                      <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-md p-4">
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">
                          {getPreviewSms()}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 text-right">
                          {getPreviewSms().length} characters
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contacts List */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Sending to ({contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'})
                    </label>
                    <div className="space-y-2">
                      {contacts.map((contact, index) => {
                        const isSent = sentContactIndices.has(index)
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {contact.firstName} {contact.lastName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {contact.email || contact.phone}
                                {contact.company && ` • ${contact.company}`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleSendRequests(index)}
                              disabled={isSubmitting || isSent}
                              className={`px-4 py-2 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center gap-2 ${
                                isSent
                                  ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                              }`}
                            >
                              {isSent ? (
                                <>
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Sent
                                </>
                              ) : (
                                'Ask Them'
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-4 pt-4">
                    <button
                      onClick={() => handleSendRequests()}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Ask Everyone'}
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      ← Back to Contacts
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <>
                <div className="text-center py-12">
                  <div className="mb-6">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <svg
                        className="w-12 h-12 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Request Sent Successfully!
                  </h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Your introduction requests have been sent to {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}.
                  </p>

                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-4 px-8 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <BottomProgressBar
        currentStep={step}
        totalSteps={3}
        stepName={
          step === 1
            ? 'Add people already in your network'
            : step === 2
            ? 'Craft the message to them'
            : 'Requests for introductions sent!'
        }
      />
    </div>
  )
}
