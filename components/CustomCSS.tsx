'use client'

import { useEffect, useState } from 'react'

export default function CustomCSS() {
  const [customCSS, setCustomCSS] = useState('')

  useEffect(() => {
    // Fetch branding settings to get custom CSS
    fetch('/api/admin/branding')
      .then(res => res.json())
      .then(data => {
        console.log('CustomCSS: Branding API response:', data)
        if (data.success && data.customCSS) {
          console.log('CustomCSS: Loading CSS:', data.customCSS)
          setCustomCSS(data.customCSS)
        } else {
          console.log('CustomCSS: No custom CSS found')
        }
      })
      .catch(err => console.error('CustomCSS: Failed to fetch custom CSS:', err))
  }, [])

  if (!customCSS) {
    console.log('CustomCSS: No CSS to render')
    return null
  }

  console.log('CustomCSS: Rendering style tag with CSS')
  return (
    <style dangerouslySetInnerHTML={{ __html: customCSS }} />
  )
}
