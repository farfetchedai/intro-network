'use client'

import { useEffect, useState } from 'react'

export default function CustomCSS() {
  const [customCSS, setCustomCSS] = useState('')

  useEffect(() => {
    // Fetch branding settings to get custom CSS (using public endpoint)
    fetch('/api/branding')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.customCSS) {
          setCustomCSS(data.customCSS)
        }
      })
      .catch(err => console.error('CustomCSS: Failed to fetch custom CSS:', err))
  }, [])

  if (!customCSS) {
    return null
  }

  return (
    <style dangerouslySetInnerHTML={{ __html: customCSS }} />
  )
}
