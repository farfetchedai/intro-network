'use client'

import { useState, useEffect } from 'react'

interface Step1FormProps {
  formData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    countryCode: string
    skills: string[]
    companyName: string
    achievement: string
    achievementMethod: string
    introRequest: string
  }
  onFormDataChange: (data: any) => void
  onSubmit: (e: React.FormEvent) => void
}

// Sort alphabetically by country name, but keep US first
const allCountryCodes = [
  { code: '+213', country: 'Algeria' },
  { code: '+54', country: 'Argentina' },
  { code: '+61', country: 'Australia' },
  { code: '+43', country: 'Austria' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+32', country: 'Belgium' },
  { code: '+55', country: 'Brazil' },
  { code: '+1', country: 'Canada' },
  { code: '+56', country: 'Chile' },
  { code: '+86', country: 'China' },
  { code: '+57', country: 'Colombia' },
  { code: '+506', country: 'Costa Rica' },
  { code: '+53', country: 'Cuba' },
  { code: '+420', country: 'Czech Republic' },
  { code: '+45', country: 'Denmark' },
  { code: '+1-809', country: 'Dominican Republic' },
  { code: '+593', country: 'Ecuador' },
  { code: '+20', country: 'Egypt' },
  { code: '+503', country: 'El Salvador' },
  { code: '+251', country: 'Ethiopia' },
  { code: '+358', country: 'Finland' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+233', country: 'Ghana' },
  { code: '+30', country: 'Greece' },
  { code: '+502', country: 'Guatemala' },
  { code: '+504', country: 'Honduras' },
  { code: '+852', country: 'Hong Kong' },
  { code: '+91', country: 'India' },
  { code: '+62', country: 'Indonesia' },
  { code: '+98', country: 'IR' },
  { code: '+964', country: 'Iraq' },
  { code: '+353', country: 'Ireland' },
  { code: '+972', country: 'Israel' },
  { code: '+39', country: 'Italy' },
  { code: '+225', country: 'Ivory Coast' },
  { code: '+1-876', country: 'Jamaica' },
  { code: '+81', country: 'Japan' },
  { code: '+962', country: 'Jordan' },
  { code: '+254', country: 'Kenya' },
  { code: '+961', country: 'Lebanon' },
  { code: '+218', country: 'Libya' },
  { code: '+60', country: 'Malaysia' },
  { code: '+52', country: 'Mexico' },
  { code: '+212', country: 'Morocco' },
  { code: '+977', country: 'Nepal' },
  { code: '+31', country: 'Netherlands' },
  { code: '+64', country: 'New Zealand' },
  { code: '+505', country: 'Nicaragua' },
  { code: '+234', country: 'Nigeria' },
  { code: '+47', country: 'Norway' },
  { code: '+92', country: 'Pakistan' },
  { code: '+507', country: 'Panama' },
  { code: '+51', country: 'Peru' },
  { code: '+63', country: 'Philippines' },
  { code: '+48', country: 'Poland' },
  { code: '+351', country: 'Portugal' },
  { code: '+7', country: 'Russia' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+221', country: 'Senegal' },
  { code: '+65', country: 'Singapore' },
  { code: '+27', country: 'South Africa' },
  { code: '+82', country: 'South Korea' },
  { code: '+34', country: 'Spain' },
  { code: '+94', country: 'Sri Lanka' },
  { code: '+46', country: 'Sweden' },
  { code: '+41', country: 'Switzerland' },
  { code: '+886', country: 'Taiwan' },
  { code: '+255', country: 'Tanzania' },
  { code: '+66', country: 'Thailand' },
  { code: '+216', country: 'Tunisia' },
  { code: '+90', country: 'Turkey' },
  { code: '+256', country: 'Uganda' },
  { code: '+971', country: 'United Arab Emirates' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+58', country: 'Venezuela' },
  { code: '+84', country: 'Vietnam' },
]

// Put United States first, then the rest alphabetically
const countryCodes = [
  { code: '+1', country: 'United States' },
  ...allCountryCodes
]

export default function Step1Form({ formData, onFormDataChange, onSubmit }: Step1FormProps) {
  // Dropdown state for country code selector
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Track completion status for each paragraph
  const isParagraph1Complete = formData.firstName?.trim() !== '' && formData.lastName?.trim() !== ''
  const isParagraph2Complete = formData.email?.trim() !== '' || formData.phone?.trim() !== ''
  const isParagraph3Complete = formData.skills && formData.skills.length > 0 && formData.skills[0]?.trim() !== ''
  const isParagraph4Complete =
    formData.companyName?.trim() !== '' &&
    formData.achievement?.trim() !== '' &&
    formData.achievementMethod?.trim() !== ''
  const isParagraph5Complete = formData.introRequest?.trim() !== ''

  const addSkill = () => {
    onFormDataChange({
      ...formData,
      skills: [...(formData.skills || ['']), '']
    })
  }

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...(formData.skills || [''])]
    newSkills[index] = value
    onFormDataChange({
      ...formData,
      skills: newSkills
    })
  }

  const removeSkill = (index: number) => {
    const newSkills = (formData.skills || ['']).filter((_, i) => i !== index)
    onFormDataChange({
      ...formData,
      skills: newSkills.length > 0 ? newSkills : ['']
    })
  }

  return (
    <form onSubmit={onSubmit} className="form-bg space-y-6 md:space-y-8">
      {/* Paragraph 1: Name */}
      <div className="flex items-start gap-3">
        {isParagraph1Complete ? (
          <svg className="w-6 h-6 md:w-8 md:h-8 text-green-500 flex-shrink-0 mt-1 md:mt-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 flex-shrink-0 mt-1 md:mt-2" />
        )}
        <div className="flex-1">
          {/* Desktop view - paragraph style */}
          <p className="hidden md:block userflow-step1-text text-xl text-gray-800 leading-relaxed">
            I am{' '}
            <input
              type="text"
              required
              value={formData.firstName || ''}
              onChange={(e) => onFormDataChange({ ...formData, firstName: e.target.value })}
              className="userflow-step1-name inline-block w-32 px-3 py-1 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 bg-transparent"
              placeholder="First name"
            />
            {' '}
            <input
              type="text"
              required
              value={formData.lastName || ''}
              onChange={(e) => onFormDataChange({ ...formData, lastName: e.target.value })}
              className="userflow-step1-name inline-block w-32 px-3 py-1 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 bg-transparent"
              placeholder="Last name"
            />
            .
          </p>

          {/* Mobile/Tablet view - vertical stack */}
          <div className="md:hidden space-y-3">
            <p className="text-base text-gray-800 font-medium">I am</p>
            <input
              type="text"
              required
              value={formData.firstName || ''}
              onChange={(e) => onFormDataChange({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
              placeholder="First name"
            />
            <input
              type="text"
              required
              value={formData.lastName || ''}
              onChange={(e) => onFormDataChange({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
              placeholder="Last name"
            />
          </div>
        </div>
      </div>

      {/* Paragraph 2: Contact Info */}
      <div className="flex items-start gap-3">
        {isParagraph2Complete ? (
          <svg className="w-6 h-6 md:w-8 md:h-8 text-green-500 flex-shrink-0 mt-1 md:mt-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 flex-shrink-0 mt-1 md:mt-2" />
        )}
        <div className="flex-1">
          {/* Desktop view - paragraph style */}
          <p className="hidden md:block userflow-step1-text text-xl text-gray-800 leading-relaxed">
            Reach me at{' '}
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
              className="userflow-step1-email inline-block w-48 px-3 py-1 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 bg-transparent"
              placeholder="email@example.com"
            />
            {' '}or {' '}
            <span className="relative inline-block">
              <input
                type="text"
                value={formData.countryCode || '+1'}
                onChange={(e) => onFormDataChange({ ...formData, countryCode: e.target.value })}
                onFocus={() => setIsDropdownOpen(true)}
                className="inline-block w-16 px-2 py-1 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 bg-transparent cursor-pointer"
                placeholder="+1"
                readOnly
              />
              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto z-20">
                    {countryCodes.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          onFormDataChange({ ...formData, countryCode: item.code })
                          setIsDropdownOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors text-sm text-gray-900"
                      >
                        <span className="font-semibold">{item.code}</span> {item.country}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </span>
            {' '}
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
              className="userflow-step1-phone inline-block w-40 px-3 py-1 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 bg-transparent"
              placeholder="555 123 4567"
            />
            .
          </p>

          {/* Mobile/Tablet view - vertical stack */}
          <div className="md:hidden space-y-3">
            <p className="text-base text-gray-800 font-medium">Reach me at</p>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
              placeholder="email@example.com"
            />
            <p className="text-base text-gray-800 font-medium">or</p>
            <div className="flex gap-2">
              <div className="relative flex-shrink-0">
                <input
                  type="text"
                  value={formData.countryCode || '+1'}
                  onChange={(e) => onFormDataChange({ ...formData, countryCode: e.target.value })}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900 cursor-pointer"
                  placeholder="+1"
                  readOnly
                />
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto z-20">
                      {countryCodes.map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            onFormDataChange({ ...formData, countryCode: item.code })
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors text-sm text-gray-900"
                        >
                          <span className="font-semibold">{item.code}</span> {item.country}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
                placeholder="555 123 4567"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Paragraph 3: Skills */}
      <div className="flex items-start gap-3">
        {isParagraph3Complete ? (
          <svg className="w-6 h-6 md:w-8 md:h-8 text-green-500 flex-shrink-0 mt-1 md:mt-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 flex-shrink-0 mt-1 md:mt-2" />
        )}
        <div className="flex-1">
          {/* Desktop view - paragraph style */}
          <p className="hidden md:flex userflow-step1-text text-xl text-gray-800 leading-relaxed flex-wrap items-center gap-2">
            <span>I'm really good at</span>
            {(formData.skills || ['']).map((skill, index) => (
              <span key={index} className="inline-flex items-center gap-1">
                <input
                  type="text"
                  required={index === 0}
                  value={skill || ''}
                  onChange={(e) => updateSkill(index, e.target.value)}
                  className="userflow-step1-skill inline-block w-40 px-3 py-1 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 bg-transparent"
                  placeholder="Skill"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-red-500 hover:text-red-700 ml-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                {index < (formData.skills || ['']).length - 1 && <span>and</span>}
              </span>
            ))}
            {(formData.skills || ['']).length < 2 && (
              <button
                type="button"
                onClick={addSkill}
                className="userflow-step1-addanotherskill inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Add one more skill</span>
              </button>
            )}
            .
          </p>

          {/* Mobile/Tablet view - vertical stack */}
          <div className="md:hidden space-y-3">
            <p className="text-base text-gray-800 font-medium">I'm really good at</p>
            {(formData.skills || ['']).map((skill, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  required={index === 0}
                  value={skill || ''}
                  onChange={(e) => updateSkill(index, e.target.value)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
                  placeholder={index === 0 ? "Your first skill" : "Another skill"}
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {(formData.skills || ['']).length < 2 && (
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors py-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <span>Add one more skill</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Paragraph 4: Experience */}
      <div className="flex items-start gap-3">
        {isParagraph4Complete ? (
          <svg className="w-6 h-6 md:w-8 md:h-8 text-green-500 flex-shrink-0 mt-1 md:mt-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 flex-shrink-0 mt-1 md:mt-2" />
        )}
        <div className="flex-1">
          {/* Desktop view - paragraph style */}
          <p className="hidden md:block userflow-step1-text text-xl text-gray-800 leading-relaxed">
            I've worked at{' '}
            <input
              type="text"
              required
              value={formData.companyName || ''}
              onChange={(e) => onFormDataChange({ ...formData, companyName: e.target.value })}
              className="userflow-step1-company inline-block w-40 px-3 py-1 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 bg-transparent"
              placeholder="Company"
            />
            {' '}where I{' '}
            <input
              type="text"
              required
              value={formData.achievement || ''}
              onChange={(e) => onFormDataChange({ ...formData, achievement: e.target.value })}
              className="userflow-step1-achievment inline-block w-56 px-3 py-1 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 bg-transparent"
              placeholder="achievement"
            />
            {' '}by{' '}
            <input
              type="text"
              required
              value={formData.achievementMethod || ''}
              onChange={(e) => onFormDataChange({ ...formData, achievementMethod: e.target.value })}
              className="userflow-step1-method inline-block w-56 px-3 py-1 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 bg-transparent"
              placeholder="what you did"
            />
            .
          </p>

          {/* Mobile/Tablet view - vertical stack */}
          <div className="md:hidden space-y-3">
            <p className="text-base text-gray-800 font-medium">I've worked at</p>
            <input
              type="text"
              required
              value={formData.companyName || ''}
              onChange={(e) => onFormDataChange({ ...formData, companyName: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
              placeholder="Company name"
            />
            <p className="text-base text-gray-800 font-medium">where I</p>
            <input
              type="text"
              required
              value={formData.achievement || ''}
              onChange={(e) => onFormDataChange({ ...formData, achievement: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
              placeholder="Your achievement"
            />
            <p className="text-base text-gray-800 font-medium">by</p>
            <input
              type="text"
              required
              value={formData.achievementMethod || ''}
              onChange={(e) => onFormDataChange({ ...formData, achievementMethod: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
              placeholder="What you did"
            />
          </div>
        </div>
      </div>

      {/* Paragraph 5: Intro Request */}
      <div className="flex items-start gap-3">
        {isParagraph5Complete ? (
          <svg className="w-6 h-6 md:w-8 md:h-8 text-green-500 flex-shrink-0 mt-1 md:mt-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 flex-shrink-0 mt-1 md:mt-2" />
        )}
        <div className="flex-1">
          {/* Desktop view - paragraph style */}
          <p className="hidden md:block userflow-step1-text text-xl text-gray-800 leading-relaxed">
            I'd love intros to{' '}
            <input
              type="text"
              required
              value={formData.introRequest || ''}
              onChange={(e) => onFormDataChange({ ...formData, introRequest: e.target.value })}
              className="userflow-step1-introrequest inline-block w-96 px-3 py-1 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 bg-transparent"
              placeholder="Roles, sectors or people"
            />
            .
          </p>

          {/* Mobile/Tablet view - vertical stack */}
          <div className="md:hidden space-y-3">
            <p className="text-base text-gray-800 font-medium">I'd love intros to</p>
            <input
              type="text"
              required
              value={formData.introRequest || ''}
              onChange={(e) => onFormDataChange({ ...formData, introRequest: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
              placeholder="Roles, sectors or people"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 md:py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 mt-6 md:mt-8"
      >
        Continue to Add Contacts →
      </button>
    </form>
  )
}
