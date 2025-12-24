'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import MobileProgressBar from '@/components/MobileProgressBar'

function FirstDegreeContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const refereeId = params.username as string
  const contactId = searchParams.get('c')

  const [step, setStep] = useState(1)
  const [referee, setReferee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [direction, setDirection] = useState<'up' | 'down'>('down')

  // Branding settings
  const [brandingSettings, setBrandingSettings] = useState({
    flowBStep1Background: 'from-blue-400 via-purple-400 to-pink-400',
    flowBStep2Background: 'from-emerald-400 via-teal-400 to-cyan-400',
    flowBStep3Background: 'from-orange-400 via-rose-400 to-pink-400',
    flowBStep4Background: 'from-violet-400 via-purple-400 to-fuchsia-400',
    flowBStep1FormBg: 'white',
    flowBStep2FormBg: 'white',
    flowBStep3FormBg: 'white',
    flowBStep4FormBg: 'white',
    flowBStep1Name: 'Review request',
    flowBStep2Name: 'Suggest your contacts',
    flowBStep3Name: 'Review & send',
    flowBStep4Name: 'Track responses',
  })

  // Step 1: First degree contact info
  const [firstDegreeInfo, setFirstDegreeInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [contactLoaded, setContactLoaded] = useState(false)

  // Step 2: Referrals
  const [referrals, setReferrals] = useState<Array<{
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
  }>>([])

  const [firstDegreeUserId, setFirstDegreeUserId] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [errorMessages, setErrorMessages] = useState<string[]>([])
  const [existingReferrals, setExistingReferrals] = useState<Array<any>>([])
  const [hasExistingReferrals, setHasExistingReferrals] = useState(false)

  // Connections state
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
  const [hasLoadedConnections, setHasLoadedConnections] = useState(false)
  const [editingReferralIndices, setEditingReferralIndices] = useState<Set<number>>(new Set())

  // Step 3: Message templates and editing
  const [messageTemplate, setMessageTemplate] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [smsTemplate, setSmsTemplate] = useState('')

  // Editable versions
  const [editableEmailSubject, setEditableEmailSubject] = useState('')
  const [editableEmailBody, setEditableEmailBody] = useState('')
  const [editableEmailBodyPlainText, setEditableEmailBodyPlainText] = useState('')
  const [editableSmsBody, setEditableSmsBody] = useState('')

  const [previewContactIndex, setPreviewContactIndex] = useState(0)
  const [previewTab, setPreviewTab] = useState<'EMAIL' | 'SMS'>('EMAIL')
  const [isEditMode, setIsEditMode] = useState(false)

  // Track which referrals have been contacted
  const [contactedIds, setContactedIds] = useState<Set<string>>(new Set())

  // Helper to capitalize first letter
  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Helper function to extract editable paragraphs from HTML template
  const extractEditableParagraphs = (html: string): string => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    const allParagraphs = tempDiv.querySelectorAll('p')
    const editableParagraphs: string[] = []

    if (allParagraphs.length > 0) {
      editableParagraphs.push(allParagraphs[0].textContent || '')
    }

    if (allParagraphs.length > 2) {
      editableParagraphs.push(allParagraphs[2].textContent || '')
    }

    return editableParagraphs.join('\n\n')
  }

  // Helper function to rebuild HTML with edited paragraphs while preserving structure
  const rebuildHtmlWithEdits = (originalHtml: string, editedText: string): string => {
    const lines = editedText.split('\n\n')
    const para1 = lines[0] || ''
    const para2 = lines[1] || ''

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = originalHtml

    const paragraphs = tempDiv.querySelectorAll('p')
    if (paragraphs.length > 0) {
      paragraphs[0].textContent = para1
    }
    if (paragraphs.length > 2) {
      paragraphs[2].textContent = para2
    }

    return tempDiv.innerHTML
  }

  // Generate preview subject with actual contact data substituted
  const getPreviewSubject = () => {
    if (referrals.length === 0 || !editableEmailSubject) {
      return editableEmailSubject
    }

    const referral = referrals[previewContactIndex] || referrals[0]

    // Replace template variables with actual values
    let previewSubject = editableEmailSubject
      .replace(/\{contactName\}/g, `${referral.firstName} ${referral.lastName}`)
      .replace(/\{contactFirstName\}/g, referral.firstName)
      .replace(/\{contactLastName\}/g, referral.lastName)
      .replace(/\{firstName\}/g, firstDegreeInfo.firstName)
      .replace(/\{firstDegreeFirstName\}/g, firstDegreeInfo.firstName)
      .replace(/\{firstDegreeLastName\}/g, firstDegreeInfo.lastName)
      .replace(/\{refereeFirstName\}/g, referee?.firstName || '')
      .replace(/\{refereeLastName\}/g, referee?.lastName || '')
      .replace(/\{referralFirstName\}/g, referral.firstName)
      .replace(/\{referralLastName\}/g, referral.lastName)

    return previewSubject
  }

  // Generate preview HTML with actual contact data substituted
  const getPreviewHtml = () => {
    if (referrals.length === 0 || !editableEmailBody) {
      return editableEmailBody
    }

    const referral = referrals[previewContactIndex] || referrals[0]
    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/seconddegree/${refereeId}`

    // Use 3rd person statementSummary if available, then 1st person, otherwise build a fallback
    let refereeIntro = referee?.statementSummary3rdPerson || referee?.statementSummary || ''

    if (!refereeIntro) {
      // Fallback: Build the referee intro text from individual fields
      let skillsList: string[] = []
      if (referee?.skills) {
        try {
          skillsList = Array.isArray(referee.skills) ? referee.skills : JSON.parse(referee.skills)
        } catch {
          skillsList = [referee.skills]
        }
      }

      if (skillsList.length > 0) {
        refereeIntro = `${referee?.firstName} ${referee?.lastName} is great at ${skillsList.join(' and ')}.`
      }

      if (referee?.companyName || referee?.achievement || referee?.achievementMethod) {
        if (refereeIntro) refereeIntro += ' '

        if (referee?.companyName && referee?.achievement && referee?.achievementMethod) {
          refereeIntro += `${referee.firstName} has worked at ${referee.companyName} where they ${referee.achievement} by ${referee.achievementMethod}.`
        } else if (referee?.companyName && referee?.achievement) {
          refereeIntro += `${referee.firstName} has worked at ${referee.companyName} where they ${referee.achievement}.`
        } else if (referee?.companyName) {
          refereeIntro += `${referee.firstName} has worked at ${referee.companyName}.`
        }
      }

      if (referee?.introRequest) {
        if (refereeIntro) refereeIntro += ' '
        refereeIntro += `They would really appreciate ${referee.introRequest}.`
      }
    }

    // Replace template variables with actual values (capitalize first names)
    let previewHtml = editableEmailBody
      .replace(/\{contactName\}/g, `${capitalizeFirstLetter(referral.firstName)} ${referral.lastName}`)
      .replace(/\{contactFirstName\}/g, capitalizeFirstLetter(referral.firstName))
      .replace(/\{contactLastName\}/g, referral.lastName)
      .replace(/\{firstName\}/g, firstDegreeInfo.firstName)
      .replace(/\{firstDegreeFirstName\}/g, firstDegreeInfo.firstName)
      .replace(/\{firstDegreeLastName\}/g, firstDegreeInfo.lastName)
      .replace(/\{refereeFirstName\}/g, referee?.firstName || '')
      .replace(/\{refereeLastName\}/g, referee?.lastName || '')
      .replace(/\{referralFirstName\}/g, capitalizeFirstLetter(referral.firstName))
      .replace(/\{referralLastName\}/g, referral.lastName)
      .replace(/\{statementSummary\}/g, refereeIntro)
      .replace(/\{link\}/g, link)

    return previewHtml
  }

  // Generate preview SMS with actual contact data substituted
  const getPreviewSms = () => {
    if (referrals.length === 0 || !editableSmsBody) {
      return editableSmsBody
    }

    const referral = referrals[previewContactIndex] || referrals[0]
    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/seconddegree/${refereeId}`

    // Use 3rd person statementSummary if available, then 1st person, otherwise build a fallback
    let refereeIntro = referee?.statementSummary3rdPerson || referee?.statementSummary || ''

    if (!refereeIntro) {
      // Fallback: Build the referee intro text from individual fields
      let skillsList: string[] = []
      if (referee?.skills) {
        try {
          skillsList = Array.isArray(referee.skills) ? referee.skills : JSON.parse(referee.skills)
        } catch {
          skillsList = [referee.skills]
        }
      }

      if (skillsList.length > 0) {
        refereeIntro = `${referee?.firstName} ${referee?.lastName} is great at ${skillsList.join(' and ')}.`
      }

      if (referee?.companyName || referee?.achievement || referee?.achievementMethod) {
        if (refereeIntro) refereeIntro += ' '

        if (referee?.companyName && referee?.achievement && referee?.achievementMethod) {
          refereeIntro += `${referee.firstName} has worked at ${referee.companyName} where they ${referee.achievement} by ${referee.achievementMethod}.`
        } else if (referee?.companyName && referee?.achievement) {
          refereeIntro += `${referee.firstName} has worked at ${referee.companyName} where they ${referee.achievement}.`
        } else if (referee?.companyName) {
          refereeIntro += `${referee.firstName} has worked at ${referee.companyName}.`
        }
      }

      if (referee?.introRequest) {
        if (refereeIntro) refereeIntro += ' '
        refereeIntro += `They would really appreciate ${referee.introRequest}.`
      }
    }

    // Replace template variables with actual values (capitalize first names)
    let previewSms = editableSmsBody
      .replace(/\{contactName\}/g, `${capitalizeFirstLetter(referral.firstName)} ${referral.lastName}`)
      .replace(/\{contactFirstName\}/g, capitalizeFirstLetter(referral.firstName))
      .replace(/\{contactLastName\}/g, referral.lastName)
      .replace(/\{firstName\}/g, firstDegreeInfo.firstName)
      .replace(/\{firstDegreeFirstName\}/g, firstDegreeInfo.firstName)
      .replace(/\{firstDegreeLastName\}/g, firstDegreeInfo.lastName)
      .replace(/\{refereeFirstName\}/g, referee?.firstName || '')
      .replace(/\{refereeLastName\}/g, referee?.lastName || '')
      .replace(/\{referralFirstName\}/g, capitalizeFirstLetter(referral.firstName))
      .replace(/\{referralLastName\}/g, referral.lastName)
      .replace(/\{statementSummary\}/g, refereeIntro)
      .replace(/\{link\}/g, link)

    return previewSms
  }

  // Fetch message templates on mount
  useEffect(() => {
    // Fetch EMAIL template - User Flow B uses REFERRAL_REQUEST
    fetch('/api/admin/message-templates?templateType=REFERRAL_REQUEST&messageChannel=EMAIL')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.templates && data.templates.length > 0) {
          const template = data.templates[0]
          setEmailSubject(template.subject || '')
          setMessageTemplate(template.bodyHtml || '')
          setEditableEmailSubject(template.subject || '')
          setEditableEmailBody(template.bodyHtml || '')
          const plainText = extractEditableParagraphs(template.bodyHtml || '')
          setEditableEmailBodyPlainText(plainText)
        }
      })
      .catch(err => console.error('Failed to fetch email template:', err))

    // Fetch SMS template - User Flow B uses REFERRAL_REQUEST
    fetch('/api/admin/message-templates?templateType=REFERRAL_REQUEST&messageChannel=SMS')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.templates && data.templates.length > 0) {
          const template = data.templates[0]
          setSmsTemplate(template.bodySms || '')
          setEditableSmsBody(template.bodySms || '')
        }
      })
      .catch(err => console.error('Failed to fetch SMS template:', err))
  }, [])

  useEffect(() => {
    // Fetch referee information, contact information (if contactId provided), and branding settings
    const fetchData = async () => {
      try {
        console.log('[FirstDegree Referee] Fetching referee with ID:', refereeId)
        const fetchPromises: Promise<Response>[] = [
          fetch(`/api/referee/${refereeId}`),
          fetch('/api/admin/branding')
        ]

        // Add contact fetch if contactId is provided
        if (contactId) {
          fetchPromises.push(fetch(`/api/contacts/${contactId}`))
        }

        const responses = await Promise.all(fetchPromises)
        const [refereeResponse, brandingResponse, contactResponse] = responses

        console.log('[FirstDegree Referee] Response status:', refereeResponse.status)

        if (refereeResponse.ok) {
          const data = await refereeResponse.json()
          console.log('[FirstDegree Referee] Full API response:', data)
          console.log('[FirstDegree Referee] Referee object:', data.referee)
          console.log('[FirstDegree Referee] Referee skills:', data.referee?.skills)
          console.log('[FirstDegree Referee] Skills type:', typeof data.referee?.skills)
          setReferee(data.referee)
        } else {
          console.error('[FirstDegree Referee] Failed to fetch referee:', await refereeResponse.text())
        }

        if (brandingResponse.ok) {
          const data = await brandingResponse.json()
          if (data.success && data.settings) {
            setBrandingSettings({
              flowBStep1Background: data.settings.flowBStep1Background || 'from-blue-400 via-purple-400 to-pink-400',
              flowBStep2Background: data.settings.flowBStep2Background || 'from-emerald-400 via-teal-400 to-cyan-400',
              flowBStep3Background: data.settings.flowBStep3Background || 'from-orange-400 via-rose-400 to-pink-400',
              flowBStep4Background: data.settings.flowBStep4Background || 'from-violet-400 via-purple-400 to-fuchsia-400',
              flowBStep1FormBg: data.settings.flowBStep1FormBg || 'white',
              flowBStep2FormBg: data.settings.flowBStep2FormBg || 'white',
              flowBStep3FormBg: data.settings.flowBStep3FormBg || 'white',
              flowBStep4FormBg: data.settings.flowBStep4FormBg || 'white',
              flowBStep1Name: data.settings.flowBStep1Name || 'Review request',
              flowBStep2Name: data.settings.flowBStep2Name || 'Suggest your contacts',
              flowBStep3Name: data.settings.flowBStep3Name || 'Review & send',
              flowBStep4Name: data.settings.flowBStep4Name || 'Track responses',
            })
          }
        }

        // Pre-populate contact information if contactId provided
        if (contactResponse && contactResponse.ok) {
          const data = await contactResponse.json()
          if (data.success && data.contact) {
            setFirstDegreeInfo({
              firstName: data.contact.firstName || '',
              lastName: data.contact.lastName || '',
              email: data.contact.email || '',
              phone: data.contact.phone || '',
            })
            setContactLoaded(true)
          }
        } else if (!contactId) {
          // If no contactId, check if user is logged in and pre-populate with their data
          console.log('[Pre-populate] No contactId provided, checking if user is logged in')
          try {
            const authResponse = await fetch('/api/auth/me')
            console.log('[Pre-populate] Auth response status:', authResponse.status)

            if (authResponse.ok) {
              const authData = await authResponse.json()
              console.log('[Pre-populate] Auth data:', authData)

              // /api/auth/me returns { success: true, user: { id, firstName, ... } }
              if (authData.success && authData.user) {
                console.log('[Pre-populate] User is logged in with ID:', authData.user.id)

                // User data is already in authData.user, no need for separate fetch
                console.log('[Pre-populate] Setting first degree info:', {
                  firstName: authData.user.firstName,
                  lastName: authData.user.lastName,
                  email: authData.user.email,
                  phone: authData.user.phone,
                })

                setFirstDegreeInfo({
                  firstName: authData.user.firstName || '',
                  lastName: authData.user.lastName || '',
                  email: authData.user.email || '',
                  phone: authData.user.phone || '',
                })
                setFirstDegreeUserId(authData.user.id)
                setContactLoaded(true)
                setIsLoggedIn(true)
                console.log('[Pre-populate] Successfully pre-populated user data')

                // Fetch connections for logged-in user
                fetch('/api/connections')
                  .then(res => res.json())
                  .then(data => {
                    if (data.success && data.connections && data.connections.length > 0) {
                      setExistingConnections(data.connections)
                      setHasExistingConnections(true)
                    }
                  })
                  .catch(err => console.error('Failed to fetch connections:', err))
              } else {
                console.log('[Pre-populate] User not authenticated or invalid auth data')
              }
            } else {
              console.log('[Pre-populate] Auth response not ok (user not logged in)')
            }
          } catch (authError) {
            console.error('[Pre-populate] Error fetching logged-in user data:', authError)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (refereeId) {
      fetchData()
    }
  }, [refereeId, contactId])

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Only create account and send magic link if user is NOT already logged in
    if (!isLoggedIn && firstDegreeInfo.email) {
      try {
        // Create account (or get existing user) and send magic link
        const createAccountResponse = await fetch('/api/firstdegree/create-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: firstDegreeInfo.firstName,
            lastName: firstDegreeInfo.lastName,
            email: firstDegreeInfo.email,
            phone: firstDegreeInfo.phone || undefined,
            refereeUsername: refereeId,
          }),
        })

        if (createAccountResponse.ok) {
          const accountData = await createAccountResponse.json()
          if (accountData.userId) {
            setFirstDegreeUserId(accountData.userId)

            // Fetch existing contacts/referrals for this user
            const contactsResponse = await fetch(`/api/contacts?userId=${accountData.userId}`)
            if (contactsResponse.ok) {
              const contactsData = await contactsResponse.json()
              if (contactsData.contacts && contactsData.contacts.length > 0) {
                setExistingReferrals(contactsData.contacts)
                setHasExistingReferrals(true)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error creating account:', error)
      }
    } else if (isLoggedIn && firstDegreeUserId) {
      // User is logged in, just fetch their existing contacts
      try {
        const contactsResponse = await fetch(`/api/contacts?userId=${firstDegreeUserId}`)
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json()
          if (contactsData.contacts && contactsData.contacts.length > 0) {
            setExistingReferrals(contactsData.contacts)
            setHasExistingReferrals(true)
          }
        }
      } catch (error) {
        console.error('Error fetching contacts:', error)
      }
    }

    setDirection('down')
    setStep(2)
  }

  const handleLoadPreviousReferrals = () => {
    if (existingReferrals.length > 0) {
      setReferrals(existingReferrals.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email || '',
        phone: c.phone || '',
        company: c.company || '',
        linkedUser: c.linkedUser || null,
      })))
    }
  }

  const handleLoadConnections = () => {
    const loadedReferrals: typeof referrals = []

    // Track which user IDs and emails we've already added (to avoid duplicates)
    const addedUserIds = new Set<string>()
    const addedEmails = new Set<string>()

    // First, add all connections (platform users)
    existingConnections.forEach(conn => {
      addedUserIds.add(conn.id)
      if (conn.email) {
        addedEmails.add(conn.email.toLowerCase())
      }
      loadedReferrals.push({
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

    // Then add existing referrals that aren't already in connections
    existingReferrals.forEach(c => {
      // Skip if this referral is linked to a user we've already added
      if (c.linkedUser?.id && addedUserIds.has(c.linkedUser.id)) {
        return
      }

      // Skip if this referral has the same email as someone we've already added
      if (c.email && addedEmails.has(c.email.toLowerCase())) {
        return
      }

      // Track this email to avoid duplicates within referrals
      if (c.email) {
        addedEmails.add(c.email.toLowerCase())
      }

      loadedReferrals.push({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email || '',
        phone: c.phone || '',
        company: c.company || '',
        linkedUser: c.linkedUser || null,
      })
    })

    if (loadedReferrals.length > 0) {
      setReferrals(loadedReferrals)
    }
    setHasLoadedConnections(true)
  }

  const toggleEditReferral = (index: number) => {
    setEditingReferralIndices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const isLoadedReferral = (referral: typeof referrals[0]) => {
    return referral.firstName && referral.lastName && (referral.linkedUser || referral.email || referral.phone)
  }

  const handleAddReferral = () => {
    setReferrals([
      ...referrals,
      { firstName: '', lastName: '', email: '', phone: '', company: '' },
    ])
  }

  const handleReferralChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newReferrals = [...referrals]
    newReferrals[index] = { ...newReferrals[index], [field]: value }
    setReferrals(newReferrals)
  }

  const handleRemoveReferral = (index: number) => {
    setReferrals(referrals.filter((_, i) => i !== index))
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessages([]) // Clear previous errors

    const validReferrals = referrals.filter(
      (r) => r.firstName && r.lastName && (r.email || r.phone)
    )

    if (validReferrals.length === 0) {
      setErrorMessages(['Please add at least one contact with their name and either email or phone number'])
      return
    }

    try {
      const response = await fetch('/api/firstdegree/add-referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refereeId,
          firstDegreeEmail: firstDegreeInfo.email,
          firstDegreePhone: firstDegreeInfo.phone,
          referrals: validReferrals,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setFirstDegreeUserId(data.firstDegreeUserId)

        // Update referrals with the IDs returned from the API
        const updatedReferrals = referrals.map((referral, index) => {
          const createdReferral = data.referrals[index]
          return {
            ...referral,
            id: createdReferral?.referralUser?.id || referral.id
          }
        })
        setReferrals(updatedReferrals)

        setErrorMessages([]) // Clear errors on success
        setDirection('down')
        setStep(3)
      } else {
        // Display detailed validation error messages if available
        if (data.messages && data.messages.length > 0) {
          setErrorMessages(data.messages)
        } else {
          setErrorMessages([data.error || 'Failed to add referrals'])
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setErrorMessages(['An unexpected error occurred. Please try again.'])
    }
  }

  const handleSendIntro = async (referralIndex?: number, navigateToSuccess = true) => {
    try {
      let referralIds: string[]

      if (referralIndex !== undefined) {
        // Send to specific contact
        referralIds = [referrals[referralIndex].id].filter(Boolean) as string[]
      } else {
        // Send to all unsent contacts
        referralIds = referrals
          .filter(r => r.id && !contactedIds.has(r.id))
          .map(r => r.id)
          .filter(Boolean) as string[]
      }

      if (referralIds.length === 0) {
        alert('All contacts have already been sent introductions!')
        return
      }

      const response = await fetch('/api/firstdegree/send-intros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refereeId,
          firstDegreeUserId,
          referralIds,
          sendViaEmail: true,
          sendViaSms: false,
          customEmailSubject: editableEmailSubject,
          customEmailBody: editableEmailBody,
          customSmsBody: editableSmsBody,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Mark these contacts as contacted
        setContactedIds(prev => {
          const newSet = new Set(prev)
          referralIds.forEach(id => newSet.add(id))
          return newSet
        })

        if (navigateToSuccess) {
          alert('Introductions sent successfully!')
          setDirection('down')
          setStep(4)
        }
      } else {
        alert(data.error || 'Failed to send introductions')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const getStepBackgroundClass = () => {
    let bg = brandingSettings.flowBStep1Background
    if (step === 2) bg = brandingSettings.flowBStep2Background
    if (step === 3) bg = brandingSettings.flowBStep3Background
    if (step === 4) bg = brandingSettings.flowBStep4Background
    if (bg.startsWith('#') || bg.startsWith('rgb')) return ''
    return bg
  }

  const getStepBackgroundStyle = () => {
    let bg = brandingSettings.flowBStep1Background
    if (step === 2) bg = brandingSettings.flowBStep2Background
    if (step === 3) bg = brandingSettings.flowBStep3Background
    if (step === 4) bg = brandingSettings.flowBStep4Background
    if (bg.startsWith('#') || bg.startsWith('rgb')) {
      return {
        backgroundColor: bg,
        transition: 'background-color 700ms ease-in-out'
      }
    }
    return {}
  }

  const getFormBackgroundStyle = () => {
    let bg = brandingSettings.flowBStep1FormBg
    if (step === 2) bg = brandingSettings.flowBStep2FormBg
    if (step === 3) bg = brandingSettings.flowBStep3FormBg
    if (step === 4) bg = brandingSettings.flowBStep4FormBg
    // If it's a Tailwind gradient class (contains "from-" etc), don't apply inline style
    if (bg.includes('from-') || bg.includes('to-') || bg.includes('via-')) {
      return {}
    }
    // Otherwise it's a color value (hex, rgb, or named color like "white")
    return { backgroundColor: bg }
  }

  const handleBack = (targetStep: number) => {
    setDirection('up')
    setStep(targetStep)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const stepTitles = [
    brandingSettings.flowBStep1Name,
    brandingSettings.flowBStep2Name,
    brandingSettings.flowBStep3Name,
    brandingSettings.flowBStep4Name
  ]

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-br ${getStepBackgroundClass()} transition-all duration-700 ease-in-out`}
      style={getStepBackgroundStyle()}
    >
      {/* Main Header */}
      <Header />

      {/* Progress Bar */}
      <MobileProgressBar currentStep={step} totalSteps={4} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="min-h-full flex items-center justify-center p-4 lg:p-8"
        >
          <div key={step} className="w-full max-w-3xl animate-fadeIn">
            <div className="backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12" style={getFormBackgroundStyle()}>
              {step === 1 && (
                <div>
                  {/* Referee Profile Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <a href={`/${referee?.username || refereeId}`} className="flex-shrink-0">
                      {referee?.profilePicture ? (
                        <img
                          src={referee.profilePicture}
                          alt={`${referee?.firstName} ${referee?.lastName}`}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-200 hover:ring-purple-400 transition-all"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl ring-2 ring-purple-200 hover:ring-purple-400 transition-all">
                          {referee?.firstName?.charAt(0)}{referee?.lastName?.charAt(0)}
                        </div>
                      )}
                    </a>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        <a
                          href={`/${referee?.username || refereeId}`}
                          className="hover:text-purple-600 transition-colors"
                        >
                          {referee?.firstName} {referee?.lastName}
                        </a>
                        {' '}would be most grateful for some intros
                      </h2>
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 mb-8">
                    NotWhatButWho makes it almost easy to connect people in your network.
                  </p>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4">How it works:</h3>
                    <ol className="space-y-3 text-gray-800">
                      <li className="flex items-start">
                        <span className="font-bold mr-2">1)</span>
                        <span>
                          {referee?.statementSummary3rdPerson ? (
                            referee.statementSummary3rdPerson
                          ) : referee?.statementSummary ? (
                            referee.statementSummary
                          ) : (
                            <>
                              {referee?.firstName} {referee?.lastName} is great at{' '}
                              {Array.isArray(referee?.skills) && referee.skills.length > 0
                                ? referee.skills.join(' and ')
                                : 'their unique skills'}.
                              {(referee?.companyName || referee?.achievement || referee?.achievementMethod) && (
                                <>
                                  {' '}{referee?.firstName} has worked at {referee?.companyName || 'their company'}
                                  {referee?.achievement && referee?.achievementMethod && (
                                    <> where they {referee.achievement} by {referee.achievementMethod}</>
                                  )}
                                  {referee?.achievement && !referee?.achievementMethod && (
                                    <> where they {referee.achievement}</>
                                  )}
                                  .
                                </>
                              )}
                              {referee?.introRequest && (
                                <> They would really appreciate {referee.introRequest}.</>
                              )}
                            </>
                          )}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">2)</span>
                        <span>
                          Can you help introduce {referee?.firstName} to people in your network?
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">3)</span>
                        <span>
                          Can you help? If so, complete their name/contact info on the next step, and we'll generate
                          a polite simple intro request. We will never share, sell or spam your contacts, and they can
                          opt out at any time.
                        </span>
                      </li>
                    </ol>
                  </div>

                  <form onSubmit={handleStep1Submit} className="space-y-6">
                    {isLoggedIn ? (
                      // Logged-in user - show simple welcome message, no input fields needed
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-green-900">
                              Welcome back, {firstDegreeInfo.firstName}!
                            </p>
                            <p className="text-sm text-green-700">
                              You're logged in and ready to help {referee?.firstName}.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : contactLoaded ? (
                      // Contact info pre-loaded from URL parameter
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <p className="text-sm font-semibold text-blue-900 mb-3">
                          Welcome back, {firstDegreeInfo.firstName}!
                        </p>
                        <div className="space-y-2 text-gray-700">
                          <p><strong>Name:</strong> {firstDegreeInfo.firstName} {firstDegreeInfo.lastName}</p>
                          {firstDegreeInfo.email && <p><strong>Email:</strong> {firstDegreeInfo.email}</p>}
                          {firstDegreeInfo.phone && <p><strong>Phone:</strong> {firstDegreeInfo.phone}</p>}
                        </div>
                      </div>
                    ) : (
                      // Show input fields if contact info not pre-loaded
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Your First Name
                            </label>
                            <input
                              type="text"
                              required
                              value={firstDegreeInfo.firstName}
                              onChange={(e) =>
                                setFirstDegreeInfo({
                                  ...firstDegreeInfo,
                                  firstName: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="First name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Your Last Name
                            </label>
                            <input
                              type="text"
                              required
                              value={firstDegreeInfo.lastName}
                              onChange={(e) =>
                                setFirstDegreeInfo({
                                  ...firstDegreeInfo,
                                  lastName: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Last name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Email
                          </label>
                          <input
                            type="email"
                            value={firstDegreeInfo.email}
                            onChange={(e) =>
                              setFirstDegreeInfo({
                                ...firstDegreeInfo,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="your.email@example.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            value={firstDegreeInfo.phone}
                            onChange={(e) =>
                              setFirstDegreeInfo({
                                ...firstDegreeInfo,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+1 555 123 4567"
                          />
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                    >
                      Continue to Add Contacts →
                    </button>
                  </form>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleStep2Submit}>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                    Who should {referee?.firstName} meet?
                  </h2>

                  {errorMessages.length > 0 && (
                    <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4">
                      <div className="flex items-start">
                        <svg className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-red-800 mb-2">Please fix the following:</h3>
                          <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                            {errorMessages.map((msg, index) => (
                              <li key={index}>{msg}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Load Connections Button */}
                  {hasExistingConnections && !hasLoadedConnections && referrals.length === 0 && (
                    <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            You have {existingConnections.length} connection{existingConnections.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            Load your connections to quickly add them
                          </p>
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

                  <div className="space-y-4 mb-6">
                    {referrals.map((referral, index) => {
                      const isLoaded = isLoadedReferral(referral)
                      const isEditing = editingReferralIndices.has(index)
                      const hasProfile = referral.linkedUser?.username

                      return (
                        <div
                          key={index}
                          className="border-2 border-gray-200 rounded-2xl p-6 bg-white"
                        >
                          {isLoaded ? (
                            // Rendered view for loaded referrals
                            <>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {/* Profile Picture */}
                                  {hasProfile ? (
                                    <a href={`/${referral.linkedUser?.username}`} className="flex-shrink-0">
                                      {referral.linkedUser?.profilePicture ? (
                                        <img
                                          src={referral.linkedUser.profilePicture}
                                          alt={`${referral.firstName} ${referral.lastName}`}
                                          className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-200 hover:ring-purple-400 transition-all"
                                        />
                                      ) : (
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-purple-200 hover:ring-purple-400 transition-all">
                                          {referral.firstName.charAt(0)}{referral.lastName.charAt(0)}
                                        </div>
                                      )}
                                    </a>
                                  ) : (
                                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg flex-shrink-0">
                                      {referral.firstName.charAt(0)}{referral.lastName.charAt(0)}
                                    </div>
                                  )}

                                  {/* Name and Contact Info */}
                                  <div className="flex-1">
                                    {hasProfile ? (
                                      <a
                                        href={`/${referral.linkedUser?.username}`}
                                        className="text-lg font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                                      >
                                        {referral.firstName} {referral.lastName}
                                      </a>
                                    ) : (
                                      <p className="text-lg font-semibold text-gray-900">
                                        {referral.firstName} {referral.lastName}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                                      {referral.email && (
                                        <span className="flex items-center gap-1">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                          </svg>
                                          {referral.email}
                                        </span>
                                      )}
                                      {referral.phone && (
                                        <span className="flex items-center gap-1">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                          </svg>
                                          {referral.phone}
                                        </span>
                                      )}
                                      {referral.company && (
                                        <span className="flex items-center gap-1">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                          </svg>
                                          {referral.company}
                                        </span>
                                      )}
                                      {!referral.email && !referral.phone && (
                                        <span className="text-amber-600 italic">No contact info</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => toggleEditReferral(index)}
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
                                    onClick={() => handleRemoveReferral(index)}
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
                                      value={referral.email}
                                      onChange={(e) => handleReferralChange(index, 'email', e.target.value)}
                                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                                      placeholder="email@example.com"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Phone
                                    </label>
                                    <input
                                      type="tel"
                                      value={referral.phone}
                                      onChange={(e) => handleReferralChange(index, 'phone', e.target.value)}
                                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                                      placeholder="+1 (555) 000-0000"
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            // Full input form for new empty referrals
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                  </label>
                                  <input
                                    type="text"
                                    value={referral.firstName}
                                    onChange={(e) =>
                                      handleReferralChange(
                                        index,
                                        'firstName',
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="First name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                  </label>
                                  <input
                                    type="text"
                                    value={referral.lastName}
                                    onChange={(e) =>
                                      handleReferralChange(
                                        index,
                                        'lastName',
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Last name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                  </label>
                                  <input
                                    type="email"
                                    value={referral.email}
                                    onChange={(e) =>
                                      handleReferralChange(index, 'email', e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="email@example.com"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                  </label>
                                  <input
                                    type="tel"
                                    value={referral.phone}
                                    onChange={(e) =>
                                      handleReferralChange(index, 'phone', e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+1 555 123 4567"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company
                                  </label>
                                  <input
                                    type="text"
                                    value={referral.company}
                                    onChange={(e) =>
                                      handleReferralChange(
                                        index,
                                        'company',
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Company name"
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveReferral(index)}
                                className="mt-3 text-red-600 text-sm font-medium hover:text-red-800"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      )
                    })}

                    {hasExistingReferrals && referrals.length === 0 && !hasExistingConnections && (
                      <button
                        type="button"
                        onClick={handleLoadPreviousReferrals}
                        className="w-full bg-blue-50 border-2 border-blue-300 rounded-lg py-4 text-blue-700 hover:bg-blue-100 hover:border-blue-400 font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Load Previous Contacts ({existingReferrals.length})
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleAddReferral}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 font-medium transition-colors"
                    >
                      + Add Another Person
                    </button>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleBack(1)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                    >
                      Continue →
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                    Review & Send Introductions
                  </h2>

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
                        {referrals.length > 0 && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Preview as:</label>
                            <select
                              value={previewContactIndex}
                              onChange={(e) => setPreviewContactIndex(Number(e.target.value))}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {referrals.map((referral, index) => (
                                <option key={index} value={index}>
                                  {referral.firstName} {referral.lastName}
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
                                  Available variables: {'{contactFirstName}'}, {'{referralFirstName}'}, {'{referralLastName}'}, {'{firstDegreeFirstName}'}, {'{firstDegreeLastName}'}, {'{refereeFirstName}'}, {'{statementSummary}'}, {'{link}'}
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
                                    {editableSmsBody.length} / 160 characters • Variables: {'{contactFirstName}'}, {'{referralFirstName}'}, {'{referralLastName}'}, {'{firstDegreeFirstName}'}, {'{firstDegreeLastName}'}, {'{refereeFirstName}'}, {'{link}'}
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
                        {referrals.length === 0 && (
                          <p className="text-gray-600 text-center py-4">
                            No contacts found. Please go back and add contacts.
                          </p>
                        )}
                        {referrals.map((referral, index) => {
                          const isContacted = referral.id && contactedIds.has(referral.id)
                          const hasProfile = referral.linkedUser?.username

                          return (
                            <div
                              key={referral.id || index}
                              className="flex items-center gap-4 bg-white border-2 border-gray-200 rounded-xl p-4"
                            >
                              {/* Profile Picture / Avatar */}
                              {hasProfile ? (
                                <a href={`/${referral.linkedUser?.username}`} className="flex-shrink-0">
                                  {referral.linkedUser?.profilePicture ? (
                                    <img
                                      src={referral.linkedUser.profilePicture}
                                      alt={`${referral.firstName} ${referral.lastName}`}
                                      className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200 hover:ring-purple-400 transition-all"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold ring-2 ring-purple-200 hover:ring-purple-400 transition-all">
                                      {referral.firstName.charAt(0)}{referral.lastName.charAt(0)}
                                    </div>
                                  )}
                                </a>
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
                                  {referral.firstName.charAt(0)}{referral.lastName.charAt(0)}
                                </div>
                              )}

                              <div className="flex-1 grid grid-cols-4 gap-3 items-center">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Name</p>
                                  {hasProfile ? (
                                    <a
                                      href={`/${referral.linkedUser?.username}`}
                                      className="font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                                    >
                                      {referral.firstName} {referral.lastName}
                                    </a>
                                  ) : (
                                    <p className="font-semibold text-gray-900">
                                      {referral.firstName} {referral.lastName}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Email</p>
                                  <p className="text-sm text-gray-700">
                                    {referral.email || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                                  <p className="text-sm text-gray-700">
                                    {referral.phone || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Company</p>
                                  <p className="text-sm text-gray-700">
                                    {referral.company || '-'}
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
                                  onClick={() => handleSendIntro(index, false)}
                                  className="bg-gradient-to-r from-orange-500 to-rose-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                  Send Intro
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {referrals.filter(r => r.id && !contactedIds.has(r.id)).length > 0 && (
                      <button
                        onClick={() => handleSendIntro()}
                        className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 mb-4"
                      >
                        Send to All Remaining ({referrals.filter(r => r.id && !contactedIds.has(r.id)).length}) →
                      </button>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleBack(2)}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => {
                          setDirection('down')
                          setStep(4)
                        }}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-rose-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <svg
                      className="mx-auto h-20 w-20 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-gray-900">
                    Introductions Sent!
                  </h2>
                  <p className="text-lg text-gray-700 mb-8">
                    Thank you for helping {referee?.firstName}! Your referrals will
                    receive the introduction request.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-gray-900">Loading...</h1>
      </div>
    </div>
  )
}

export default function FirstDegreePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FirstDegreeContent />
    </Suspense>
  )
}
