'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import BottomProgressBar from '@/components/BottomProgressBar'
import Step1Form from '@/components/Step1Form'

export default function RefereePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState('')
  const [direction, setDirection] = useState<'up' | 'down'>('down')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Step 1: User profile
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
    skills: [''],
    companyName: '',
    achievement: '',
    achievementMethod: '',
    statementSummary: '',
    introRequest: '',
  })

  // Branding settings
  const [brandingSettings, setBrandingSettings] = useState({
    step1Background: 'from-blue-400 via-purple-400 to-pink-400',
    step2Background: 'from-emerald-400 via-teal-400 to-cyan-400',
    step3Background: 'from-orange-400 via-rose-400 to-pink-400',
    step4Background: 'from-violet-400 via-purple-400 to-fuchsia-400',
  })

  // Load saved user data and branding settings on mount
  useEffect(() => {
    const loadUserData = async () => {
      const savedUserId = localStorage.getItem('userId')

      // ALWAYS check if user is logged in FIRST (priority over localStorage)
      console.log('[Referee Pre-populate] Checking authentication status')
      try {
        const authResponse = await fetch('/api/auth/me')
        console.log('[Referee Pre-populate] Auth response status:', authResponse.status)

        if (authResponse.ok) {
          const authData = await authResponse.json()
          console.log('[Referee Pre-populate] Auth data:', authData)

          if (authData.success && authData.userId) {
            console.log('[Referee Pre-populate] User IS logged in with ID:', authData.userId)
            setUserId(authData.userId)

            // Fetch logged-in user's data
            const userResponse = await fetch(`/api/user?userId=${authData.userId}`)
            console.log('[Referee Pre-populate] User response status:', userResponse.status)

            if (userResponse.ok) {
              const userData = await userResponse.json()
              console.log('[Referee Pre-populate] User data:', userData)

              if (userData.user) {
                console.log('[Referee Pre-populate] Pre-populating with LOGGED-IN user data:', {
                  firstName: userData.user.firstName,
                  lastName: userData.user.lastName,
                  email: userData.user.email,
                  phone: userData.user.phone,
                })

                setFormData(prev => ({
                  ...prev,
                  firstName: userData.user.firstName || '',
                  lastName: userData.user.lastName || '',
                  email: userData.user.email || '',
                  phone: userData.user.phone || '',
                }))

                // Skip localStorage check - we're using logged-in user data
                console.log('[Referee Pre-populate] Skipping localStorage (using logged-in user data)')

                // Fetch contacts and branding, then return
                if (authData.userId) {
                  fetch(`/api/contacts?userId=${authData.userId}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.contacts && data.contacts.length > 0) {
                        setExistingContacts(data.contacts)
                        setHasExistingContacts(true)
                      }
                    })
                    .catch(err => console.error('Failed to fetch existing contacts:', err))
                }

                // Fetch branding settings
                fetch('/api/admin/branding')
                  .then(res => res.json())
                  .then(data => {
                    if (data.success && data.settings) {
                      setBrandingSettings({
                        step1Background: data.settings.step1Background,
                        step2Background: data.settings.step2Background,
                        step3Background: data.settings.step3Background,
                        step4Background: data.settings.step4Background,
                      })
                    }
                  })
                  .catch(err => console.error('Failed to fetch branding settings:', err))
                  .finally(() => setIsLoading(false))

                return // Exit early - don't check localStorage
              } else {
                console.log('[Referee Pre-populate] No user object in response')
              }
            } else {
              console.log('[Referee Pre-populate] User response not ok')
            }
          } else {
            console.log('[Referee Pre-populate] User not authenticated')
          }
        } else {
          console.log('[Referee Pre-populate] Auth response not ok')
        }
      } catch (authError) {
        console.error('[Referee Pre-populate] Error fetching logged-in user data:', authError)
      }

      // Only check localStorage if user is NOT logged in
      console.log('[Referee Pre-populate] User not logged in, checking localStorage')
      const savedFormData = localStorage.getItem('formData')
      if (savedFormData) {
        try {
          const parsed = JSON.parse(savedFormData)
          setFormData(parsed)
          console.log('[Referee Pre-populate] Using saved formData from localStorage')
        } catch (e) {
          console.error('Failed to parse saved form data:', e)
        }
      }

      // Fetch existing contacts if we have savedUserId
      if (savedUserId) {
        setUserId(savedUserId)

        fetch(`/api/contacts?userId=${savedUserId}`)
          .then(res => res.json())
          .then(data => {
            if (data.contacts && data.contacts.length > 0) {
              setExistingContacts(data.contacts)
              setHasExistingContacts(true)
            }
          })
          .catch(err => console.error('Failed to fetch existing contacts:', err))
      }

      // Fetch branding settings
      fetch('/api/admin/branding')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.settings) {
            setBrandingSettings({
              step1Background: data.settings.step1Background,
              step2Background: data.settings.step2Background,
              step3Background: data.settings.step3Background,
              step4Background: data.settings.step4Background,
            })
          }
        })
        .catch(err => console.error('Failed to fetch branding settings:', err))
        .finally(() => setIsLoading(false))
    }

    loadUserData()
  }, [])

  // Helper to capitalize first letter
  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Helper function to extract editable paragraphs from HTML template
  const extractEditableParagraphs = (html: string): string => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    // Find all <p> tags - we want indices 0 and 2 (skip quote at index 1, skip footer at index 3)
    const allParagraphs = tempDiv.querySelectorAll('p')
    const editableParagraphs: string[] = []

    // Get first paragraph (intro text) at index 0
    if (allParagraphs.length > 0) {
      editableParagraphs.push(allParagraphs[0].textContent || '')
    }

    // Get third paragraph (call to action) at index 2 - skip the quote paragraph at index 1
    if (allParagraphs.length > 2) {
      editableParagraphs.push(allParagraphs[2].textContent || '')
    }

    return editableParagraphs.join('\n\n')
  }

  // Helper function to rebuild HTML with edited paragraphs while preserving structure
  const rebuildHtmlWithEdits = (originalHtml: string, editedText: string): string => {
    const lines = editedText.split('\n\n') // Split by double newline
    const para1 = lines[0] || ''
    const para2 = lines[1] || ''

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = originalHtml

    // Update only the editable paragraphs at indices 0 and 2
    const paragraphs = tempDiv.querySelectorAll('p')
    if (paragraphs.length > 0) {
      paragraphs[0].textContent = para1  // First editable paragraph
    }
    if (paragraphs.length > 2) {
      paragraphs[2].textContent = para2  // Second editable paragraph (skip quote at index 1)
    }

    return tempDiv.innerHTML
  }

  // Fetch message templates on mount
  useEffect(() => {
    // Fetch EMAIL template
    fetch('/api/admin/message-templates?templateType=FIRST_DEGREE_REQUEST&messageChannel=EMAIL')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.templates && data.templates.length > 0) {
          const template = data.templates[0]
          setEmailSubject(template.subject || '')
          setMessageTemplate(template.bodyHtml || '')
          // Initialize editable versions
          setEditableEmailSubject(template.subject || '')
          setEditableEmailBody(template.bodyHtml || '')
          // Extract only editable paragraphs for editing
          const plainText = extractEditableParagraphs(template.bodyHtml || '')
          setEditableEmailBodyPlainText(plainText)
        }
      })
      .catch(err => console.error('Failed to fetch email template:', err))

    // Fetch SMS template
    fetch('/api/admin/message-templates?templateType=FIRST_DEGREE_REQUEST&messageChannel=SMS')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.templates && data.templates.length > 0) {
          const template = data.templates[0]
          setSmsTemplate(template.bodySms || '')
          // Initialize editable version
          setEditableSmsBody(template.bodySms || '')
        }
      })
      .catch(err => console.error('Failed to fetch SMS template:', err))
  }, [])

  // Step 2: Contacts
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

  // Step 3: Message template (original from admin)
  const [messageTemplate, setMessageTemplate] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [smsTemplate, setSmsTemplate] = useState('')

  // Step 3: Editable versions (what user can modify)
  const [editableEmailSubject, setEditableEmailSubject] = useState('')
  const [editableEmailBody, setEditableEmailBody] = useState('')
  const [editableEmailBodyPlainText, setEditableEmailBodyPlainText] = useState('')
  const [editableSmsBody, setEditableSmsBody] = useState('')

  const [previewContactIndex, setPreviewContactIndex] = useState(0)
  const [previewTab, setPreviewTab] = useState<'EMAIL' | 'SMS'>('EMAIL')
  const [isEditMode, setIsEditMode] = useState(false)

  // Track which contacts have been contacted
  const [contactedIds, setContactedIds] = useState<Set<string>>(new Set())

  // Helper function to get background style for a step
  const getStepBackgroundClass = (stepNumber: number) => {
    const backgrounds = [
      brandingSettings.step1Background,
      brandingSettings.step2Background,
      brandingSettings.step3Background,
      brandingSettings.step4Background,
    ]
    const bg = backgrounds[stepNumber - 1]

    // Check if it's a gradient (contains Tailwind classes) or a solid color (hex/rgba)
    if (bg.startsWith('#') || bg.startsWith('rgb')) {
      return '' // Return empty for inline style
    }
    return bg // Return Tailwind gradient classes
  }

  const getStepBackgroundStyle = (stepNumber: number) => {
    const backgrounds = [
      brandingSettings.step1Background,
      brandingSettings.step2Background,
      brandingSettings.step3Background,
      brandingSettings.step4Background,
    ]
    const bg = backgrounds[stepNumber - 1]

    // If it's a solid color, return inline style
    if (bg.startsWith('#') || bg.startsWith('rgb')) {
      return { backgroundColor: bg }
    }
    return {} // Return empty for Tailwind classes
  }

  // Generate preview subject with actual contact data substituted
  const getPreviewSubject = () => {
    if (contacts.length === 0 || !editableEmailSubject) {
      return editableEmailSubject
    }

    const contact = contacts[previewContactIndex] || contacts[0]

    // Replace template variables with actual values
    let previewSubject = editableEmailSubject
      .replace(/\{contactName\}/g, `${contact.firstName} ${contact.lastName}`)
      .replace(/\{contactFirstName\}/g, contact.firstName)
      .replace(/\{contactLastName\}/g, contact.lastName)
      .replace(/\{firstName\}/g, formData.firstName)
      .replace(/\{refereeFirstName\}/g, formData.firstName)
      .replace(/\{refereeLastName\}/g, formData.lastName)

    return previewSubject
  }

  // Generate preview HTML with actual contact data substituted
  const getPreviewHtml = () => {
    if (contacts.length === 0 || !editableEmailBody) {
      return editableEmailBody
    }

    const contact = contacts[previewContactIndex] || contacts[0]
    const link = `${window.location.origin}/firstdegree/${userId || 'user-id'}`

    // Replace template variables with actual values (capitalize first names)
    let previewHtml = editableEmailBody
      .replace(/\{contactName\}/g, `${capitalizeFirstLetter(contact.firstName)} ${contact.lastName}`)
      .replace(/\{contactFirstName\}/g, capitalizeFirstLetter(contact.firstName))
      .replace(/\{contactLastName\}/g, contact.lastName)
      .replace(/\{firstName\}/g, formData.firstName)
      .replace(/\{refereeFirstName\}/g, formData.firstName)
      .replace(/\{refereeLastName\}/g, formData.lastName)
      .replace(/\{statementSummary\}/g, formData.statementSummary || '')
      .replace(/\{link\}/g, link)

    return previewHtml
  }

  // Generate preview SMS with actual contact data substituted
  const getPreviewSms = () => {
    if (contacts.length === 0 || !editableSmsBody) {
      return editableSmsBody
    }

    const contact = contacts[previewContactIndex] || contacts[0]
    const link = `${window.location.origin}/firstdegree/${userId || 'user-id'}`

    // Replace template variables with actual values (capitalize first names)
    let previewSms = editableSmsBody
      .replace(/\{contactName\}/g, `${capitalizeFirstLetter(contact.firstName)} ${contact.lastName}`)
      .replace(/\{contactFirstName\}/g, capitalizeFirstLetter(contact.firstName))
      .replace(/\{contactLastName\}/g, contact.lastName)
      .replace(/\{firstName\}/g, formData.firstName)
      .replace(/\{refereeFirstName\}/g, formData.firstName)
      .replace(/\{refereeLastName\}/g, formData.lastName)
      .replace(/\{link\}/g, link)

    return previewSms
  }

  const goToStep = (newStep: number) => {
    setDirection(newStep > step ? 'down' : 'up')
    setStep(newStep)
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const skills = formData.skills.filter(s => s.trim() !== '')

    try {
      // First save the profile data
      const response = await fetch('/api/referee/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skills,
          userId: userId || undefined, // Include userId if already logged in
        }),
      })

      const data = await response.json()

      // Debug logging
      console.log('API Response:', data)
      console.log('Full response data:', JSON.stringify(data, null, 2))

      if (data.success) {
        setUserId(data.user.id)

        // Generate AI statement summary
        try {
          const aiResponse = await fetch('/api/user/generate-statement-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              skills,
              company: formData.companyName,
              achievement: formData.achievement,
              achievementMethod: formData.achievementMethod,
              introRequest: formData.introRequest,
              firstName: formData.firstName,
            }),
          })

          const aiData = await aiResponse.json()

          if (aiData.success && aiData.statementSummary) {
            // Save both AI-generated summaries (1st person and 3rd person)
            // Pass userId from the registration response since cookie may not be set yet
            await fetch('/api/user/update-statement', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                statementSummary: aiData.statementSummary,
                statementSummary3rdPerson: aiData.statementSummary3rdPerson,
                userId: data.user.id,
              }),
            })

            // Update local formData with AI-generated summary
            setFormData(prev => ({ ...prev, statementSummary: aiData.statementSummary }))
          }
        } catch (aiError) {
          // AI generation failed, but profile was saved - continue anyway
          console.error('AI generation error:', aiError)
        }

        // Save to localStorage
        localStorage.setItem('userId', data.user.id)
        localStorage.setItem('formData', JSON.stringify(formData))

        // Don't override the template here - it's already set from the useEffect that fetches from admin
        // If no template was fetched, the useEffect will have already set a default
        goToStep(2)
      } else {
        // Format detailed error message
        console.log('Error details:', data.details)
        if (data.details && Array.isArray(data.details)) {
          const fieldErrors = data.details.map((err: any) => {
            const field = err.path?.[0] || 'field'
            const message = err.message

            // Map field names to user-friendly labels
            const fieldLabels: Record<string, string> = {
              firstName: 'First Name',
              lastName: 'Last Name',
              email: 'Email',
              phone: 'Phone',
              statementSummary: 'Statement Summary',
            }

            const fieldLabel = fieldLabels[field] || field

            // Return the error message from Zod (which already has our custom messages)
            // or create a user-friendly one
            if (message.includes('String must contain at least')) {
              const match = message.match(/at least (\d+) character/)
              const minLength = match ? match[1] : '2'
              return `Please complete your ${fieldLabel} (at least ${minLength} characters required)`
            }

            if (message.includes('Invalid email')) {
              return `Please enter a valid ${fieldLabel}`
            }

            // Use the custom message from Zod if available
            return message
          })

          setErrorMessage(fieldErrors.join('\n'))
        } else {
          // If no details, show the general error
          setErrorMessage(data.error || 'Registration failed. Please check all fields.')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
    }
  }

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

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validContacts = contacts.filter(
      (c) => c.firstName && c.lastName && (c.email || c.phone)
    )

    if (validContacts.length === 0) {
      alert('Please add at least one contact with name and email or phone')
      return
    }

    try {
      // If contacts already have IDs, just move to next step without re-submitting
      if (validContacts.every(c => c.id)) {
        goToStep(3)
        return
      }

      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, contacts: validContacts }),
      })

      const data = await response.json()

      if (data.success) {
        // Fetch contacts from database to get their IDs
        const fetchResponse = await fetch(`/api/contacts?userId=${userId}`)
        const fetchData = await fetchResponse.json()

        if (fetchData.contacts) {
          setContacts(fetchData.contacts)
        }

        goToStep(3)
      } else {
        alert(data.error || 'Failed to add contacts')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const handleSendRequests = async (contactIds?: string[], navigateToSuccess = true) => {
    try {
      // Use provided contactIds or all contact IDs from database
      const idsToSend = contactIds || contacts.filter(c => c.id).map(c => c.id!)

      if (idsToSend.length === 0) {
        alert('No contacts found')
        return
      }

      const response = await fetch('/api/referee/send-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          contactIds: idsToSend,
          customMessage: editableEmailBody,
          customSmsMessage: editableSmsBody,
          emailSubject: editableEmailSubject,
          sendViaEmail: true,
          sendViaSms: false,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Mark these contacts as contacted
        setContactedIds(prev => {
          const newSet = new Set(prev)
          idsToSend.forEach(id => newSet.add(id))
          return newSet
        })

        if (navigateToSuccess) {
          alert('Requests sent successfully!')
          goToStep(4)
        }
      } else {
        alert(data.error || 'Failed to send requests')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Top Header */}
      <Header />

      {/* Bottom Progress Bar */}
      <BottomProgressBar currentStep={step} totalSteps={4} />

      {/* Main Content */}
      <main className="pb-24">
        {/* Desktop: Background color transition */}
        <div
          className={`hidden lg:block h-screen bg-gradient-to-br ${getStepBackgroundClass(step)} transition-all duration-700 ease-in-out`}
          style={getStepBackgroundStyle(step)}
        >
          {step === 1 && (
            <section className="userflow h-screen flex items-center justify-center animate-fadeIn">

              <div className="w-full userflow-form px-8">
                <div className="userflow-form-bg backdrop-blur-sm rounded-3xl p-8 md:p-12">
                  <h2 className="userflow-title">OK, let's create your synopsis</h2>
				  <div className="userflow-tip">
				  <strong>Tip:</strong> Have just one (or two) superpowers, max!</div>

                  {errorMessage && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start">
                        <svg
                          className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-red-800 mb-1">
                            Please fix the following errors:
                          </h3>
                          <div className="text-sm text-red-700 whitespace-pre-line">
                            {errorMessage}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Step1Form
                    formData={formData}
                    onFormDataChange={setFormData}
                    onSubmit={handleStep1Submit}
                  />
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="userflow h-screen flex items-center justify-center animate-fadeIn">
              <div className="w-full userflow-form px-8 py-12 overflow-y-auto max-h-screen">
                <div className="userflow-bg backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-8">
                  <h2 className="userflow-title text-gray-900 mb-2">
                    Add contacts you'd like to ask for intros
                  </h2>
                  <h3 className="userflow-subtitle text-gray-600 mb-4">
                    Who would you like to ask for introductions to people in their network?
                  </h3>

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

                  <form onSubmit={handleStep2Submit} className="space-y-6">
                    {contacts.map((contact, index) => (
                      <div
                        key={index}
                        className="userflow-contact-row"
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
                      className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-6 text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold"
                    >
                      + Add Contact
                    </button>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                      >
                        Continue to Message →
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="userflow h-screen flex items-center justify-center animate-fadeIn">
              <div className="userflow-form w-full overflow-y-auto max-h-screen">
                <div className="userflow-bg backdrop-blur-sm rounded-3xl md:p-12 mb-8">
                  <h2 className="userflow-title text-gray-900 mb-2">
                    Request Introductions
                  </h2>
                  <div className="userflow-tip text-gray-600 mb-8">
                    Review the message below and select which contacts to send it to
                  </div>

                  <div className="space-y-6">
                    <div>
                      {/* Header with Tabs and Preview Dropdown */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Email/SMS Tabs */}
                        <div className="flex gap-2 border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => setPreviewTab('EMAIL')}
                            className={`px-4 py-2 font-semibold text-sm transition-colors border-b-2 ${
                              previewTab === 'EMAIL'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Email
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewTab('SMS')}
                            className={`px-4 py-2 font-semibold text-sm transition-colors border-b-2 ${
                              previewTab === 'SMS'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            SMS
                          </button>
                        </div>

                        {/* Preview As Dropdown */}
                        {contacts.length > 0 && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Preview as:</label>
                            <select
                              value={previewContactIndex}
                              onChange={(e) => setPreviewContactIndex(Number(e.target.value))}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {contacts.map((contact, index) => (
                                <option key={index} value={index}>
                                  {contact.firstName} {contact.lastName}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">
                          {isEditMode ? 'Edit the message before sending' : 'This is the message that will be sent to your contacts'}
                        </p>
                        <button
                          onClick={() => setIsEditMode(!isEditMode)}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {isEditMode ? 'Preview' : 'Edit Message'}
                        </button>
                      </div>

                      {/* Email Tab Content */}
                      {previewTab === 'EMAIL' && (
                        <>
                          {isEditMode ? (
                            <>
                              {/* Edit Mode - Editable Subject */}
                              <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  Subject:
                                </label>
                                <input
                                  type="text"
                                  value={editableEmailSubject}
                                  onChange={(e) => setEditableEmailSubject(e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Enter email subject..."
                                />
                              </div>

                              {/* Edit Mode - Editable Email Body */}
                              <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  Email Message:
                                </label>
                                <textarea
                                  value={editableEmailBodyPlainText}
                                  onChange={(e) => {
                                    const newText = e.target.value
                                    setEditableEmailBodyPlainText(newText)
                                    // Rebuild HTML with edited paragraphs while preserving structure
                                    setEditableEmailBody(rebuildHtmlWithEdits(messageTemplate, newText))
                                  }}
                                  rows={12}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Enter your message..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Available variables: {'{contactFirstName}'}, {'{refereeFirstName}'}, {'{statementSummary}'}, {'{link}'}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Preview Mode - Subject Line */}
                              <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  Subject:
                                </label>
                                <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                  {getPreviewSubject()}
                                </div>
                              </div>

                              {/* Preview Mode - Email Body */}
                              <div
                                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white min-h-[200px]"
                                dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                              />
                            </>
                          )}
                        </>
                      )}

                      {/* SMS Tab Content */}
                      {previewTab === 'SMS' && (
                        <>
                          {isEditMode ? (
                            <>
                              {/* Edit Mode - Editable SMS */}
                              <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  SMS Message:
                                </label>
                                <textarea
                                  value={editableSmsBody}
                                  onChange={(e) => setEditableSmsBody(e.target.value)}
                                  rows={6}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Enter SMS message..."
                                  maxLength={160}
                                />
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-xs text-gray-500">
                                    {editableSmsBody.length} / 160 characters • Variables: {'{contactFirstName}'}, {'{refereeFirstName}'}, {'{link}'}
                                  </p>
                                  {!editableSmsBody.includes('{link}') && (
                                    <p className="text-xs text-red-600 font-semibold">
                                      ⚠️ {'{link}'} required
                                    </p>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Preview Mode - SMS */}
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
                            </>
                          )}
                        </>
                      )}
                    </div>

                    <div className="border-t-2 border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Your Contacts:
                      </h3>
                      <div className="space-y-3">
                        {contacts.length === 0 && (
                          <p className="text-gray-600 text-center py-4">
                            No contacts found. Please go back and add contacts.
                          </p>
                        )}
                        {contacts.map((contact, index) => {
                          const isContacted = contact.id && contactedIds.has(contact.id)

                          return (
                            <div
                              key={contact.id || index}
                              className="flex items-center gap-4 bg-white border-2 border-gray-200 rounded-xl p-4"
                            >
                              <div className="flex-1 grid grid-cols-4 gap-3 items-center">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Name</p>
                                  <p className="font-semibold text-gray-900">
                                    {contact.firstName} {contact.lastName}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Email</p>
                                  <p className="text-sm text-gray-700">
                                    {contact.email || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                                  <p className="text-sm text-gray-700">
                                    {contact.phone || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Company</p>
                                  <p className="text-sm text-gray-700">
                                    {contact.company || '-'}
                                  </p>
                                </div>
                              </div>
                              {isContacted ? (
                                <div className="flex items-center gap-2 text-green-600 flex-shrink-0">
                                  <svg
                                    className="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="font-semibold">Sent</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => contact.id && handleSendRequests([contact.id], false)}
                                  disabled={!contact.id}
                                  className="bg-gradient-to-r from-orange-500 to-rose-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                >
                                  Ask Them
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendRequests()}
                      className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 mb-4"
                    >
                      Or, Ask Everyone →
                    </button>

                    <div className="flex gap-4">
                      <button
                        onClick={() => goToStep(2)}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => goToStep(4)}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-rose-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="h-screen flex items-center justify-center animate-fadeIn">
              <div className="w-full max-w-2xl px-8">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 text-center">
                  <div className="mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                      <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Requests Sent Successfully!
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    Your contacts will receive your request and can start adding their recommendations.
                  </p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Mobile: Fading sections */}
        <div className={`lg:hidden min-h-screen bg-gradient-to-br ${getStepBackgroundClass(step)} transition-all duration-700 ease-in-out`} style={getStepBackgroundStyle(step)}>
          {step === 1 && (
            <div
              className="animate-fadeIn min-h-screen flex items-center justify-center px-4 py-8"
            >
              <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  OK, let's create your synopsis
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  <strong>Tip:</strong> Have just one (or two) superpowers, max!
                </p>

                {errorMessage && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4">
                    <div className="flex items-start">
                      <svg
                        className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-red-800 mb-0.5">
                          Please fix these errors:
                        </p>
                        <div className="text-xs text-red-700 whitespace-pre-line">
                          {errorMessage}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Step1Form
                  formData={formData}
                  onFormDataChange={setFormData}
                  onSubmit={handleStep1Submit}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn min-h-screen px-4 py-8">
              <div className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Add Contacts
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Who can help introduce you?
                </p>

                <form onSubmit={handleStep2Submit} className="space-y-4">
                  {contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-2xl p-4 bg-white"
                    >
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={contact.firstName}
                          onChange={(e) =>
                            handleContactChange(index, 'firstName', e.target.value)
                          }
                          className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm text-[#191919]"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={contact.lastName}
                          onChange={(e) =>
                            handleContactChange(index, 'lastName', e.target.value)
                          }
                          className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm text-[#191919]"
                        />
                      </div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={contact.email}
                        onChange={(e) =>
                          handleContactChange(index, 'email', e.target.value)
                        }
                        className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm text-[#191919] mb-3"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(index)}
                        className="text-red-600 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddContact}
                    className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-4 text-sm text-gray-600 font-semibold"
                  >
                    + Add Contact
                  </button>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl text-sm"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 rounded-xl text-sm"
                    >
                      Continue →
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fadeIn min-h-screen px-4 py-8">
              <div className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Customize Message
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Edit your request message
                </p>

                <div className="space-y-4">
                  <textarea
                    rows={8}
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm text-[#191919]"
                  />

                  <button
                    onClick={() => handleSendRequests()}
                    className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-semibold py-3 rounded-xl text-sm mb-3"
                  >
                    Or, Ask Everyone →
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => goToStep(2)}
                      className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl text-sm"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => goToStep(4)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-rose-600 text-white font-semibold py-3 rounded-xl text-sm"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fadeIn min-h-screen flex items-center justify-center px-4">
              <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Success!
                </h2>
                <p className="text-gray-600 mb-8">
                  Your requests have been sent
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold px-8 py-3 rounded-xl"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
