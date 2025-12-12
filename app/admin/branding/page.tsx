'use client'

import { useEffect, useState } from 'react'

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
  // Flow B (/firstdegree) Step Backgrounds
  flowBStep1Background: string
  flowBStep2Background: string
  flowBStep3Background: string
  flowBStep4Background: string
  flowBStep1FormBg: string
  flowBStep2FormBg: string
  flowBStep3FormBg: string
  flowBStep4FormBg: string
  // Flow C (/onboarding) Step Backgrounds
  flowCStep1Background: string
  flowCStep2Background: string
  flowCStep3Background: string
  flowCStep4Background: string
  flowCStep1FormBg: string
  flowCStep2FormBg: string
  flowCStep3FormBg: string
  flowCStep4FormBg: string
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
    // Flow B (/firstdegree)
    flowBStep1Background: 'from-blue-400 via-purple-400 to-pink-400',
    flowBStep2Background: 'from-emerald-400 via-teal-400 to-cyan-400',
    flowBStep3Background: 'from-orange-400 via-rose-400 to-pink-400',
    flowBStep4Background: 'from-violet-400 via-purple-400 to-fuchsia-400',
    flowBStep1FormBg: 'white',
    flowBStep2FormBg: 'white',
    flowBStep3FormBg: 'white',
    flowBStep4FormBg: 'white',
    // Flow C (/onboarding)
    flowCStep1Background: 'from-blue-400 via-purple-400 to-pink-400',
    flowCStep2Background: 'from-emerald-400 via-teal-400 to-cyan-400',
    flowCStep3Background: 'from-orange-400 via-rose-400 to-pink-400',
    flowCStep4Background: 'from-violet-400 via-purple-400 to-fuchsia-400',
    flowCStep1FormBg: 'white',
    flowCStep2FormBg: 'white',
    flowCStep3FormBg: 'white',
    flowCStep4FormBg: 'white',
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

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/branding')
      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
        setCustomCSS(data.customCSS || '')
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
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
          Background and form colors for each step of the /getintros (referee) flow
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Background
            </label>
            <input
              type="text"
              value={settings.flowAStep1Background}
              onChange={(e) => setSettings({ ...settings, flowAStep1Background: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="from-blue-400 via-purple-400 to-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Form Background
            </label>
            <input
              type="text"
              value={settings.flowAStep1FormBg}
              onChange={(e) => setSettings({ ...settings, flowAStep1FormBg: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="white or #FFFFFF"
            />
          </div>

          {/* Step 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Background
            </label>
            <input
              type="text"
              value={settings.flowAStep2Background}
              onChange={(e) => setSettings({ ...settings, flowAStep2Background: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="from-emerald-400 via-teal-400 to-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Form Background
            </label>
            <input
              type="text"
              value={settings.flowAStep2FormBg}
              onChange={(e) => setSettings({ ...settings, flowAStep2FormBg: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="white or #FFFFFF"
            />
          </div>

          {/* Step 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Background
            </label>
            <input
              type="text"
              value={settings.flowAStep3Background}
              onChange={(e) => setSettings({ ...settings, flowAStep3Background: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="from-orange-400 via-rose-400 to-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Form Background
            </label>
            <input
              type="text"
              value={settings.flowAStep3FormBg}
              onChange={(e) => setSettings({ ...settings, flowAStep3FormBg: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="white or #FFFFFF"
            />
          </div>
        </div>
      </div>

      {/* Flow B (/firstdegree) Step Backgrounds */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Flow B (/firstdegree) - First Degree Step Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-4">
          Background and form colors for each step of the /firstdegree (referrals) flow
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Background
            </label>
            <input
              type="text"
              value={settings.flowBStep1Background}
              onChange={(e) => setSettings({ ...settings, flowBStep1Background: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="from-blue-400 via-purple-400 to-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Form Background
            </label>
            <input
              type="text"
              value={settings.flowBStep1FormBg}
              onChange={(e) => setSettings({ ...settings, flowBStep1FormBg: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="white or #FFFFFF"
            />
          </div>

          {/* Step 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Background
            </label>
            <input
              type="text"
              value={settings.flowBStep2Background}
              onChange={(e) => setSettings({ ...settings, flowBStep2Background: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="from-emerald-400 via-teal-400 to-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Form Background
            </label>
            <input
              type="text"
              value={settings.flowBStep2FormBg}
              onChange={(e) => setSettings({ ...settings, flowBStep2FormBg: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="white or #FFFFFF"
            />
          </div>

          {/* Step 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Background
            </label>
            <input
              type="text"
              value={settings.flowBStep3Background}
              onChange={(e) => setSettings({ ...settings, flowBStep3Background: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="from-orange-400 via-rose-400 to-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Form Background
            </label>
            <input
              type="text"
              value={settings.flowBStep3FormBg}
              onChange={(e) => setSettings({ ...settings, flowBStep3FormBg: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="white or #FFFFFF"
            />
          </div>

          {/* Step 4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Background
            </label>
            <input
              type="text"
              value={settings.flowBStep4Background}
              onChange={(e) => setSettings({ ...settings, flowBStep4Background: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="from-violet-400 via-purple-400 to-fuchsia-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Form Background
            </label>
            <input
              type="text"
              value={settings.flowBStep4FormBg}
              onChange={(e) => setSettings({ ...settings, flowBStep4FormBg: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="white or #FFFFFF"
            />
          </div>
        </div>
      </div>

      {/* Flow C (/onboarding) Step Backgrounds */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Flow C (/onboarding) - Onboarding Step Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-4">
          Background and form colors for each step of the /onboarding flow
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Background
            </label>
            <input
              type="text"
              value={settings.flowCStep1Background}
              onChange={(e) => setSettings({ ...settings, flowCStep1Background: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="from-blue-400 via-purple-400 to-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1 Form Background
            </label>
            <input
              type="text"
              value={settings.flowCStep1FormBg}
              onChange={(e) => setSettings({ ...settings, flowCStep1FormBg: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="white or #FFFFFF"
            />
          </div>

          {/* Step 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Background
            </label>
            <input
              type="text"
              value={settings.flowCStep2Background}
              onChange={(e) => setSettings({ ...settings, flowCStep2Background: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="from-emerald-400 via-teal-400 to-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2 Form Background
            </label>
            <input
              type="text"
              value={settings.flowCStep2FormBg}
              onChange={(e) => setSettings({ ...settings, flowCStep2FormBg: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="white or #FFFFFF"
            />
          </div>

          {/* Step 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Background
            </label>
            <input
              type="text"
              value={settings.flowCStep3Background}
              onChange={(e) => setSettings({ ...settings, flowCStep3Background: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="from-orange-400 via-rose-400 to-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 Form Background
            </label>
            <input
              type="text"
              value={settings.flowCStep3FormBg}
              onChange={(e) => setSettings({ ...settings, flowCStep3FormBg: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="white or #FFFFFF"
            />
          </div>

          {/* Step 4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Background
            </label>
            <input
              type="text"
              value={settings.flowCStep4Background}
              onChange={(e) => setSettings({ ...settings, flowCStep4Background: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="from-violet-400 via-purple-400 to-fuchsia-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 Form Background
            </label>
            <input
              type="text"
              value={settings.flowCStep4FormBg}
              onChange={(e) => setSettings({ ...settings, flowCStep4FormBg: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="white or #FFFFFF"
            />
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
