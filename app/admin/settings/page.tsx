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
}

export default function SettingsPage() {
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
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testingSms, setTestingSms] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

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

  const testSms = async () => {
    setTestingSms(true)
    try {
      const response = await fetch('/api/admin/test-sms', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.success) {
        alert(`Test SMS sent successfully to ${settings.twilioPhoneNumber}!`)
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
        <h1 className="text-3xl font-bold text-gray-900">API Settings</h1>
        <p className="text-gray-600 mt-2">Configure email and SMS API credentials</p>
      </div>

      {/* App URL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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

      {/* Email Provider Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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
            The name that appears as the sender (e.g., "IntroNetwork" instead of just the email address)
          </p>
        </div>
      </div>

      {/* Resend Settings */}
      {settings.emailProvider === 'resend' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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

      {/* Twilio Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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
          <p className="mt-2 text-xs text-gray-500">
            Trial accounts can only send to verified numbers. Add your number in Twilio Console → Verified Caller IDs.
          </p>
        </div>
      </div>

      {/* Anthropic API Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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

      {/* Show/Hide API Keys Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showApiKeys}
            onChange={(e) => setShowApiKeys(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Show API keys and tokens</span>
        </label>
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
