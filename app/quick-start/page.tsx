'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function QuickStartPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Contact form
  const [contacts, setContacts] = useState<Array<{
    id?: string
    firstName: string
    lastName: string
    email: string
    phone: string
    company: string
  }>>([])

  // Branding settings
  const [brandingSettings, setBrandingSettings] = useState({
    step2Background: 'from-emerald-400 via-teal-400 to-cyan-400',
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const authResponse = await fetch('/api/auth/me')
        if (authResponse.ok) {
          const authData = await authResponse.json()
          if (authData.success && authData.userId) {
            setUserId(authData.userId)
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }

      // Fetch branding settings
      fetch('/api/branding')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.settings) {
            setBrandingSettings({
              step2Background: data.settings.step2Background,
            })
          }
        })
        .catch(err => console.error('Failed to fetch branding settings:', err))
        .finally(() => setIsLoading(false))
    }

    loadUserData()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
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

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, contacts: validContacts }),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/referee?step=3')
      } else {
        alert(data.error || 'Failed to add contacts')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const getStepBackgroundClass = () => {
    const bg = brandingSettings.step2Background
    if (bg.startsWith('#') || bg.startsWith('rgb')) {
      return ''
    }
    return bg
  }

  const getStepBackgroundStyle = () => {
    const bg = brandingSettings.step2Background
    if (bg.startsWith('#') || bg.startsWith('rgb')) {
      return { backgroundColor: bg }
    }
    return {}
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header />

      {/* Full-page centered background */}
      <main
        className={`flex-1 flex items-center justify-center bg-gradient-to-br ${getStepBackgroundClass()} flow-padding`}
        style={getStepBackgroundStyle()}
      >
        <div className="w-full max-w-4xl">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
              Add Contacts
            </h2>
            <p className="text-gray-600 mb-8 text-center text-lg">
              Who can help introduce you to people in their network?
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  onClick={() => router.push('/referee')}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  ← Go to Full Flow
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                >
                  Continue →
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
