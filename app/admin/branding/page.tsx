'use client'

import { useEffect, useState } from 'react'

interface CardTheme {
  id?: string
  name: string
  pageBackground: string
  cardBackground: string
  textColor: string
  profilePictureBorder: string
  footerBackground: string
  footerTextColor: string
  buttonABackground: string
  buttonATextColor: string
  buttonBBackground: string
  buttonBTextColor: string
}

interface BrandingSettings {
  productName: string
  desktopLogo: string
  mobileLogo: string
  desktopSidebarLogo: string
  desktopHeaderLogo: string
  footerLogo: string
  favicon: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  step1Background: string
  step2Background: string
  step3Background: string
  step4Background: string
  // Flow A (/getintros) Step Backgrounds
  flowAStep1Background: string
  flowAStep2Background: string
  flowAStep3Background: string
  flowAStep1FormBg: string
  flowAStep2FormBg: string
  flowAStep3FormBg: string
  flowAStep1ButtonBg: string
  flowAStep2ButtonBg: string
  flowAStep3ButtonBg: string
  // Flow B (/firstdegree) Step Backgrounds
  flowBStep1Background: string
  flowBStep2Background: string
  flowBStep3Background: string
  flowBStep4Background: string
  flowBStep1FormBg: string
  flowBStep2FormBg: string
  flowBStep3FormBg: string
  flowBStep4FormBg: string
  flowBStep1ButtonBg: string
  flowBStep2ButtonBg: string
  flowBStep3ButtonBg: string
  flowBStep4ButtonBg: string
  // Flow C (/onboarding) Step Backgrounds
  flowCStep1Background: string
  flowCStep2Background: string
  flowCStep3Background: string
  flowCStep4Background: string
  flowCStep1FormBg: string
  flowCStep2FormBg: string
  flowCStep3FormBg: string
  flowCStep4FormBg: string
  flowCStep1ButtonBg: string
  flowCStep2ButtonBg: string
  flowCStep3ButtonBg: string
  flowCStep4ButtonBg: string
  // User Flow A (Referee) Step Names
  flowAStep1Name: string
  flowAStep2Name: string
  flowAStep3Name: string
  flowAStep4Name: string
  // User Flow B (First Degree) Step Names
  flowBStep1Name: string
  flowBStep2Name: string
  flowBStep3Name: string
  flowBStep4Name: string
  // User Flow C (Second Degree) Step Names
  flowCStep1Name: string
  flowCStep2Name: string
  flowCStep3Name: string
  flowCStep4Name: string
  // Profile Pages
  profilePageBackground: string
  profilePageFormBg: string
  // App/Dashboard Background
  appBackground: string
  // Business Card Color Swatches
  cardPageBgSwatches: string
  cardBoxBgSwatches: string
  cardTextSwatches: string
  // Legacy fields
  step1Name: string
  step2Name: string
  step3Name: string
  step4Name: string
  fontFamily: string
  headingFont: string
}

