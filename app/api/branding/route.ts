import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public endpoint for fetching branding settings (no auth required)
export async function GET() {
  try {
    let settings = await prisma.brandingSettings.findFirst()

    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json({
        success: true,
        settings: {
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
          appBackground: 'from-blue-50 via-purple-50 to-pink-50',
          fontFamily: 'Inter, system-ui, sans-serif',
          headingFont: 'Inter, system-ui, sans-serif',
        },
        customCSS: '',
      })
    }

    return NextResponse.json({
      success: true,
      settings: {
        productName: settings.productName || 'Intro Network',
        desktopLogo: settings.desktopLogo || '',
        mobileLogo: settings.mobileLogo || '',
        desktopSidebarLogo: settings.desktopSidebarLogo || '',
        desktopHeaderLogo: settings.desktopHeaderLogo || '',
        footerLogo: settings.footerLogo || '',
        favicon: settings.favicon || '',
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
        step1Background: settings.step1Background,
        step2Background: settings.step2Background,
        step3Background: settings.step3Background,
        step4Background: settings.step4Background,
        flowAStep1Background: settings.flowAStep1Background,
        flowAStep2Background: settings.flowAStep2Background,
        flowAStep3Background: settings.flowAStep3Background,
        flowAStep1FormBg: settings.flowAStep1FormBg,
        flowAStep2FormBg: settings.flowAStep2FormBg,
        flowAStep3FormBg: settings.flowAStep3FormBg,
        flowBStep1Background: settings.flowBStep1Background,
        flowBStep2Background: settings.flowBStep2Background,
        flowBStep3Background: settings.flowBStep3Background,
        flowBStep4Background: settings.flowBStep4Background,
        flowBStep1FormBg: settings.flowBStep1FormBg,
        flowBStep2FormBg: settings.flowBStep2FormBg,
        flowBStep3FormBg: settings.flowBStep3FormBg,
        flowBStep4FormBg: settings.flowBStep4FormBg,
        flowCStep1Background: settings.flowCStep1Background,
        flowCStep2Background: settings.flowCStep2Background,
        flowCStep3Background: settings.flowCStep3Background,
        flowCStep4Background: settings.flowCStep4Background,
        flowCStep1FormBg: settings.flowCStep1FormBg,
        flowCStep2FormBg: settings.flowCStep2FormBg,
        flowCStep3FormBg: settings.flowCStep3FormBg,
        flowCStep4FormBg: settings.flowCStep4FormBg,
        flowAStep1Name: settings.flowAStep1Name,
        flowAStep2Name: settings.flowAStep2Name,
        flowAStep3Name: settings.flowAStep3Name,
        flowAStep4Name: settings.flowAStep4Name,
        flowBStep1Name: settings.flowBStep1Name,
        flowBStep2Name: settings.flowBStep2Name,
        flowBStep3Name: settings.flowBStep3Name,
        flowBStep4Name: settings.flowBStep4Name,
        flowCStep1Name: settings.flowCStep1Name,
        flowCStep2Name: settings.flowCStep2Name,
        flowCStep3Name: settings.flowCStep3Name,
        flowCStep4Name: settings.flowCStep4Name,
        profilePageBackground: settings.profilePageBackground,
        profilePageFormBg: settings.profilePageFormBg,
        appBackground: settings.appBackground || 'from-blue-50 via-purple-50 to-pink-50',
        step1Name: settings.step1Name,
        step2Name: settings.step2Name,
        step3Name: settings.step3Name,
        step4Name: settings.step4Name,
        fontFamily: settings.fontFamily,
        headingFont: settings.headingFont,
      },
      customCSS: settings.customCSS || '',
    })
  } catch (error) {
    console.error('Failed to fetch branding settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch branding settings' },
      { status: 500 }
    )
  }
}
