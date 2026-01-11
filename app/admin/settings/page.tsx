'use client'

import { useEffect, useState } from 'react'

interface ApiSettings {
  appUrl: string
  emailProvider: string
  emailFromName: string
  resendApiKey: string
  resendFromEmail: string
  gmailEmail: string
  gmailAppPassword: string
  sesAccessKeyId: string
  sesSecretAccessKey: string
  sesRegion: string
  sesFromEmail: string
  smsEnabled: boolean
  twilioAccountSid: string
  twilioAuthToken: string
  twilioPhoneNumber: string
  anthropicApiKey: string
  // S3 Storage
  s3Enabled: boolean
  s3Bucket: string
  s3Region: string
  s3AccessKeyId: string
  s3SecretAccessKey: string
  s3PublicUrlPrefix: string
  // LinkedIn OAuth
  linkedinEnabled: boolean
  linkedinClientId: string
  linkedinClientSecret: string
  linkedinRedirectUri: string
  // Backup Configuration
  backupS3Bucket: string
  backupS3Region: string
  backupRetentionDays: number
}

type TabType = 'general' | 'email' | 'sms' | 'ai' | 'storage' | 'linkedin' | 'backup'

interface BackupInfo {
  key: string
  size: number
  sizeFormatted: string
  date: string
  dateFormatted: string
}