export default function BrandingPage() {
  const [settings, setSettings] = useState<BrandingSettings>({
    productName: 'Intro Network',
    desktopLogo: '',
    mobileLogo: '',
    desktopSidebarLogo: '',
    desktopHeaderLogo: '',
    footerLogo: '',
    favicon: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    accentColor: '#EC4899',
    step1Background: 'from-blue-400 via-purple-400 to-pink-400',
    step2Background: 'from-emerald-400 via-teal-400 to-cyan-400',
    step3Background: 'from-orange-400 via-rose-400 to-pink-400',
    step4Background: 'from-violet-400 via-purple-400 to-fuchsia-400',
    // Flow A (/getintros)
    flowAStep1Background: 'from-blue-400 via-purple-400 to-pink-400',
    flowAStep2Background: 'from-emerald-400 via-teal-400 to-cyan-400',
    flowAStep3Background: 'from-orange-400 via-rose-400 to-pink-400',
    flowAStep1FormBg: 'white',
    flowAStep2FormBg: 'white',
    flowAStep3FormBg: 'white',
    flowAStep1ButtonBg: '',
    flowAStep2ButtonBg: '',
    flowAStep3ButtonBg: '',
    // Flow B (/firstdegree)
    flowBStep1Background: 'from-blue-400 via-purple-400 to-pink-400',
    flowBStep2Background: 'from-emerald-400 via-teal-400 to-cyan-400',
    flowBStep3Background: 'from-orange-400 via-rose-400 to-pink-400',
    flowBStep4Background: 'from-violet-400 via-purple-400 to-fuchsia-400',
    flowBStep1FormBg: 'white',
    flowBStep2FormBg: 'white',
    flowBStep3FormBg: 'white',
    flowBStep4FormBg: 'white',
    flowBStep1ButtonBg: '',
    flowBStep2ButtonBg: '',
    flowBStep3ButtonBg: '',
    flowBStep4ButtonBg: '',
    // Flow C (/onboarding)
    flowCStep1Background: 'from-blue-400 via-purple-400 to-pink-400',
    flowCStep2Background: 'from-emerald-400 via-teal-400 to-cyan-400',
    flowCStep3Background: 'from-orange-400 via-rose-400 to-pink-400',
    flowCStep4Background: 'from-violet-400 via-purple-400 to-fuchsia-400',
    flowCStep1FormBg: 'white',
    flowCStep2FormBg: 'white',
    flowCStep3FormBg: 'white',
    flowCStep4FormBg: 'white',
    flowCStep1ButtonBg: '',
    flowCStep2ButtonBg: '',
    flowCStep3ButtonBg: '',
    flowCStep4ButtonBg: '',
    // User Flow A
    flowAStep1Name: 'Your Profile',
    flowAStep2Name: 'Your Network',
    flowAStep3Name: 'Referrals',
    flowAStep4Name: 'Complete',
    // User Flow B
    flowBStep1Name: 'Review request',
    flowBStep2Name: 'Suggest your contacts',
    flowBStep3Name: 'Review & send',
    flowBStep4Name: 'Track responses',
    // User Flow C
    flowCStep1Name: 'Review intro',
    flowCStep2Name: 'Accept or decline',
    flowCStep3Name: 'Connect',
    flowCStep4Name: 'Complete',
    // Profile Pages
    profilePageBackground: 'from-blue-400 via-purple-400 to-pink-400',
    profilePageFormBg: 'white',
    // App/Dashboard Background
    appBackground: 'from-blue-50 via-purple-50 to-pink-50',
    // Business Card Color Swatches
    cardPageBgSwatches: '["#f0f9ff", "#fef3c7", "#fce7f3", "#ecfdf5", "#f5f3ff", "#fef2f2"]',
    cardBoxBgSwatches: '["#ffffff", "#f9fafb", "#fef3c7", "#fce7f3", "#ecfdf5", "#1f2937"]',
    cardTextSwatches: '["#111827", "#374151", "#6b7280", "#ffffff", "#1e40af", "#7c3aed"]',
    // Legacy
    step1Name: 'Your Profile',
    step2Name: 'Your Network',
    step3Name: 'Referrals',
    step4Name: 'Complete',
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFont: 'Inter, system-ui, sans-serif',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customCSS, setCustomCSS] = useState('')
  const [themes, setThemes] = useState<CardTheme[]>([
    { name: 'Default', pageBackground: '#f0f9ff', cardBackground: '#ffffff', textColor: '#111827', profilePictureBorder: '#3b82f6', footerBackground: '#1f2937', footerTextColor: '#ffffff', buttonABackground: '#3b82f6', buttonATextColor: '#ffffff', buttonBBackground: '#10b981', buttonBTextColor: '#ffffff' },
    { name: 'Dark', pageBackground: '#1f2937', cardBackground: '#374151', textColor: '#f9fafb', profilePictureBorder: '#60a5fa', footerBackground: '#111827', footerTextColor: '#d1d5db', buttonABackground: '#60a5fa', buttonATextColor: '#1f2937', buttonBBackground: '#34d399', buttonBTextColor: '#1f2937' },
    { name: 'Warm', pageBackground: '#fef3c7', cardBackground: '#fffbeb', textColor: '#78350f', profilePictureBorder: '#f59e0b', footerBackground: '#92400e', footerTextColor: '#fef3c7', buttonABackground: '#f59e0b', buttonATextColor: '#ffffff', buttonBBackground: '#84cc16', buttonBTextColor: '#ffffff' },
    { name: 'Cool', pageBackground: '#ecfdf5', cardBackground: '#f0fdf4', textColor: '#064e3b', profilePictureBorder: '#10b981', footerBackground: '#065f46', footerTextColor: '#d1fae5', buttonABackground: '#10b981', buttonATextColor: '#ffffff', buttonBBackground: '#06b6d4', buttonBTextColor: '#ffffff' },
    { name: 'Rose', pageBackground: '#fce7f3', cardBackground: '#fdf2f8', textColor: '#831843', profilePictureBorder: '#ec4899', footerBackground: '#9d174d', footerTextColor: '#fce7f3', buttonABackground: '#ec4899', buttonATextColor: '#ffffff', buttonBBackground: '#f472b6', buttonBTextColor: '#ffffff' },
    { name: 'Purple', pageBackground: '#f5f3ff', cardBackground: '#faf5ff', textColor: '#4c1d95', profilePictureBorder: '#8b5cf6', footerBackground: '#5b21b6', footerTextColor: '#ede9fe', buttonABackground: '#8b5cf6', buttonATextColor: '#ffffff', buttonBBackground: '#a78bfa', buttonBTextColor: '#ffffff' },
  ])

  useEffect(() => {
    fetchSettings()
    fetchThemes()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/branding')
      const data = await response.json()
      if (data.success) {
        // Merge with defaults to ensure all fields have values (prevents uncontrolled input errors)
        setSettings(prev => ({
          ...prev,
          ...data.settings,
          // Ensure new fields have defaults if not in database yet
          profilePageBackground: data.settings.profilePageBackground || 'from-blue-400 via-purple-400 to-pink-400',
          profilePageFormBg: data.settings.profilePageFormBg || 'white',
          appBackground: data.settings.appBackground || 'from-blue-50 via-purple-50 to-pink-50',
          cardPageBgSwatches: data.settings.cardPageBgSwatches || '["#f0f9ff", "#fef3c7", "#fce7f3", "#ecfdf5", "#f5f3ff", "#fef2f2"]',
          cardBoxBgSwatches: data.settings.cardBoxBgSwatches || '["#ffffff", "#f9fafb", "#fef3c7", "#fce7f3", "#ecfdf5", "#1f2937"]',
          cardTextSwatches: data.settings.cardTextSwatches || '["#111827", "#374151", "#6b7280", "#ffffff", "#1e40af", "#7c3aed"]',
        }))
        setCustomCSS(data.customCSS || '')
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/admin/themes')
      const data = await response.json()
      if (data.success && data.themes.length > 0) {
        setThemes(data.themes)
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error)
    }
  }

  const handleSaveThemes = async () => {
    try {
      const response = await fetch('/api/admin/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themes }),
      })
      const data = await response.json()
      if (data.success) {
        setThemes(data.themes)
        alert('Themes saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save themes:', error)
      alert('Failed to save themes')
    }
  }

  const updateTheme = (index: number, field: keyof CardTheme, value: string) => {
    setThemes(prev => prev.map((theme, i) =>
      i === index ? { ...theme, [field]: value } : theme
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, customCSS }),
      })
      const data = await response.json()
      if (data.success) {
        alert('Settings saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (field: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('field', field)

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (data.success) {
        setSettings({ ...settings, [field]: data.url })
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      alert('Failed to upload file')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Branding Settings</h1>
        <p className="text-gray-600 mt-2">Customize logos, colors, and styles</p>
      </div>

      {/* Product Name Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Product Name</h2>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name
          </label>
          <p className="text-xs text-gray-500 mb-2">This will be displayed in the header and footer when no logo is present</p>
          <input
            type="text"
            value={settings.productName}
            onChange={(e) => setSettings({ ...settings, productName: e.target.value })}
            placeholder="Intro Network"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
      </div>

      {/* Logos Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Logos & Icons</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desktop Sidebar Logo
            </label>
            <p className="text-xs text-gray-500 mb-2">Used in the sidebar during user flow</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {settings.desktopSidebarLogo ? (
                <img src={settings.desktopSidebarLogo} alt="Desktop Sidebar Logo" className="max-h-20 mx-auto mb-2" />
              ) : (
                <div className="h-20 flex items-center justify-center text-gray-400">
                  No logo uploaded
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload('desktopSidebarLogo', e.target.files[0])}
                className="hidden"
                id="desktop-sidebar-logo"
              />
              <label
                htmlFor="desktop-sidebar-logo"
                className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-600"
              >
                Upload
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desktop Header Logo
            </label>
            <p className="text-xs text-gray-500 mb-2">Used in the main site header</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {settings.desktopHeaderLogo ? (
                <img src={settings.desktopHeaderLogo} alt="Desktop Header Logo" className="max-h-20 mx-auto mb-2" />
              ) : (
                <div className="h-20 flex items-center justify-center text-gray-400">
                  No logo uploaded
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload('desktopHeaderLogo', e.target.files[0])}
                className="hidden"
                id="desktop-header-logo"
              />
              <label
                htmlFor="desktop-header-logo"
                className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-600"
              >
                Upload
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footer Logo
            </label>
            <p className="text-xs text-gray-500 mb-2">Used in the site footer</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {settings.footerLogo ? (
                <img src={settings.footerLogo} alt="Footer Logo" className="max-h-20 mx-auto mb-2" />
              ) : (
                <div className="h-20 flex items-center justify-center text-gray-400">
                  No logo uploaded
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload('footerLogo', e.target.files[0])}
                className="hidden"
                id="footer-logo"
              />
              <label
                htmlFor="footer-logo"
                className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-600"
              >
                Upload
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desktop Logo (Legacy)
            </label>
            <p className="text-xs text-gray-500 mb-2">Older generic desktop logo field</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {settings.desktopLogo ? (
                <img src={settings.desktopLogo} alt="Desktop Logo" className="max-h-20 mx-auto mb-2" />
              ) : (
                <div className="h-20 flex items-center justify-center text-gray-400">
                  No logo uploaded
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload('desktopLogo', e.target.files[0])}
                className="hidden"
                id="desktop-logo"
              />
              <label
                htmlFor="desktop-logo"
                className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-600"
              >
                Upload
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Logo
            </label>
            <p className="text-xs text-gray-500 mb-2">Used on mobile devices</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {settings.mobileLogo ? (
                <img src={settings.mobileLogo} alt="Mobile Logo" className="max-h-20 mx-auto mb-2" />
              ) : (
                <div className="h-20 flex items-center justify-center text-gray-400">
                  No logo uploaded
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload('mobileLogo', e.target.files[0])}
                className="hidden"
                id="mobile-logo"
              />
              <label
                htmlFor="mobile-logo"
                className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-600"
              >
                Upload
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon
            </label>
            <p className="text-xs text-gray-500 mb-2">Browser tab icon (16x16 or 32x32 px)</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {settings.favicon ? (
                <img src={settings.favicon} alt="Favicon" className="max-h-20 mx-auto mb-2" />
              ) : (
                <div className="h-20 flex items-center justify-center text-gray-400">
                  No favicon uploaded
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload('favicon', e.target.files[0])}
                className="hidden"
                id="favicon"
              />
              <label
                htmlFor="favicon"
                className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-600"
              >
                Upload
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Colors Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Brand Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step Backgrounds */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Step Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-4">
          Use either hex colors (#3B82F6), rgba values (rgba(59, 130, 246, 0.8)), or Tailwind gradient classes (from-blue-400 via-purple-400 to-pink-400)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.step1Background.startsWith('#') ? settings.step1Background : '#3B82F6'}
                onChange={(e) => setSettings({ ...settings, step1Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.step1Background}
                onChange={(e) => setSettings({ ...settings, step1Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#3B82F6 or from-blue-400 via-purple-400 to-pink-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.step2Background.startsWith('#') ? settings.step2Background : '#10B981'}
                onChange={(e) => setSettings({ ...settings, step2Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.step2Background}
                onChange={(e) => setSettings({ ...settings, step2Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#10B981 or from-emerald-400 via-teal-400 to-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.step3Background.startsWith('#') ? settings.step3Background : '#F97316'}
                onChange={(e) => setSettings({ ...settings, step3Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.step3Background}
                onChange={(e) => setSettings({ ...settings, step3Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#F97316 or from-orange-400 via-rose-400 to-pink-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.step4Background.startsWith('#') ? settings.step4Background : '#8B5CF6'}
                onChange={(e) => setSettings({ ...settings, step4Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.step4Background}
                onChange={(e) => setSettings({ ...settings, step4Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#8B5CF6 or from-violet-400 via-purple-400 to-fuchsia-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flow A (/getintros) Step Backgrounds */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Flow A (/getintros) - Referee Step Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-4">
          Background, form, and button colors for each step of the /getintros (referee) flow
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowAStep1Background?.startsWith('#') ? settings.flowAStep1Background : '#3B82F6'}
                onChange={(e) => setSettings({ ...settings, flowAStep1Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowAStep1Background}
                onChange={(e) => setSettings({ ...settings, flowAStep1Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="from-blue-400 via-purple-400 to-pink-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Form Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowAStep1FormBg?.startsWith('#') ? settings.flowAStep1FormBg : '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, flowAStep1FormBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowAStep1FormBg}
                onChange={(e) => setSettings({ ...settings, flowAStep1FormBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="white or #FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Button Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowAStep1ButtonBg?.startsWith('#') ? settings.flowAStep1ButtonBg : '#3B82F6'}
                onChange={(e) => setSettings({ ...settings, flowAStep1ButtonBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowAStep1ButtonBg}
                onChange={(e) => setSettings({ ...settings, flowAStep1ButtonBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#3B82F6 or leave empty for default"
              />
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowAStep2Background?.startsWith('#') ? settings.flowAStep2Background : '#10B981'}
                onChange={(e) => setSettings({ ...settings, flowAStep2Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowAStep2Background}
                onChange={(e) => setSettings({ ...settings, flowAStep2Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="from-emerald-400 via-teal-400 to-cyan-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Form Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowAStep2FormBg?.startsWith('#') ? settings.flowAStep2FormBg : '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, flowAStep2FormBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowAStep2FormBg}
                onChange={(e) => setSettings({ ...settings, flowAStep2FormBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="white or #FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Button Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowAStep2ButtonBg?.startsWith('#') ? settings.flowAStep2ButtonBg : '#10B981'}
                onChange={(e) => setSettings({ ...settings, flowAStep2ButtonBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowAStep2ButtonBg}
                onChange={(e) => setSettings({ ...settings, flowAStep2ButtonBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#10B981 or leave empty for default"
              />
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowAStep3Background?.startsWith('#') ? settings.flowAStep3Background : '#F97316'}
                onChange={(e) => setSettings({ ...settings, flowAStep3Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowAStep3Background}
                onChange={(e) => setSettings({ ...settings, flowAStep3Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="from-orange-400 via-rose-400 to-pink-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Form Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowAStep3FormBg?.startsWith('#') ? settings.flowAStep3FormBg : '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, flowAStep3FormBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowAStep3FormBg}
                onChange={(e) => setSettings({ ...settings, flowAStep3FormBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="white or #FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Button Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowAStep3ButtonBg?.startsWith('#') ? settings.flowAStep3ButtonBg : '#F97316'}
                onChange={(e) => setSettings({ ...settings, flowAStep3ButtonBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowAStep3ButtonBg}
                onChange={(e) => setSettings({ ...settings, flowAStep3ButtonBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#F97316 or leave empty for default"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flow B (/firstdegree) Step Backgrounds */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Flow B (/firstdegree) - First Degree Step Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-4">
          Background, form, and button colors for each step of the /firstdegree (referrals) flow
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowBStep1Background?.startsWith('#') ? settings.flowBStep1Background : '#3B82F6'}
                onChange={(e) => setSettings({ ...settings, flowBStep1Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowBStep1Background}
                onChange={(e) => setSettings({ ...settings, flowBStep1Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="from-blue-400 via-purple-400 to-pink-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Form Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowBStep1FormBg?.startsWith('#') ? settings.flowBStep1FormBg : '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, flowBStep1FormBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowBStep1FormBg}
                onChange={(e) => setSettings({ ...settings, flowBStep1FormBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="white or #FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Button Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowBStep1ButtonBg?.startsWith('#') ? settings.flowBStep1ButtonBg : '#3B82F6'}
                onChange={(e) => setSettings({ ...settings, flowBStep1ButtonBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowBStep1ButtonBg}
                onChange={(e) => setSettings({ ...settings, flowBStep1ButtonBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#3B82F6 or leave empty for default"
              />
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowBStep2Background?.startsWith('#') ? settings.flowBStep2Background : '#10B981'}
                onChange={(e) => setSettings({ ...settings, flowBStep2Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowBStep2Background}
                onChange={(e) => setSettings({ ...settings, flowBStep2Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="from-emerald-400 via-teal-400 to-cyan-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Form Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowBStep2FormBg?.startsWith('#') ? settings.flowBStep2FormBg : '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, flowBStep2FormBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowBStep2FormBg}
                onChange={(e) => setSettings({ ...settings, flowBStep2FormBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="white or #FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Button Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowBStep2ButtonBg?.startsWith('#') ? settings.flowBStep2ButtonBg : '#10B981'}
                onChange={(e) => setSettings({ ...settings, flowBStep2ButtonBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowBStep2ButtonBg}
                onChange={(e) => setSettings({ ...settings, flowBStep2ButtonBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#10B981 or leave empty for default"
              />
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowBStep3Background?.startsWith('#') ? settings.flowBStep3Background : '#F97316'}
                onChange={(e) => setSettings({ ...settings, flowBStep3Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowBStep3Background}
                onChange={(e) => setSettings({ ...settings, flowBStep3Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="from-orange-400 via-rose-400 to-pink-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Form Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowBStep3FormBg?.startsWith('#') ? settings.flowBStep3FormBg : '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, flowBStep3FormBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowBStep3FormBg}
                onChange={(e) => setSettings({ ...settings, flowBStep3FormBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="white or #FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Button Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowBStep3ButtonBg?.startsWith('#') ? settings.flowBStep3ButtonBg : '#F97316'}
                onChange={(e) => setSettings({ ...settings, flowBStep3ButtonBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowBStep3ButtonBg}
                onChange={(e) => setSettings({ ...settings, flowBStep3ButtonBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#F97316 or leave empty for default"
              />
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowBStep4Background?.startsWith('#') ? settings.flowBStep4Background : '#8B5CF6'}
                onChange={(e) => setSettings({ ...settings, flowBStep4Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowBStep4Background}
                onChange={(e) => setSettings({ ...settings, flowBStep4Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="from-violet-400 via-purple-400 to-fuchsia-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Form Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowBStep4FormBg?.startsWith('#') ? settings.flowBStep4FormBg : '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, flowBStep4FormBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowBStep4FormBg}
                onChange={(e) => setSettings({ ...settings, flowBStep4FormBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="white or #FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Button Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowBStep4ButtonBg?.startsWith('#') ? settings.flowBStep4ButtonBg : '#8B5CF6'}
                onChange={(e) => setSettings({ ...settings, flowBStep4ButtonBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowBStep4ButtonBg}
                onChange={(e) => setSettings({ ...settings, flowBStep4ButtonBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#8B5CF6 or leave empty for default"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flow C (/onboarding) Step Backgrounds */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Flow C (/onboarding) - Onboarding Step Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-4">
          Background, form, and button colors for each step of the /onboarding flow
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowCStep1Background?.startsWith('#') ? settings.flowCStep1Background : '#3B82F6'}
                onChange={(e) => setSettings({ ...settings, flowCStep1Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowCStep1Background}
                onChange={(e) => setSettings({ ...settings, flowCStep1Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="from-blue-400 via-purple-400 to-pink-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Form Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowCStep1FormBg?.startsWith('#') ? settings.flowCStep1FormBg : '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, flowCStep1FormBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowCStep1FormBg}
                onChange={(e) => setSettings({ ...settings, flowCStep1FormBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="white or #FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Button Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowCStep1ButtonBg?.startsWith('#') ? settings.flowCStep1ButtonBg : '#3B82F6'}
                onChange={(e) => setSettings({ ...settings, flowCStep1ButtonBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowCStep1ButtonBg}
                onChange={(e) => setSettings({ ...settings, flowCStep1ButtonBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#3B82F6 or leave empty for default"
              />
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowCStep2Background?.startsWith('#') ? settings.flowCStep2Background : '#10B981'}
                onChange={(e) => setSettings({ ...settings, flowCStep2Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowCStep2Background}
                onChange={(e) => setSettings({ ...settings, flowCStep2Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="from-emerald-400 via-teal-400 to-cyan-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Form Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowCStep2FormBg?.startsWith('#') ? settings.flowCStep2FormBg : '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, flowCStep2FormBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowCStep2FormBg}
                onChange={(e) => setSettings({ ...settings, flowCStep2FormBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="white or #FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Button Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowCStep2ButtonBg?.startsWith('#') ? settings.flowCStep2ButtonBg : '#10B981'}
                onChange={(e) => setSettings({ ...settings, flowCStep2ButtonBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowCStep2ButtonBg}
                onChange={(e) => setSettings({ ...settings, flowCStep2ButtonBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#10B981 or leave empty for default"
              />
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowCStep3Background?.startsWith('#') ? settings.flowCStep3Background : '#F97316'}
                onChange={(e) => setSettings({ ...settings, flowCStep3Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowCStep3Background}
                onChange={(e) => setSettings({ ...settings, flowCStep3Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="from-orange-400 via-rose-400 to-pink-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Form Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowCStep3FormBg?.startsWith('#') ? settings.flowCStep3FormBg : '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, flowCStep3FormBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowCStep3FormBg}
                onChange={(e) => setSettings({ ...settings, flowCStep3FormBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="white or #FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Button Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowCStep3ButtonBg?.startsWith('#') ? settings.flowCStep3ButtonBg : '#F97316'}
                onChange={(e) => setSettings({ ...settings, flowCStep3ButtonBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowCStep3ButtonBg}
                onChange={(e) => setSettings({ ...settings, flowCStep3ButtonBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#F97316 or leave empty for default"
              />
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowCStep4Background?.startsWith('#') ? settings.flowCStep4Background : '#8B5CF6'}
                onChange={(e) => setSettings({ ...settings, flowCStep4Background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowCStep4Background}
                onChange={(e) => setSettings({ ...settings, flowCStep4Background: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="from-violet-400 via-purple-400 to-fuchsia-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Form Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowCStep4FormBg?.startsWith('#') ? settings.flowCStep4FormBg : '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, flowCStep4FormBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowCStep4FormBg}
                onChange={(e) => setSettings({ ...settings, flowCStep4FormBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="white or #FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Button Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.flowCStep4ButtonBg?.startsWith('#') ? settings.flowCStep4ButtonBg : '#8B5CF6'}
                onChange={(e) => setSettings({ ...settings, flowCStep4ButtonBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.flowCStep4ButtonBg}
                onChange={(e) => setSettings({ ...settings, flowCStep4ButtonBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="#8B5CF6 or leave empty for default"
              />
            </div>
          </div>
        </div>
      </div>

      {/* User Flow A Step Names */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">User Flow A - Referee Step Names</h2>
        <p className="text-sm text-gray-600 mb-4">Step names for the referee user flow</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Name
            </label>
            <input
              type="text"
              value={settings.flowAStep1Name}
              onChange={(e) => setSettings({ ...settings, flowAStep1Name: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Your Profile"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Name
            </label>
            <input
              type="text"
              value={settings.flowAStep2Name}
              onChange={(e) => setSettings({ ...settings, flowAStep2Name: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Your Network"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Name
            </label>
            <input
              type="text"
              value={settings.flowAStep3Name}
              onChange={(e) => setSettings({ ...settings, flowAStep3Name: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Referrals"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Name
            </label>
            <input
              type="text"
              value={settings.flowAStep4Name}
              onChange={(e) => setSettings({ ...settings, flowAStep4Name: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Complete"
            />
          </div>
        </div>
      </div>

      {/* User Flow B Step Names */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">User Flow B - First Degree Contact Step Names</h2>
        <p className="text-sm text-gray-600 mb-4">Step names for the first degree contact user flow</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Name
            </label>
            <input
              type="text"
              value={settings.flowBStep1Name}
              onChange={(e) => setSettings({ ...settings, flowBStep1Name: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Review request"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Name
            </label>
            <input
              type="text"
              value={settings.flowBStep2Name}
              onChange={(e) => setSettings({ ...settings, flowBStep2Name: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Suggest your contacts"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Name
            </label>
            <input
              type="text"
              value={settings.flowBStep3Name}
              onChange={(e) => setSettings({ ...settings, flowBStep3Name: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Review & send"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Name
            </label>
            <input
              type="text"
              value={settings.flowBStep4Name}
              onChange={(e) => setSettings({ ...settings, flowBStep4Name: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Track responses"
            />
          </div>
        </div>
      </div>

      {/* User Flow C Step Names */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">User Flow C - Second Degree Contact Step Names</h2>
        <p className="text-sm text-gray-600 mb-4">Step names for the second degree contact user flow</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Name
            </label>
            <input
              type="text"
              value={settings.flowCStep1Name}
              onChange={(e) => setSettings({ ...settings, flowCStep1Name: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Review intro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Name
            </label>
            <input
              type="text"
              value={settings.flowCStep2Name}
              onChange={(e) => setSettings({ ...settings, flowCStep2Name: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Accept or decline"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Name
            </label>
            <input
              type="text"
              value={settings.flowCStep3Name}
              onChange={(e) => setSettings({ ...settings, flowCStep3Name: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Connect"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Name
            </label>
            <input
              type="text"
              value={settings.flowCStep4Name}
              onChange={(e) => setSettings({ ...settings, flowCStep4Name: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Complete"
            />
          </div>
        </div>
      </div>

      {/* Profile Pages (/username and /profile/username) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Pages (/username and /profile/username)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Background and form colors for the /username and /profile/username pages
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.profilePageBackground?.startsWith('#') ? settings.profilePageBackground : '#3B82F6'}
                onChange={(e) => setSettings({ ...settings, profilePageBackground: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.profilePageBackground}
                onChange={(e) => setSettings({ ...settings, profilePageBackground: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="from-blue-400 via-purple-400 to-pink-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.profilePageFormBg?.startsWith('#') ? settings.profilePageFormBg : '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, profilePageFormBg: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.profilePageFormBg}
                onChange={(e) => setSettings({ ...settings, profilePageFormBg: e.target.value })}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="white or #FFFFFF"
              />
            </div>
          </div>
        </div>
      </div>

      {/* App/Dashboard Background */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">App Background (Dashboard & Home)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Background gradient or color for the main app pages like Dashboard and Home
        </p>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            App Background
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={settings.appBackground?.startsWith('#') ? settings.appBackground : '#EFF6FF'}
              onChange={(e) => setSettings({ ...settings, appBackground: e.target.value })}
              className="h-10 w-20 rounded border border-gray-300"
            />
            <input
              type="text"
              value={settings.appBackground}
              onChange={(e) => setSettings({ ...settings, appBackground: e.target.value })}
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="from-blue-50 via-purple-50 to-pink-50"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Use Tailwind gradient classes like "from-blue-50 via-purple-50 to-pink-50" or hex colors</p>
        </div>
      </div>

      {/* Business Card Color Swatches */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Business Card Color Swatches</h2>
        <p className="text-sm text-gray-600 mb-4">
          Define the color options shown to users when customizing their business card. Enter hex colors separated by commas.
        </p>
        <div className="space-y-6">
          {/* Page Background Swatches */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Background Colors
            </label>
            <p className="text-xs text-gray-500 mb-2">Colors users can choose for their card page background</p>
            <div className="flex gap-2 mb-2">
              {(() => {
                try {
                  const colors = JSON.parse(settings.cardPageBgSwatches || '[]')
                  return colors.map((color: string, i: number) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))
                } catch {
                  return null
                }
              })()}
            </div>
            <input
              type="text"
              value={(() => {
                try {
                  return JSON.parse(settings.cardPageBgSwatches || '[]').join(', ')
                } catch {
                  return settings.cardPageBgSwatches
                }
              })()}
              onChange={(e) => {
                const colors = e.target.value.split(',').map(c => c.trim()).filter(c => c)
                setSettings({ ...settings, cardPageBgSwatches: JSON.stringify(colors) })
              }}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="#f0f9ff, #fef3c7, #fce7f3, #ecfdf5, #f5f3ff, #fef2f2"
            />
          </div>

          {/* Card Background Swatches */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Background Colors
            </label>
            <p className="text-xs text-gray-500 mb-2">Colors users can choose for the card box background</p>
            <div className="flex gap-2 mb-2">
              {(() => {
                try {
                  const colors = JSON.parse(settings.cardBoxBgSwatches || '[]')
                  return colors.map((color: string, i: number) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))
                } catch {
                  return null
                }
              })()}
            </div>
            <input
              type="text"
              value={(() => {
                try {
                  return JSON.parse(settings.cardBoxBgSwatches || '[]').join(', ')
                } catch {
                  return settings.cardBoxBgSwatches
                }
              })()}
              onChange={(e) => {
                const colors = e.target.value.split(',').map(c => c.trim()).filter(c => c)
                setSettings({ ...settings, cardBoxBgSwatches: JSON.stringify(colors) })
              }}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="#ffffff, #f9fafb, #fef3c7, #fce7f3, #ecfdf5, #1f2937"
            />
          </div>

          {/* Text Color Swatches */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Colors
            </label>
            <p className="text-xs text-gray-500 mb-2">Colors users can choose for text inside the card</p>
            <div className="flex gap-2 mb-2">
              {(() => {
                try {
                  const colors = JSON.parse(settings.cardTextSwatches || '[]')
                  return colors.map((color: string, i: number) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))
                } catch {
                  return null
                }
              })()}
            </div>
            <input
              type="text"
              value={(() => {
                try {
                  return JSON.parse(settings.cardTextSwatches || '[]').join(', ')
                } catch {
                  return settings.cardTextSwatches
                }
              })()}
              onChange={(e) => {
                const colors = e.target.value.split(',').map(c => c.trim()).filter(c => c)
                setSettings({ ...settings, cardTextSwatches: JSON.stringify(colors) })
              }}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="#111827, #374151, #6b7280, #ffffff, #1e40af, #7c3aed"
            />
          </div>
        </div>
      </div>

      {/* Card Themes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Business Card Themes</h2>
        <p className="text-sm text-gray-600 mb-4">
          Define up to 6 themes that users can choose from to quickly style their business card.
          Each theme icon shows the page background (left half) and card background (right half).
        </p>

        <div className="space-y-6">
          {themes.map((theme, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                {/* Theme Preview Icon - Split Circle */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 flex-shrink-0">
                  <div
                    className="absolute left-0 top-0 w-1/2 h-full"
                    style={{ backgroundColor: theme.pageBackground }}
                  />
                  <div
                    className="absolute right-0 top-0 w-1/2 h-full"
                    style={{ backgroundColor: theme.cardBackground }}
                  />
                </div>

                {/* Theme Name */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Theme Name
                  </label>
                  <input
                    type="text"
                    value={theme.name}
                    onChange={(e) => updateTheme(index, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Theme name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Page Background */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Page Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.pageBackground}
                      onChange={(e) => updateTheme(index, 'pageBackground', e.target.value)}
                      className="h-8 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.pageBackground}
                      onChange={(e) => updateTheme(index, 'pageBackground', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Card Background */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Card Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.cardBackground}
                      onChange={(e) => updateTheme(index, 'cardBackground', e.target.value)}
                      className="h-8 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.cardBackground}
                      onChange={(e) => updateTheme(index, 'cardBackground', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.textColor}
                      onChange={(e) => updateTheme(index, 'textColor', e.target.value)}
                      className="h-8 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.textColor}
                      onChange={(e) => updateTheme(index, 'textColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Profile Picture Border */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Profile Border
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.profilePictureBorder}
                      onChange={(e) => updateTheme(index, 'profilePictureBorder', e.target.value)}
                      className="h-8 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.profilePictureBorder}
                      onChange={(e) => updateTheme(index, 'profilePictureBorder', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Footer Background */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Footer Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.footerBackground}
                      onChange={(e) => updateTheme(index, 'footerBackground', e.target.value)}
                      className="h-8 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.footerBackground}
                      onChange={(e) => updateTheme(index, 'footerBackground', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Footer Text Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Footer Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.footerTextColor}
                      onChange={(e) => updateTheme(index, 'footerTextColor', e.target.value)}
                      className="h-8 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.footerTextColor}
                      onChange={(e) => updateTheme(index, 'footerTextColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Button A Background */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Button A Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.buttonABackground}
                      onChange={(e) => updateTheme(index, 'buttonABackground', e.target.value)}
                      className="h-8 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.buttonABackground}
                      onChange={(e) => updateTheme(index, 'buttonABackground', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Button A Text Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Button A Text
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.buttonATextColor}
                      onChange={(e) => updateTheme(index, 'buttonATextColor', e.target.value)}
                      className="h-8 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.buttonATextColor}
                      onChange={(e) => updateTheme(index, 'buttonATextColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Button B Background */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Button B Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.buttonBBackground}
                      onChange={(e) => updateTheme(index, 'buttonBBackground', e.target.value)}
                      className="h-8 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.buttonBBackground}
                      onChange={(e) => updateTheme(index, 'buttonBBackground', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Button B Text Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Button B Text
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.buttonBTextColor}
                      onChange={(e) => updateTheme(index, 'buttonBTextColor', e.target.value)}
                      className="h-8 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.buttonBTextColor}
                      onChange={(e) => updateTheme(index, 'buttonBTextColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveThemes}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Save Themes
          </button>
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Typography</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Font Family
            </label>
            <input
              type="text"
              value={settings.fontFamily}
              onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Inter, system-ui, sans-serif"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heading Font Family
            </label>
            <input
              type="text"
              value={settings.headingFont}
              onChange={(e) => setSettings({ ...settings, headingFont: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Inter, system-ui, sans-serif"
            />
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Custom CSS</h2>
        <p className="text-sm text-gray-600 mb-4">Add your custom CSS to override default styles</p>
        <textarea
          value={customCSS}
          onChange={(e) => setCustomCSS(e.target.value)}
          rows={12}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
          placeholder=":root {
  --primary-color: #3B82F6;
  --secondary-color: #8B5CF6;
}

.custom-class {
  /* your styles */
}"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
