'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RefereePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState('')

  // Step 1: User profile
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    statementSummary: '',
  })

  // Step 2: Contacts
  const [contacts, setContacts] = useState<Array<{
    firstName: string
    lastName: string
    email: string
    phone: string
    company: string
  }>>([])

  // Step 3: Message template
  const [messageTemplate, setMessageTemplate] = useState('')

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/referee/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setUserId(data.user.id)
        setMessageTemplate(
          `Hi {contactName},\n\nI'm reaching out to ask for your help. I'm looking to expand my network and I'd really appreciate if you could introduce me to some people in your network who might be interested in connecting.\n\nHere's a bit about me:\n${formData.statementSummary}\n\nWould you be willing to help? Just click the link below to add some contacts you think I should meet.\n\nThanks so much!\n${formData.firstName}`
        )
        setStep(2)
      } else {
        alert(data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
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
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: validContacts }),
      })

      const data = await response.json()

      if (data.success) {
        setStep(3)
      } else {
        alert(data.error || 'Failed to add contacts')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  const handleSendRequests = async (contactIds?: string[]) => {
    try {
      const response = await fetch('/api/referee/send-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactIds: contactIds || contacts.map((_, i) => i.toString()),
          customMessage: messageTemplate,
          sendViaEmail: true,
          sendViaSms: false,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Requests sent successfully!')
        setStep(4)
      } else {
        alert(data.error || 'Failed to send requests')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Get Introductions to Expand Your Network
            </h1>
            <div className="mt-4 flex items-center">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= s
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`w-16 h-1 ${
                        step > s ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <h2 className="text-2xl font-semibold mb-4">
                Step 1: Your Profile
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Statement Summary
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Top 2 skills, most recent company, most proud achievement
                    and what you did to achieve it
                  </p>
                  <textarea
                    required
                    rows={6}
                    value={formData.statementSummary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        statementSummary: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Example: Product Management & Growth Marketing at TechCo. Most proud of launching our mobile app which reached 1M users in 6 months through a combination of viral loops and strategic partnerships I built with key influencers."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Continue to Add Contacts
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit}>
              <h2 className="text-2xl font-semibold mb-4">
                Step 2: Add Your 1st Degree Contacts
              </h2>

              <div className="space-y-4">
                {contacts.map((contact, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={contact.firstName}
                          onChange={(e) =>
                            handleContactChange(
                              index,
                              'firstName',
                              e.target.value
                            )
                          }
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={contact.lastName}
                          onChange={(e) =>
                            handleContactChange(
                              index,
                              'lastName',
                              e.target.value
                            )
                          }
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) =>
                            handleContactChange(index, 'email', e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) =>
                            handleContactChange(index, 'phone', e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Company
                        </label>
                        <input
                          type="text"
                          value={contact.company}
                          onChange={(e) =>
                            handleContactChange(
                              index,
                              'company',
                              e.target.value
                            )
                          }
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(index)}
                      className="mt-2 text-red-600 text-sm hover:text-red-800"
                    >
                      Remove Contact
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddContact}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-gray-400 hover:text-gray-700"
                >
                  + Add Contact
                </button>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Continue to Customize Message
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Step 3: Customize Your Message
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edit the message that will be sent to your contacts:
                </label>
                <textarea
                  rows={10}
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Use {'{contactName}'} to personalize with each contact's name
                </p>
              </div>

              <h3 className="text-lg font-semibold mb-2">Your Contacts:</h3>
              <div className="space-y-2 mb-6">
                {contacts.map((contact, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border border-gray-200 rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {contact.email || contact.phone}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSendRequests([index.toString()])}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Ask Them
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={() => handleSendRequests()}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Ask Everyone
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-green-500"
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
              <h2 className="text-2xl font-semibold mb-4">
                Requests Sent Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your contacts will receive your request and can start adding
                their recommendations.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
