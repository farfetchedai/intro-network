'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import BottomProgressBar from '@/components/BottomProgressBar'

export default function GetIntrosPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState({ firstName: '', lastName: '', statementSummary: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Contact form - start with one empty row ready for input
  const [contacts, setContacts] = useState<Array<{
    id?: string
    firstName: string
    lastName: string
    email: string
    phone: string
    company: string
    linkedUser?: {
      id: string
      username: string | null
      profilePicture: string | null
      hasCompletedOnboarding: boolean
    } | null
  }>>([{ firstName: '', lastName: '', email: '', phone: '', company: '' }])

  // Track existing contacts from database
  const [existingContacts, setExistingContacts] = useState<Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    company: string
    linkedUser?: {
      id: string
      username: string | null
      profilePicture: string | null
      hasCompletedOnboarding: boolean
    } | null
  }>>([])
  const [hasExistingContacts, setHasExistingContacts] = useState(false)

  // Track connections (platform users who have connected)
  const [existingConnections, setExistingConnections] = useState<Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    username: string | null
    profilePicture: string | null
    companyName: string | null
  }>>([])
  const [hasExistingConnections, setHasExistingConnections] = useState(false)

  // Track if user has loaded their connections (to hide the Load Connections button)
  const [hasLoadedConnections, setHasLoadedConnections] = useState(false)

  // Email/SMS templates
  const [emailSubject, setEmailSubject] = useState('Introduction Request')
  const [emailTemplate, setEmailTemplate] = useState(
    "Hi {contactName},\n\nI hope this message finds you well. I'm reaching out because I'm looking to connect with people in your network who might be able to help me with my goals.\n\nWould you be willing to make an introduction?\n\nThank you for considering this request.\n\nBest regards,\n{firstName}"
  )
  const [smsTemplate, setSmsTemplate] = useState(
    "Hi {contactName}, I'm {firstName} and I'm looking to connect with people in your network. Would you be willing to make an introduction? Thanks!"
  )

  // Preview state
  const [previewContactIndex, setPreviewContactIndex] = useState(0)

  // Track which contacts have been sent to
  const [sentContactIndices, setSentContactIndices] = useState<Set<number>>(new Set())

  // Track which contacts are in edit mode (for editing email/phone)
  const [editingContactIndices, setEditingContactIndices] = useState<Set<number>>(new Set())

  // Modal state for template editing
  const [showEmailEditor, setShowEmailEditor] = useState(false)
  const [showSmsEditor, setShowSmsEditor] = useState(false)
  const [tempEmailTemplate, setTempEmailTemplate] = useState('')
  const [tempSmsTemplate, setTempSmsTemplate] = useState('')

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [sentCount, setSentCount] = useState(0)

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
                lastName: authData.user.lastName,
                statementSummary: authData.user.statementSummary || ''
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

            // Fetch connections (platform users who have connected with this user)
            fetch('/api/connections')
              .then(res => res.json())
              .then(data => {
                if (data.success && data.connections && data.connections.length > 0) {
                  setExistingConnections(data.connections)
                  setHasExistingConnections(true)
                }
              })
              .catch(err => console.error('Failed to fetch connections:', err))
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
    // Also remove from editing set if present
    setEditingContactIndices(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
  }

  const toggleEditContact = (index: number) => {
    setEditingContactIndices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // Check if a contact is a "loaded" contact (has data) vs empty new contact
  const isLoadedContact = (contact: typeof contacts[0]) => {
    return contact.firstName && contact.lastName
  }

  // Calculate deduplicated contact count (contacts that aren't already in connections)
  const getDeduplicatedContactCount = () => {
    const connectionUserIds = new Set(existingConnections.map(c => c.id))
    const connectionEmails = new Set(existingConnections.map(c => c.email?.toLowerCase()).filter(Boolean))
    const seenEmails = new Set<string>()

    let count = 0
    existingContacts.forEach(c => {
      // Skip if linked to a connection
      if (c.linkedUser?.id && connectionUserIds.has(c.linkedUser.id)) {
        return
      }
      // Skip if email matches a connection
      if (c.email && connectionEmails.has(c.email.toLowerCase())) {
        return
      }
      // Skip if duplicate email within contacts
      if (c.email && seenEmails.has(c.email.toLowerCase())) {
        return
      }
      if (c.email) {
        seenEmails.add(c.email.toLowerCase())
      }
      count++
    })
    return count
  }

  const handleLoadConnections = () => {
    const loadedContacts: typeof contacts = []

    // Track which user IDs and emails we've already added (to avoid duplicates)
    const addedUserIds = new Set<string>()
    const addedEmails = new Set<string>()

    // First, add all connections (platform users)
    existingConnections.forEach(conn => {
      addedUserIds.add(conn.id)
      if (conn.email) {
        addedEmails.add(conn.email.toLowerCase())
      }
      loadedContacts.push({
        firstName: conn.firstName,
        lastName: conn.lastName,
        email: conn.email || '',
        phone: '',
        company: conn.companyName || '',
        linkedUser: {
          id: conn.id,
          username: conn.username,
          profilePicture: conn.profilePicture,
          hasCompletedOnboarding: true,
        },
      })
    })

    // Then add contacts that aren't already in connections
    existingContacts.forEach(c => {
      // Skip if this contact is linked to a user we've already added
      if (c.linkedUser?.id && addedUserIds.has(c.linkedUser.id)) {
        return
      }

      // Skip if this contact has the same email as someone we've already added
      if (c.email && addedEmails.has(c.email.toLowerCase())) {
        return
      }

      // Track this email to avoid duplicates within contacts
      if (c.email) {
        addedEmails.add(c.email.toLowerCase())
      }

      loadedContacts.push({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email || '',
        phone: c.phone || '',
        company: c.company || '',
        linkedUser: c.linkedUser || null,
      })
    })

    if (loadedContacts.length > 0) {
      setContacts(loadedContacts)
    }
    setHasLoadedConnections(true)
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    console.log('[GetIntros] Submit - userId:', userId)

    if (!userId) {
      console.log('[GetIntros] No userId found, redirecting to /referee')
      setFormError('Please log in to continue.')
      setTimeout(() => router.push('/referee'), 2000)
      return
    }

    const validContacts = contacts.filter(
      (c) => c.firstName && c.lastName && (c.email || c.phone)
    )

    if (validContacts.length === 0) {
      setFormError('Please add at least one contact with a first name, last name, and either an email or phone number.')
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
        // Update contacts with the IDs from the database
        if (data.contacts && data.contacts.length > 0) {
          setContacts(data.contacts.map((c: any) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email || '',
            phone: c.phone || '',
            company: c.company || '',
            linkedUser: c.linkedUser || null,
          })))
        }
        // Move to step 2
        setStep(2)
        setIsSubmitting(false)
      } else {
        setFormError(data.error || 'Failed to save contacts. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setFormError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Helper to capitalize first letter
  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Parse template into segments (text and placeholders)
  type TemplateSegment = {
    type: 'text' | 'placeholder'
    content: string
    placeholder?: string // For placeholder type, the actual {key}
  }

  const parseTemplate = (template: string): TemplateSegment[] => {
    const segments: TemplateSegment[] = []
    const placeholderRegex = /\{[^}]+\}/g
    let lastIndex = 0
    let match

    while ((match = placeholderRegex.exec(template)) !== null) {
      // Add text before placeholder
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: template.substring(lastIndex, match.index)
        })
      }

      // Add placeholder
      segments.push({
        type: 'placeholder',
        content: match[0].replace(/[{}]/g, ''),
        placeholder: match[0]
      })

      lastIndex = placeholderRegex.lastIndex
    }

    // Add remaining text
    if (lastIndex < template.length) {
      segments.push({
        type: 'text',
        content: template.substring(lastIndex)
      })
    }

    return segments
  }

  // Reconstruct template from segments
  const reconstructTemplate = (segments: TemplateSegment[]): string => {
    return segments.map(seg =>
      seg.type === 'placeholder' ? seg.placeholder : seg.content
    ).join('')
  }

  // Modal handlers
  const openEmailEditor = () => {
    setTempEmailTemplate(emailTemplate)
    setShowEmailEditor(true)
  }

  const openSmsEditor = () => {
    setTempSmsTemplate(smsTemplate)
    setShowSmsEditor(true)
  }

  const saveEmailTemplate = () => {
    setEmailTemplate(tempEmailTemplate)
    setShowEmailEditor(false)
  }

  const saveSmsTemplate = () => {
    setSmsTemplate(tempSmsTemplate)
    setShowSmsEditor(false)
  }

  // Generate preview subject with actual contact data substituted
  const getPreviewSubject = () => {
    if (!emailSubject) {
      return emailSubject
    }

    // Use actual contact if available, otherwise use fallback preview data
    const contact = contacts.length > 0
      ? (contacts[previewContactIndex] || contacts[0])
      : { firstName: 'John', lastName: 'Doe' }

    const userFirstName = userName.firstName || 'Your Name'

    // Replace template variables with actual values
    let previewSubject = emailSubject
      .replace(/\{contactName\}/g, `${contact.firstName} ${contact.lastName}`)
      .replace(/\{contactFirstName\}/g, contact.firstName)
      .replace(/\{contactLastName\}/g, contact.lastName)
      .replace(/\{firstName\}/g, userFirstName)
      .replace(/\{refereeFirstName\}/g, userFirstName)
      .replace(/\{refereeLastName\}/g, userName.lastName || '')
      .replace(/\{statementSummary\}/g, userName.statementSummary || 'Your statement summary')
      // Remove any remaining unreplaced placeholders
      .replace(/\{[^}]+\}/g, '[placeholder]')

    return previewSubject
  }

  // Generate preview HTML with actual contact data substituted
  const getPreviewHtml = () => {
    if (!emailTemplate) {
      return ''
    }

    // Use actual contact if available, otherwise use fallback preview data
    const contact = contacts.length > 0
      ? (contacts[previewContactIndex] || contacts[0])
      : { firstName: 'John', lastName: 'Doe' }

    const userFirstName = userName.firstName || 'Your Name'

    // Replace template variables with actual values (capitalize first names)
    let previewHtml = emailTemplate
      .replace(/\{contactName\}/g, `${capitalizeFirstLetter(contact.firstName)} ${contact.lastName}`)
      .replace(/\{contactFirstName\}/g, capitalizeFirstLetter(contact.firstName))
      .replace(/\{contactLastName\}/g, contact.lastName)
      .replace(/\{firstName\}/g, userFirstName)
      .replace(/\{refereeFirstName\}/g, userFirstName)
      .replace(/\{refereeLastName\}/g, userName.lastName || '')
      .replace(/\{statementSummary\}/g, userName.statementSummary || 'Your statement summary')
      // Remove any remaining unreplaced placeholders
      .replace(/\{[^}]+\}/g, '[placeholder]')

    // Convert line breaks to HTML
    // First, convert double newlines (paragraph breaks) to paragraph tags
    // Then convert remaining single newlines to <br> tags
    previewHtml = previewHtml
      .split(/\n\n+/)
      .map(paragraph => `<p style="margin-bottom: 1em;">${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('')

    return previewHtml
  }

  // Generate preview SMS with actual contact data substituted
  const getPreviewSms = () => {
    if (!smsTemplate) {
      return ''
    }

    // Use actual contact if available, otherwise use fallback preview data
    const contact = contacts.length > 0
      ? (contacts[previewContactIndex] || contacts[0])
      : { firstName: 'John', lastName: 'Doe' }

    const userFirstName = userName.firstName || 'Your Name'

    // Replace template variables with actual values (capitalize first names)
    let previewSms = smsTemplate
      .replace(/\{contactName\}/g, `${capitalizeFirstLetter(contact.firstName)} ${contact.lastName}`)
      .replace(/\{contactFirstName\}/g, capitalizeFirstLetter(contact.firstName))
      .replace(/\{contactLastName\}/g, contact.lastName)
      .replace(/\{firstName\}/g, userFirstName)
      .replace(/\{refereeFirstName\}/g, userFirstName)
      .replace(/\{refereeLastName\}/g, userName.lastName || '')
      .replace(/\{statementSummary\}/g, userName.statementSummary || 'Your statement summary')
      // Remove any remaining unreplaced placeholders
      .replace(/\{[^}]+\}/g, '[placeholder]')

    return previewSms
  }

  const handleSendRequests = async (contactIndex?: number) => {
    setIsSubmitting(true)
    setFormError('')

    try {
      // Determine which contact(s) to send to
      let contactIds: string[]
      if (contactIndex !== undefined) {
        // Individual contact
        const contact = contacts[contactIndex]
        if (!contact.id) {
          setFormError('Unable to send to this contact. Please go back and re-add your contacts.')
          setIsSubmitting(false)
          return
        }
        contactIds = [contact.id]
      } else {
        // All contacts
        contactIds = contacts.filter(c => c.id).map(c => c.id!)
        if (contactIds.length === 0) {
          setFormError('No contacts found. Please go back and add your contacts again.')
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
        // Check individual email results
        const successfulEmails = data.results?.filter((r: any) => r.emailSent) || []
        const failedEmails = data.results?.filter((r: any) => !r.emailSent) || []

        if (contactIndex !== undefined) {
          // Individual contact - check if their email actually sent
          const result = data.results?.[0]
          if (result?.emailSent) {
            setSentContactIndices(prev => new Set([...prev, contactIndex]))
          } else {
            setFormError('Failed to send email. Please check your email configuration in Settings.')
          }
          setIsSubmitting(false)
        } else {
          // "Ask Everyone" - show success modal with actual count
          if (successfulEmails.length > 0) {
            setSentCount(successfulEmails.length)
            if (failedEmails.length > 0) {
              // Some succeeded, some failed
              setFormError(`${failedEmails.length} email(s) failed to send. Check your email configuration.`)
            }
            setShowSuccessModal(true)
          } else {
            // All failed
            setFormError('Failed to send emails. Please check your email configuration in Settings.')
          }
          setIsSubmitting(false)
        }
      } else {
        setFormError(data.error || 'Failed to send requests. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error sending requests:', error)
      setFormError('An unexpected error occurred while sending requests. Please try again.')
      setIsSubmitting(false)
    }
  }

  const getStepBackgroundClass = () => {
    let bg = brandingSettings.flowAStep1Background
    if (step === 2) bg = brandingSettings.flowAStep2Background

    if (bg.startsWith('#') || bg.startsWith('rgb')) {
      return ''
    }
    return bg
  }

  const getStepBackgroundStyle = () => {
    let bg = brandingSettings.flowAStep1Background
    if (step === 2) bg = brandingSettings.flowAStep2Background

    if (bg.startsWith('#') || bg.startsWith('rgb')) {
      return {
        backgroundColor: bg,
        transition: 'background-color 700ms ease-in-out'
      }
    }
    return {}
  }

  const getFormBackgroundStyle = () => {
    let bg = brandingSettings.flowAStep1FormBg
    if (step === 2) bg = brandingSettings.flowAStep2FormBg

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
      className={`flex-1 flex flex-col bg-gradient-to-br ${getStepBackgroundClass()} transition-all duration-700 ease-in-out`}
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

                {/* Error Banner */}
                {formError && step === 1 && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 font-medium text-sm">{formError}</p>
                  </div>
                )}

                {(hasExistingContacts || hasExistingConnections) && !hasLoadedConnections && (
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
                            {(() => {
                              const connectionCount = existingConnections.length
                              const contactCount = getDeduplicatedContactCount()
                              if (connectionCount > 0 && contactCount > 0) {
                                return <>You have {connectionCount} connection{connectionCount !== 1 ? 's' : ''} and {contactCount} contact{contactCount !== 1 ? 's' : ''}</>
                              } else if (connectionCount > 0) {
                                return <>You have {connectionCount} connection{connectionCount !== 1 ? 's' : ''}</>
                              } else {
                                return <>You have {contactCount} contact{contactCount !== 1 ? 's' : ''}</>
                              }
                            })()}
                          </p>
                          <p className="text-xs text-emerald-700 mt-0.5">
                            Load your network to request introductions from them
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleLoadConnections}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 text-sm whitespace-nowrap"
                      >
                        Load Connections
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleStep1Submit} className="space-y-6">
                  {contacts.map((contact, index) => {
                    const isLoaded = isLoadedContact(contact)
                    const isEditing = editingContactIndices.has(index)
                    const hasProfile = contact.linkedUser?.username

                    return (
                      <div
                        key={index}
                        className="border-2 border-gray-200 rounded-2xl p-6 bg-white"
                      >
                        {isLoaded ? (
                          // Rendered view for loaded contacts
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {/* Profile Picture */}
                                {hasProfile ? (
                                  <a href={`/${contact.linkedUser?.username}`} className="flex-shrink-0">
                                    {contact.linkedUser?.profilePicture ? (
                                      <img
                                        src={contact.linkedUser.profilePicture}
                                        alt={`${contact.firstName} ${contact.lastName}`}
                                        className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-200 hover:ring-purple-400 transition-all"
                                      />
                                    ) : (
                                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-purple-200 hover:ring-purple-400 transition-all">
                                        {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                                      </div>
                                    )}
                                  </a>
                                ) : (
                                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg flex-shrink-0">
                                    {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                                  </div>
                                )}

                                {/* Name and Contact Info */}
                                <div className="flex-1">
                                  {hasProfile ? (
                                    <a
                                      href={`/${contact.linkedUser?.username}`}
                                      className="text-lg font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                                    >
                                      {contact.firstName} {contact.lastName}
                                    </a>
                                  ) : (
                                    <p className="text-lg font-semibold text-gray-900">
                                      {contact.firstName} {contact.lastName}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                                    {contact.email && (
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {contact.email}
                                      </span>
                                    )}
                                    {contact.phone && (
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {contact.phone}
                                      </span>
                                    )}
                                    {contact.company && (
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        {contact.company}
                                      </span>
                                    )}
                                    {!contact.email && !contact.phone && (
                                      <span className="text-amber-600 italic">No contact info</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleEditContact(index)}
                                  className={`p-2 rounded-lg transition-all duration-200 ${
                                    isEditing
                                      ? 'bg-emerald-100 text-emerald-600'
                                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                  }`}
                                  title={isEditing ? 'Done editing' : 'Edit contact info'}
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveContact(index)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  title="Remove contact"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Editable fields (shown when editing) */}
                            {isEditing && (
                              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                  </label>
                                  <input
                                    type="email"
                                    value={contact.email}
                                    onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-[#191919] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                                    placeholder="email@example.com"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone
                                  </label>
                                  <input
                                    type="tel"
                                    value={contact.phone}
                                    onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-[#191919] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                                    placeholder="+1 (555) 000-0000"
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          // Full input form for new empty contacts
                          <>
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
                          </>
                        )}
                      </div>
                    )
                  })}

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

                {/* Error Banner */}
                {formError && step === 2 && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 font-medium text-sm">{formError}</p>
                  </div>
                )}

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

                  {/* Email Subject - Preview Only */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Subject
                    </label>
                    <div className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50 text-gray-900">
                      {getPreviewSubject()}
                    </div>
                  </div>

                  {/* Email Message - Preview with Edit Button */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Email Message
                      </label>
                      <button
                        onClick={openEmailEditor}
                        className="px-3 py-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                      >
                        Edit Email
                      </button>
                    </div>
                    <div className="w-full rounded-xl border-2 border-gray-200 bg-gray-50">
                      <div
                        className="overflow-auto p-4 bg-white min-h-[200px]"
                        dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                      />
                      {contacts.length > 0 && (
                        <p className="text-xs text-gray-500 px-4 py-2 bg-gray-50">
                          Preview shown with: {contacts[previewContactIndex]?.firstName || contacts[0]?.firstName} {contacts[previewContactIndex]?.lastName || contacts[0]?.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SMS Message - Preview with Edit Button */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        SMS Message
                      </label>
                      <button
                        onClick={openSmsEditor}
                        className="px-3 py-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                      >
                        Edit SMS
                      </button>
                    </div>
                    <div className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50">
                      <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-md p-4">
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">
                          {getPreviewSms()}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 text-right">
                          {getPreviewSms().length} characters
                        </div>
                        {contacts.length > 0 && (
                          <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                            Preview with: {contacts[previewContactIndex]?.firstName || contacts[0]?.firstName} {contacts[previewContactIndex]?.lastName || contacts[0]?.lastName}
                          </p>
                        )}
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
                        const hasProfile = contact.linkedUser?.username
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {/* Profile Picture / Avatar */}
                              {hasProfile ? (
                                <a href={`/${contact.linkedUser?.username}`} className="flex-shrink-0">
                                  {contact.linkedUser?.profilePicture ? (
                                    <img
                                      src={contact.linkedUser.profilePicture}
                                      alt={`${contact.firstName} ${contact.lastName}`}
                                      className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200 hover:ring-purple-400 transition-all"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-purple-200 hover:ring-purple-400 transition-all">
                                      {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                                    </div>
                                  )}
                                </a>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm flex-shrink-0">
                                  {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                                </div>
                              )}
                              <div>
                                {hasProfile ? (
                                  <a
                                    href={`/${contact.linkedUser?.username}`}
                                    className="font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                                  >
                                    {contact.firstName} {contact.lastName}
                                  </a>
                                ) : (
                                  <p className="font-semibold text-gray-900">
                                    {contact.firstName} {contact.lastName}
                                  </p>
                                )}
                                <p className="text-sm text-gray-600">
                                  {contact.email || contact.phone}
                                  {contact.company && ` • ${contact.company}`}
                                </p>
                              </div>
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
                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
                      >
                        ← Back to Contacts
                      </button>
                      <button
                        onClick={() => router.push('/dashboard')}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                      >
                        Finish
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <BottomProgressBar
        currentStep={step}
        totalSteps={2}
        stepName={
          step === 1
            ? 'Add people already in your network'
            : 'Craft the message to them'
        }
      />

      {/* Email Editor Modal */}
      {showEmailEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Edit Email Message</h3>
                <button
                  onClick={() => setShowEmailEditor(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Template
                </label>
                <textarea
                  value={tempEmailTemplate}
                  onChange={(e) => setTempEmailTemplate(e.target.value)}
                  rows={12}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 font-mono text-sm"
                  placeholder="Enter your email message..."
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-600 font-semibold">Available placeholders:</span>
                  {['{contactName}', '{contactFirstName}', '{firstName}'].map((placeholder) => (
                    <button
                      key={placeholder}
                      onClick={() => setTempEmailTemplate(tempEmailTemplate + placeholder)}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold hover:bg-purple-200 transition-colors"
                    >
                      {placeholder}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                <div className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50 text-gray-900 min-h-[150px] whitespace-pre-wrap">
                  {tempEmailTemplate || 'Enter your message above...'}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowEmailEditor(false)}
                  className="px-6 py-2 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEmailTemplate}
                  className="px-6 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMS Editor Modal */}
      {showSmsEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Edit SMS Message</h3>
                <button
                  onClick={() => setShowSmsEditor(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SMS Template
                </label>
                <textarea
                  value={tempSmsTemplate}
                  onChange={(e) => setTempSmsTemplate(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                  placeholder="Enter your SMS message..."
                />
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs text-gray-600 font-semibold">Available placeholders:</span>
                    {['{contactName}', '{contactFirstName}', '{firstName}'].map((placeholder) => (
                      <button
                        key={placeholder}
                        onClick={() => setTempSmsTemplate(tempSmsTemplate + placeholder)}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold hover:bg-purple-200 transition-colors"
                      >
                        {placeholder}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{tempSmsTemplate.length} characters</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                <div className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50">
                  <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-md p-4">
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {tempSmsTemplate || 'Enter your message above...'}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 text-right">
                      {tempSmsTemplate.length} characters
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSmsEditor(false)}
                  className="px-6 py-2 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSmsTemplate}
                  className="px-6 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-emerald-600"
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

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Messages Sent!
            </h3>
            <p className="text-gray-600 mb-6">
              {sentCount} {sentCount === 1 ? 'message was' : 'messages were'} sent successfully.
            </p>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