const tabs: { id: TabType; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'ai', label: 'AI' },
  { id: 'storage', label: 'Storage' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'backup', label: 'Backup' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [settings, setSettings] = useState<ApiSettings>({
    appUrl: '',
    emailProvider: 'resend',
    emailFromName: '',
    resendApiKey: '',
    resendFromEmail: '',
    gmailEmail: '',
    gmailAppPassword: '',
    sesAccessKeyId: '',
    sesSecretAccessKey: '',
    sesRegion: 'us-east-1',
    sesFromEmail: '',
    smsEnabled: false,
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    anthropicApiKey: '',
    // S3 Storage
    s3Enabled: false,
    s3Bucket: '',
    s3Region: 'us-east-1',
    s3AccessKeyId: '',
    s3SecretAccessKey: '',
    s3PublicUrlPrefix: '',
    // LinkedIn OAuth
    linkedinEnabled: false,
    linkedinClientId: '',
    linkedinClientSecret: '',
    linkedinRedirectUri: '',
    // Backup Configuration
    backupS3Bucket: '',
    backupS3Region: 'us-east-1',
    backupRetentionDays: 14,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testingSms, setTestingSms] = useState(false)
  const [testingS3, setTestingS3] = useState(false)
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [loadingBackups, setLoadingBackups] = useState(false)
  const [creatingBackup, setCreatingBackup] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (activeTab === 'backup') {
      fetchBackups()
    }
  }, [activeTab])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
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
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
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

  const testEmail = async () => {
    setTestingEmail(true)
    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.success) {
        let emailAddress = settings.resendFromEmail
        if (settings.emailProvider === 'gmail') {
          emailAddress = settings.gmailEmail
        } else if (settings.emailProvider === 'ses') {
          emailAddress = settings.sesFromEmail
        }
        alert(`Test email sent successfully to ${emailAddress}!`)
      } else {
        alert(`Failed to send test email: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to test email:', error)
      alert('Failed to send test email')
    } finally {
      setTestingEmail(false)
    }
  }

  const testSmsToNumber = async (toNumber: string) => {
    setTestingSms(true)
    try {
      const response = await fetch('/api/admin/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: toNumber }),
      })
      const data = await response.json()
      if (data.success) {
        alert(`Test SMS sent successfully to ${toNumber}!`)
      } else {
        alert(`Failed to send test SMS: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to test SMS:', error)
      alert('Failed to send test SMS')
    } finally {
      setTestingSms(false)
    }
  }

  const testS3 = async () => {
    setTestingS3(true)
    try {
      const response = await fetch('/api/admin/test-s3', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.success) {
        alert(data.message || 'S3 connection successful!')
      } else {
        alert(`S3 connection failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to test S3:', error)
      alert('Failed to test S3 connection')
    } finally {
      setTestingS3(false)
    }
  }

  const fetchBackups = async () => {
    setLoadingBackups(true)
    try {
      const response = await fetch('/api/admin/backup')
      const data = await response.json()
      if (data.success) {
        setBackups(data.backups || [])
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error)
    } finally {
      setLoadingBackups(false)
    }
  }

  const createBackup = async () => {
    setCreatingBackup(true)
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.success) {
        alert(`Backup created successfully!\n\nFile: ${data.backupKey}\nSize: ${formatBytes(data.size)}${data.cleanedUp ? `\nCleaned up ${data.cleanedUp} old backup(s)` : ''}`)
        fetchBackups()
      } else {
        alert(`Backup failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to create backup:', error)
      alert('Failed to create backup')
    } finally {
      setCreatingBackup(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">API Settings</h1>
        <p className="text-gray-600 mt-2">Configure integrations and API credentials</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">App URL</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Production App URL
              </label>
              <input
                type="url"
                value={settings.appUrl || ''}
                onChange={(e) => setSettings({ ...settings, appUrl: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://app.yourdomain.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                Used for links in emails. Include https:// but no trailing slash.
              </p>
            </div>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <>
            {/* Email Provider Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Email Provider</h2>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="emailProvider"
                    value="resend"
                    checked={settings.emailProvider === 'resend'}
                    onChange={(e) => setSettings({ ...settings, emailProvider: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Resend</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="emailProvider"
                    value="gmail"
                    checked={settings.emailProvider === 'gmail'}
                    onChange={(e) => setSettings({ ...settings, emailProvider: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Gmail SMTP</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="emailProvider"
                    value="ses"
                    checked={settings.emailProvider === 'ses'}
                    onChange={(e) => setSettings({ ...settings, emailProvider: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Amazon SES</span>
                </label>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sender Name (optional)
                </label>
                <input
                  type="text"
                  value={settings.emailFromName || ''}
                  onChange={(e) => setSettings({ ...settings, emailFromName: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="IntroNetwork"
                />
                <p className="mt-1 text-xs text-gray-500">
                  The name that appears as the sender (e.g., &quot;IntroNetwork&quot; instead of just the email address)
                </p>
              </div>
            </div>

            {/* Resend Settings */}
            {settings.emailProvider === 'resend' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Resend Email API</h2>
                    <p className="text-sm text-gray-600 mt-1">Configure email delivery service</p>
                  </div>
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Get API Key →
                  </a>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type={showApiKeys ? 'text' : 'password'}
                      value={settings.resendApiKey}
                      onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="re_..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.resendFromEmail}
                      onChange={(e) => setSettings({ ...settings, resendFromEmail: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="noreply@yourdomain.com"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Must be a verified domain in your Resend account
                    </p>
                  </div>

                  <button
                    onClick={testEmail}
                    disabled={testingEmail || !settings.resendApiKey || !settings.resendFromEmail}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {testingEmail ? 'Sending...' : 'Send Test Email'}
                  </button>
                </div>
              </div>
            )}

            {/* Gmail Settings */}
            {settings.emailProvider === 'gmail' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Gmail SMTP</h2>
                    <p className="text-sm text-gray-600 mt-1">Configure Gmail email delivery</p>
                  </div>
                  <a
                    href="https://support.google.com/accounts/answer/185833"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Get App Password →
                  </a>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gmail Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.gmailEmail}
                      onChange={(e) => setSettings({ ...settings, gmailEmail: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="your.email@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      App Password
                    </label>
                    <input
                      type={showApiKeys ? 'text' : 'password'}
                      value={settings.gmailAppPassword}
                      onChange={(e) => setSettings({ ...settings, gmailAppPassword: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="16-character app password"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Generate an app password in your Google Account settings
                    </p>
                  </div>

                  <button
                    onClick={testEmail}
                    disabled={testingEmail || !settings.gmailEmail || !settings.gmailAppPassword}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {testingEmail ? 'Sending...' : 'Send Test Email'}
                  </button>
                </div>
              </div>
            )}

            {/* Amazon SES Settings */}
            {settings.emailProvider === 'ses' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Amazon SES</h2>
                    <p className="text-sm text-gray-600 mt-1">Configure Amazon Simple Email Service</p>
                  </div>
                  <a
                    href="https://console.aws.amazon.com/ses/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    AWS Console →
                  </a>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Key ID
                    </label>
                    <input
                      type={showApiKeys ? 'text' : 'password'}
                      value={settings.sesAccessKeyId}
                      onChange={(e) => setSettings({ ...settings, sesAccessKeyId: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="AKIA..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secret Access Key
                    </label>
                    <input
                      type={showApiKeys ? 'text' : 'password'}
                      value={settings.sesSecretAccessKey}
                      onChange={(e) => setSettings({ ...settings, sesSecretAccessKey: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Your secret access key"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region
                    </label>
                    <select
                      value={settings.sesRegion}
                      onChange={(e) => setSettings({ ...settings, sesRegion: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="us-east-1">US East (N. Virginia)</option>
                      <option value="us-east-2">US East (Ohio)</option>
                      <option value="us-west-1">US West (N. California)</option>
                      <option value="us-west-2">US West (Oregon)</option>
                      <option value="eu-west-1">EU (Ireland)</option>
                      <option value="eu-west-2">EU (London)</option>
                      <option value="eu-west-3">EU (Paris)</option>
                      <option value="eu-central-1">EU (Frankfurt)</option>
                      <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                      <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                      <option value="ap-northeast-2">Asia Pacific (Seoul)</option>
                      <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                      <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                      <option value="ca-central-1">Canada (Central)</option>
                      <option value="sa-east-1">South America (São Paulo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.sesFromEmail}
                      onChange={(e) => setSettings({ ...settings, sesFromEmail: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="noreply@yourdomain.com"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Must be a verified email or domain in your SES account
                    </p>
                  </div>

                  <button
                    onClick={testEmail}
                    disabled={testingEmail || !settings.sesAccessKeyId || !settings.sesSecretAccessKey || !settings.sesFromEmail}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {testingEmail ? 'Sending...' : 'Send Test Email'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* SMS Tab */}
        {activeTab === 'sms' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Twilio SMS API</h2>
                <p className="text-sm text-gray-600 mt-1">Configure SMS messaging service</p>
              </div>
              <a
                href="https://console.twilio.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Get Credentials →
              </a>
            </div>

            {/* SMS Enable/Disable Toggle */}
            <div className="flex items-center justify-between py-4 border-b border-gray-200 mb-4">
              <div>
                <span className="font-medium text-gray-900">Enable SMS</span>
                <p className="text-sm text-gray-500">Allow sending SMS messages to contacts</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, smsEnabled: !settings.smsEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.smsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.smsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account SID
                </label>
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={settings.twilioAccountSid}
                  onChange={(e) => setSettings({ ...settings, twilioAccountSid: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="AC..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auth Token
                </label>
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={settings.twilioAuthToken}
                  onChange={(e) => setSettings({ ...settings, twilioAuthToken: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Your auth token"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.twilioPhoneNumber}
                  onChange={(e) => setSettings({ ...settings, twilioPhoneNumber: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="+1234567890"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Your Twilio phone number with country code
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="tel"
                  id="testSmsNumber"
                  placeholder="Your verified phone (+1234567890)"
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('testSmsNumber') as HTMLInputElement
                    const testNumber = input?.value?.trim()
                    if (!testNumber) {
                      alert('Please enter a verified phone number to send the test SMS to')
                      return
                    }
                    testSmsToNumber(testNumber)
                  }}
                  disabled={testingSms || !settings.twilioAccountSid || !settings.twilioAuthToken || !settings.twilioPhoneNumber}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {testingSms ? 'Sending...' : 'Send Test SMS'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Trial accounts can only send to verified numbers. Add your number in Twilio Console → Verified Caller IDs.
              </p>
            </div>
          </div>
        )}

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Anthropic API (Claude)</h2>
                <p className="text-sm text-gray-600 mt-1">Configure AI-powered statement generation</p>
              </div>
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Get API Key →
              </a>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={settings.anthropicApiKey}
                  onChange={(e) => setSettings({ ...settings, anthropicApiKey: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="sk-ant-..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Used for AI-generated professional statements
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Storage Tab */}
        {activeTab === 'storage' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Amazon S3 Storage</h2>
                <p className="text-sm text-gray-600 mt-1">Configure file storage for images and documents</p>
              </div>
              <a
                href="https://console.aws.amazon.com/s3/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                AWS Console →
              </a>
            </div>

            {/* S3 Enable/Disable Toggle */}
            <div className="flex items-center justify-between py-4 border-b border-gray-200 mb-4">
              <div>
                <span className="font-medium text-gray-900">Enable S3 Storage</span>
                <p className="text-sm text-gray-500">Store uploaded files in S3 instead of the database</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, s3Enabled: !settings.s3Enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.s3Enabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.s3Enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  S3 Bucket Name
                </label>
                <input
                  type="text"
                  value={settings.s3Bucket}
                  onChange={(e) => setSettings({ ...settings, s3Bucket: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="my-app-uploads"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={settings.s3Region}
                  onChange={(e) => setSettings({ ...settings, s3Region: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-east-2">US East (Ohio)</option>
                  <option value="us-west-1">US West (N. California)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">EU (Ireland)</option>
                  <option value="eu-west-2">EU (London)</option>
                  <option value="eu-west-3">EU (Paris)</option>
                  <option value="eu-central-1">EU (Frankfurt)</option>
                  <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                  <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                  <option value="ap-northeast-2">Asia Pacific (Seoul)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                  <option value="ca-central-1">Canada (Central)</option>
                  <option value="sa-east-1">South America (São Paulo)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Key ID
                </label>
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={settings.s3AccessKeyId}
                  onChange={(e) => setSettings({ ...settings, s3AccessKeyId: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="AKIA..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Access Key
                </label>
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={settings.s3SecretAccessKey}
                  onChange={(e) => setSettings({ ...settings, s3SecretAccessKey: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Your secret access key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public URL Prefix (Optional)
                </label>
                <input
                  type="url"
                  value={settings.s3PublicUrlPrefix}
                  onChange={(e) => setSettings({ ...settings, s3PublicUrlPrefix: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://cdn.yourdomain.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Custom domain or CloudFront distribution URL. Leave blank to use default S3 URLs.
                </p>
              </div>

              <button
                onClick={testS3}
                disabled={testingS3 || !settings.s3Enabled || !settings.s3Bucket || !settings.s3AccessKeyId || !settings.s3SecretAccessKey}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {testingS3 ? 'Testing...' : 'Test S3 Connection'}
              </button>
            </div>
          </div>
        )}

        {/* LinkedIn Tab */}
        {activeTab === 'linkedin' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">LinkedIn OAuth</h2>
                <p className="text-sm text-gray-600 mt-1">Configure LinkedIn sign-in integration</p>
              </div>
              <a
                href="https://www.linkedin.com/developers/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                LinkedIn Developers →
              </a>
            </div>

            {/* LinkedIn Enable/Disable Toggle */}
            <div className="flex items-center justify-between py-4 border-b border-gray-200 mb-4">
              <div>
                <span className="font-medium text-gray-900">Enable LinkedIn Sign-In</span>
                <p className="text-sm text-gray-500">Allow users to sign in with their LinkedIn account</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, linkedinEnabled: !settings.linkedinEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.linkedinEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.linkedinEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID
                </label>
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={settings.linkedinClientId}
                  onChange={(e) => setSettings({ ...settings, linkedinClientId: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Your LinkedIn App Client ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Secret
                </label>
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={settings.linkedinClientSecret}
                  onChange={(e) => setSettings({ ...settings, linkedinClientSecret: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Your LinkedIn App Client Secret"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redirect URI
                </label>
                <input
                  type="url"
                  value={settings.linkedinRedirectUri}
                  onChange={(e) => setSettings({ ...settings, linkedinRedirectUri: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://yourdomain.com/api/auth/linkedin/callback"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must match the redirect URI configured in your LinkedIn app settings
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Database Backup</h2>
                  <p className="text-sm text-gray-600 mt-1">Create and manage database backups stored in S3</p>
                </div>
                <button
                  onClick={createBackup}
                  disabled={creatingBackup || !settings.s3Enabled}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {creatingBackup ? 'Creating Backup...' : 'Create Backup Now'}
                </button>
              </div>

              {!settings.s3Enabled && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    S3 storage must be enabled to use backups. Go to the Storage tab to configure S3.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Backups</h3>
                  {loadingBackups ? (
                    <p className="text-sm text-gray-500">Loading backups...</p>
                  ) : backups.length === 0 ? (
                    <p className="text-sm text-gray-500">No backups found</p>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {backups.map((backup) => (
                            <tr key={backup.key}>
                              <td className="px-4 py-2 text-sm text-gray-900 font-mono">
                                {backup.key.split('/').pop()}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {backup.sizeFormatted}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {new Date(backup.dateFormatted).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Backup Storage Settings</h2>
              <p className="text-sm text-gray-600 mb-4">
                Configure where backups are stored. Leave bucket empty to use the main S3 bucket from Storage settings.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup S3 Bucket (Optional)
                  </label>
                  <input
                    type="text"
                    value={settings.backupS3Bucket}
                    onChange={(e) => setSettings({ ...settings, backupS3Bucket: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder={settings.s3Bucket || 'Uses main S3 bucket'}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to use the main S3 bucket configured in Storage settings
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup S3 Region
                  </label>
                  <select
                    value={settings.backupS3Region}
                    onChange={(e) => setSettings({ ...settings, backupS3Region: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-east-2">US East (Ohio)</option>
                    <option value="us-west-1">US West (N. California)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">EU (Ireland)</option>
                    <option value="eu-west-2">EU (London)</option>
                    <option value="eu-west-3">EU (Paris)</option>
                    <option value="eu-central-1">EU (Frankfurt)</option>
                    <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                    <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                    <option value="ap-northeast-2">Asia Pacific (Seoul)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                    <option value="ca-central-1">Canada (Central)</option>
                    <option value="sa-east-1">South America (São Paulo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retention Period (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.backupRetentionDays}
                    onChange={(e) => setSettings({ ...settings, backupRetentionDays: parseInt(e.target.value) || 14 })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Backups older than this will be automatically deleted (1-365 days)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Automated Backups</h2>
              <p className="text-sm text-gray-600 mb-4">
                Set up automated daily backups using a cron service. Backups are retained for {settings.backupRetentionDays} days.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">1. Set Environment Variable</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Add a <code className="bg-gray-200 px-1 rounded">CRON_SECRET</code> environment variable to your deployment:
                  </p>
                  <code className="block bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
                    CRON_SECRET=your-secret-key-here
                  </code>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">2. Configure Cron Job</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Set up a daily cron job (e.g., using Railway, Vercel Cron, or cron-job.org) to call:
                  </p>
                  <code className="block bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
                    POST {settings.appUrl || 'https://your-app.com'}/api/cron/backup
                  </code>
                  <p className="text-xs text-gray-600 mt-2">
                    Include the header: <code className="bg-gray-200 px-1 rounded">x-cron-secret: your-secret-key-here</code>
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Example cURL Command</h3>
                  <code className="block bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto whitespace-pre">
{`curl -X POST \\
  ${settings.appUrl || 'https://your-app.com'}/api/cron/backup \\
  -H "x-cron-secret: your-secret-key-here"`}
                  </code>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer with Show/Hide toggle and Save button */}
      <div className="mt-6 flex items-center justify-between">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showApiKeys}
            onChange={(e) => setShowApiKeys(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Show API keys and tokens</span>
        </label>

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
