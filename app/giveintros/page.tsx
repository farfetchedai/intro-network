'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  company?: string | null
  linkedUser?: {
    id: string
    username: string | null
    firstName: string
    lastName: string
    profilePicture: string | null
    companyName: string | null
  } | null
}

interface Person {
  email: string
  name: string
  company: string
  context: string
  isFromContacts: boolean
  contactId?: string
  profilePicture?: string | null
}

type Step = 'select' | 'message' | 'preview'

export default function GiveIntrosPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<Step>('select')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [success, setSuccess] = useState(false)

  // Person A & B state
  const [personA, setPersonA] = useState<Person | null>(null)
  const [personB, setPersonB] = useState<Person | null>(null)
  const [message, setMessage] = useState('')

  // Form state for adding new person
  const [showPersonAForm, setShowPersonAForm] = useState(false)
  const [showPersonBForm, setShowPersonBForm] = useState(false)
  const [newPersonA, setNewPersonA] = useState({ email: '', name: '', company: '', context: '' })
  const [newPersonB, setNewPersonB] = useState({ email: '', name: '', company: '', context: '' })

  // Search state
  const [searchA, setSearchA] = useState('')
  const [searchB, setSearchB] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.user) {
          router.push('/login')
          return
        }
        setIsLoading(false)
        fetchContacts(data.user.id)
      })
      .catch(err => {
        console.error('Failed to check auth:', err)
        router.push('/login')
      })
  }, [router])

  const fetchContacts = async (uid: string) => {
    try {
      const response = await fetch(`/api/contacts?userId=${uid}`)
      const data = await response.json()
      if (data.contacts) {
        // Deduplicate by email
        const deduplicated = data.contacts.reduce((acc: Contact[], contact: Contact) => {
          if (contact.email) {
            const existingIndex = acc.findIndex(c => c.email?.toLowerCase() === contact.email?.toLowerCase())
            if (existingIndex !== -1) {
              if (contact.linkedUser && !acc[existingIndex].linkedUser) {
                acc[existingIndex] = contact
              }
              return acc
            }
          }
          acc.push(contact)
          return acc
        }, [])
        setContacts(deduplicated)
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err)
    }
  }

  const handleSelectContact = (contact: Contact, forPerson: 'A' | 'B') => {
    const person: Person = {
      email: contact.email || '',
      name: contact.linkedUser ? `${contact.linkedUser.firstName} ${contact.linkedUser.lastName}` : `${contact.firstName} ${contact.lastName}`,
      company: contact.linkedUser?.companyName || contact.company || '',
      context: '',
      isFromContacts: true,
      contactId: contact.id,
      profilePicture: contact.linkedUser?.profilePicture || null,
    }

    if (forPerson === 'A') {
      setPersonA(person)
      setShowPersonAForm(false)
      setSearchA('')
    } else {
      setPersonB(person)
      setShowPersonBForm(false)
      setSearchB('')
    }
  }

  const handleAddNewPerson = (forPerson: 'A' | 'B') => {
    if (forPerson === 'A') {
      if (!newPersonA.email || !newPersonA.name) return
      setPersonA({
        email: newPersonA.email,
        name: newPersonA.name,
        company: newPersonA.company,
        context: newPersonA.context,
        isFromContacts: false,
      })
      setShowPersonAForm(false)
      setNewPersonA({ email: '', name: '', company: '', context: '' })
    } else {
      if (!newPersonB.email || !newPersonB.name) return
      setPersonB({
        email: newPersonB.email,
        name: newPersonB.name,
        company: newPersonB.company,
        context: newPersonB.context,
        isFromContacts: false,
      })
      setShowPersonBForm(false)
      setNewPersonB({ email: '', name: '', company: '', context: '' })
    }
  }

  const handleClearPerson = (forPerson: 'A' | 'B') => {
    if (forPerson === 'A') {
      setPersonA(null)
    } else {
      setPersonB(null)
    }
  }

  const handleSwapPeople = () => {
    const tempA = personA
    setPersonA(personB)
    setPersonB(tempA)
  }

  const handleSendIntroduction = async () => {
    if (!personA || !personB || !message.trim()) return

    setIsSending(true)
    setError('')

    try {
      const response = await fetch('/api/introductions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personAEmail: personA.email,
          personAName: personA.name,
          personACompany: personA.company,
          personAContext: personA.context,
          personBEmail: personB.email,
          personBName: personB.name,
          personBCompany: personB.company,
          personBContext: personB.context,
          message: message.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to send introduction')
      }
    } catch (err) {
      console.error('Failed to send introduction:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSending(false)
    }
  }

  const filteredContactsA = contacts.filter(c => {
    if (!searchA.trim()) return true
    const query = searchA.toLowerCase()
    const name = c.linkedUser ? `${c.linkedUser.firstName} ${c.linkedUser.lastName}` : `${c.firstName} ${c.lastName}`
    return name.toLowerCase().includes(query) || (c.email && c.email.toLowerCase().includes(query))
  }).filter(c => c.id !== personB?.contactId) // Exclude selected person B

  const filteredContactsB = contacts.filter(c => {
    if (!searchB.trim()) return true
    const query = searchB.toLowerCase()
    const name = c.linkedUser ? `${c.linkedUser.firstName} ${c.linkedUser.lastName}` : `${c.firstName} ${c.lastName}`
    return name.toLowerCase().includes(query) || (c.email && c.email.toLowerCase().includes(query))
  }).filter(c => c.id !== personA?.contactId) // Exclude selected person A

  const canProceedToMessage = personA && personB && personA.email !== personB.email
  const canProceedToPreview = canProceedToMessage && message.trim().length > 0

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-gray-600 text-lg">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (success) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 py-12">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Introduction Sent!</h1>
              <p className="text-emerald-100">
                Your introduction has been sent to both {personA?.name} and {personB?.name}
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens next?</h3>
              <p className="text-gray-600 mb-6">
                Both parties will receive an email with your introduction message.
                If they accept, they'll be connected and you'll be notified.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setSuccess(false)
                    setPersonA(null)
                    setPersonB(null)
                    setMessage('')
                    setCurrentStep('select')
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Make Another Introduction
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-white mb-2">Give an Introduction</h1>
            <p className="text-blue-100">
              Connect two people who should meet each other
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep === 'select' ? 'text-blue-600' : 'text-emerald-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                currentStep === 'select' ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {currentStep !== 'select' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : '1'}
              </div>
              <span className="font-medium hidden sm:inline">Select People</span>
            </div>
            <div className={`w-12 h-0.5 ${currentStep !== 'select' ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${currentStep === 'message' ? 'text-blue-600' : currentStep === 'preview' ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                currentStep === 'message' ? 'bg-blue-600 text-white' :
                currentStep === 'preview' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep === 'preview' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : '2'}
              </div>
              <span className="font-medium hidden sm:inline">Write Message</span>
            </div>
            <div className={`w-12 h-0.5 ${currentStep === 'preview' ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className="font-medium hidden sm:inline">Preview & Send</span>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="max-w-4xl mx-auto px-4 mb-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-4xl mx-auto px-4 pb-8">
          {/* Step 1: Select People */}
          {currentStep === 'select' && (
            <div className="space-y-6">
              {/* Person A */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">A</span>
                  First Person
                </h3>

                {personA ? (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                      {personA.profilePicture ? (
                        <img src={personA.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        personA.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{personA.name}</p>
                      <p className="text-sm text-gray-600">{personA.email}</p>
                      {personA.company && <p className="text-sm text-gray-500">{personA.company}</p>}
                    </div>
                    <button
                      onClick={() => handleClearPerson('A')}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : showPersonAForm ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newPersonA.name}
                          onChange={(e) => setNewPersonA({ ...newPersonA, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={newPersonA.email}
                          onChange={(e) => setNewPersonA({ ...newPersonA, email: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={newPersonA.company}
                        onChange={(e) => setNewPersonA({ ...newPersonA, company: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Acme Inc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Context (optional)</label>
                      <input
                        type="text"
                        value={newPersonA.context}
                        onChange={(e) => setNewPersonA({ ...newPersonA, context: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="CEO, Investor, Marketing Expert..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowPersonAForm(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddNewPerson('A')}
                        disabled={!newPersonA.email || !newPersonA.name}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Person
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search your contacts..."
                          value={searchA}
                          onChange={(e) => setSearchA(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => setShowPersonAForm(true)}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New
                      </button>
                    </div>
                    {filteredContactsA.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
                        {filteredContactsA.map((contact) => {
                          const name = contact.linkedUser ? `${contact.linkedUser.firstName} ${contact.linkedUser.lastName}` : `${contact.firstName} ${contact.lastName}`
                          const company = contact.linkedUser?.companyName || contact.company
                          return (
                            <button
                              key={contact.id}
                              onClick={() => handleSelectContact(contact, 'A')}
                              className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                {contact.linkedUser?.profilePicture ? (
                                  <img src={contact.linkedUser.profilePicture} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{name}</p>
                                {contact.email && <p className="text-sm text-gray-500 truncate">{contact.email}</p>}
                              </div>
                              {company && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{company}</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
                        {searchA ? 'No contacts match your search' : 'No contacts yet'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              {(personA || personB) && (
                <div className="flex justify-center -my-2 relative z-10">
                  <button
                    onClick={handleSwapPeople}
                    disabled={!personA && !personB}
                    className="p-2 bg-white border-2 border-gray-200 rounded-full shadow-md hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    title="Swap people"
                  >
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Person B */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">B</span>
                  Second Person
                </h3>

                {personB ? (
                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold overflow-hidden">
                      {personB.profilePicture ? (
                        <img src={personB.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        personB.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{personB.name}</p>
                      <p className="text-sm text-gray-600">{personB.email}</p>
                      {personB.company && <p className="text-sm text-gray-500">{personB.company}</p>}
                    </div>
                    <button
                      onClick={() => handleClearPerson('B')}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : showPersonBForm ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newPersonB.name}
                          onChange={(e) => setNewPersonB({ ...newPersonB, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Jane Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={newPersonB.email}
                          onChange={(e) => setNewPersonB({ ...newPersonB, email: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="jane@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={newPersonB.company}
                        onChange={(e) => setNewPersonB({ ...newPersonB, company: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Tech Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Context (optional)</label>
                      <input
                        type="text"
                        value={newPersonB.context}
                        onChange={(e) => setNewPersonB({ ...newPersonB, context: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="CTO, Developer, Sales Lead..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowPersonBForm(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddNewPerson('B')}
                        disabled={!newPersonB.email || !newPersonB.name}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Person
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search your contacts..."
                          value={searchB}
                          onChange={(e) => setSearchB(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <button
                        onClick={() => setShowPersonBForm(true)}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New
                      </button>
                    </div>
                    {filteredContactsB.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
                        {filteredContactsB.map((contact) => {
                          const name = contact.linkedUser ? `${contact.linkedUser.firstName} ${contact.linkedUser.lastName}` : `${contact.firstName} ${contact.lastName}`
                          const company = contact.linkedUser?.companyName || contact.company
                          return (
                            <button
                              key={contact.id}
                              onClick={() => handleSelectContact(contact, 'B')}
                              className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                {contact.linkedUser?.profilePicture ? (
                                  <img src={contact.linkedUser.profilePicture} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{name}</p>
                                {contact.email && <p className="text-sm text-gray-500 truncate">{contact.email}</p>}
                              </div>
                              {company && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{company}</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
                        {searchB ? 'No contacts match your search' : 'No contacts yet'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Same email warning */}
              {personA && personB && personA.email === personB.email && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-amber-700">Both people have the same email address. Please select different people.</p>
                </div>
              )}

              {/* Continue Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep('message')}
                  disabled={!canProceedToMessage}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  Continue to Message
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Write Message */}
          {currentStep === 'message' && (
            <div className="space-y-6">
              {/* Selected People Summary */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Introducing</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                      {personA?.profilePicture ? (
                        <img src={personA.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        personA?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{personA?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{personA?.company || personA?.email}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div className="flex-1 flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                      {personB?.profilePicture ? (
                        <img src={personB.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        personB?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{personB?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{personB?.company || personB?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Write your introduction message</h3>
                <p className="text-gray-600 mb-4">
                  This message will be sent to both {personA?.name.split(' ')[0]} and {personB?.name.split(' ')[0]}.
                  Explain why you think they should meet!
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hey! I wanted to introduce you two because I think you'd have a lot to talk about...\n\n${personA?.name.split(' ')[0]}, ${personB?.name.split(' ')[0]} is great at...\n\n${personB?.name.split(' ')[0]}, ${personA?.name.split(' ')[0]} is working on...`}
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {message.length > 0 ? `${message.length} characters` : 'Write a personalized message to make your introduction meaningful'}
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('select')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('preview')}
                  disabled={!canProceedToPreview}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  Preview Introduction
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Send */}
          {currentStep === 'preview' && (
            <div className="space-y-6">
              {/* Preview Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center">
                  <h3 className="text-xl font-bold">Introduction Preview</h3>
                  <p className="text-blue-100 mt-1">This is how your introduction will appear</p>
                </div>

                <div className="p-6">
                  {/* People Cards */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 p-4 border border-blue-200 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                          {personA?.profilePicture ? (
                            <img src={personA.profilePicture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            personA?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{personA?.name}</p>
                          <p className="text-sm text-gray-600">{personA?.email}</p>
                          {personA?.company && <p className="text-sm text-gray-500">{personA.company}</p>}
                        </div>
                      </div>
                      {personA?.context && (
                        <p className="mt-3 text-sm text-gray-600 italic">{personA.context}</p>
                      )}
                    </div>

                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>

                    <div className="flex-1 p-4 border border-purple-200 bg-purple-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold overflow-hidden">
                          {personB?.profilePicture ? (
                            <img src={personB.profilePicture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            personB?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{personB?.name}</p>
                          <p className="text-sm text-gray-600">{personB?.email}</p>
                          {personB?.company && <p className="text-sm text-gray-500">{personB.company}</p>}
                        </div>
                      </div>
                      {personB?.context && (
                        <p className="mt-3 text-sm text-gray-600 italic">{personB.context}</p>
                      )}
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-3">Your Message</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-blue-800 font-medium">What happens when you send?</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Both {personA?.name.split(' ')[0]} and {personB?.name.split(' ')[0]} will receive an email with your introduction.
                    When they both accept, they'll be connected and you'll receive a notification.
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('message')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSendIntroduction}
                  disabled={isSending}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Introduction
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
