import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get the first (and should be only) branding settings record
    let settings = await prisma.brandingSettings.findFirst()

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.brandingSettings.create({
        data: {
          primaryColor: '#3B82F6',
          secondaryColor: '#8B5CF6',
          accentColor: '#EC4899',
          step1Background: 'from-blue-400 via-purple-400 to-pink-400',
          step2Background: 'from-emerald-400 via-teal-400 to-cyan-400',
          step3Background: 'from-orange-400 via-rose-400 to-pink-400',
          step4Background: 'from-violet-400 via-purple-400 to-fuchsia-400',
          fontFamily: 'Inter, system-ui, sans-serif',
          headingFont: 'Inter, system-ui, sans-serif',
        },
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
        // Flow A (/getintros) Step Backgrounds
        flowAStep1Background: settings.flowAStep1Background,
        flowAStep2Background: settings.flowAStep2Background,
        flowAStep3Background: settings.flowAStep3Background,
        flowAStep1FormBg: settings.flowAStep1FormBg,
        flowAStep2FormBg: settings.flowAStep2FormBg,
        flowAStep3FormBg: settings.flowAStep3FormBg,
        flowAStep1ButtonBg: settings.flowAStep1ButtonBg,
        flowAStep2ButtonBg: settings.flowAStep2ButtonBg,
        flowAStep3ButtonBg: settings.flowAStep3ButtonBg,
        // Flow B (/firstdegree) Step Backgrounds
        flowBStep1Background: settings.flowBStep1Background,
        flowBStep2Background: settings.flowBStep2Background,
        flowBStep3Background: settings.flowBStep3Background,
        flowBStep4Background: settings.flowBStep4Background,
        flowBStep1FormBg: settings.flowBStep1FormBg,
        flowBStep2FormBg: settings.flowBStep2FormBg,
        flowBStep3FormBg: settings.flowBStep3FormBg,
        flowBStep4FormBg: settings.flowBStep4FormBg,
        flowBStep1ButtonBg: settings.flowBStep1ButtonBg,
        flowBStep2ButtonBg: settings.flowBStep2ButtonBg,
        flowBStep3ButtonBg: settings.flowBStep3ButtonBg,
        flowBStep4ButtonBg: settings.flowBStep4ButtonBg,
        // Flow C (/onboarding) Step Backgrounds
        flowCStep1Background: settings.flowCStep1Background,
        flowCStep2Background: settings.flowCStep2Background,
        flowCStep3Background: settings.flowCStep3Background,
        flowCStep4Background: settings.flowCStep4Background,
        flowCStep1FormBg: settings.flowCStep1FormBg,
        flowCStep2FormBg: settings.flowCStep2FormBg,
        flowCStep3FormBg: settings.flowCStep3FormBg,
        flowCStep4FormBg: settings.flowCStep4FormBg,
        flowCStep1ButtonBg: settings.flowCStep1ButtonBg,
        flowCStep2ButtonBg: settings.flowCStep2ButtonBg,
        flowCStep3ButtonBg: settings.flowCStep3ButtonBg,
        flowCStep4ButtonBg: settings.flowCStep4ButtonBg,
        // User Flow A (Referee) Step Names
        flowAStep1Name: settings.flowAStep1Name,
        flowAStep2Name: settings.flowAStep2Name,
        flowAStep3Name: settings.flowAStep3Name,
        flowAStep4Name: settings.flowAStep4Name,
        // User Flow B (First Degree) Step Names
        flowBStep1Name: settings.flowBStep1Name,
        flowBStep2Name: settings.flowBStep2Name,
        flowBStep3Name: settings.flowBStep3Name,
        flowBStep4Name: settings.flowBStep4Name,
        // User Flow C (Second Degree) Step Names
        flowCStep1Name: settings.flowCStep1Name,
        flowCStep2Name: settings.flowCStep2Name,
        flowCStep3Name: settings.flowCStep3Name,
        flowCStep4Name: settings.flowCStep4Name,
        // Profile Pages
        profilePageBackground: settings.profilePageBackground,
        profilePageFormBg: settings.profilePageFormBg,
        // App/Dashboard Background
        appBackground: settings.appBackground || 'from-blue-50 via-purple-50 to-pink-50',
        // Legacy fields
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { settings, customCSS } = body

    console.log('Saving branding - appBackground:', settings?.appBackground)

    // Get existing settings or create new
    let brandingSettings = await prisma.brandingSettings.findFirst()

    if (brandingSettings) {
      // Update existing
      brandingSettings = await prisma.brandingSettings.update({
        where: { id: brandingSettings.id },
        data: {
          productName: settings.productName,
          desktopLogo: settings.desktopLogo || null,
          mobileLogo: settings.mobileLogo || null,
          desktopSidebarLogo: settings.desktopSidebarLogo || null,
          desktopHeaderLogo: settings.desktopHeaderLogo || null,
          footerLogo: settings.footerLogo || null,
          favicon: settings.favicon || null,
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          accentColor: settings.accentColor,
          step1Background: settings.step1Background,
          step2Background: settings.step2Background,
          step3Background: settings.step3Background,
          step4Background: settings.step4Background,
          // Flow A (/getintros) Step Backgrounds
          flowAStep1Background: settings.flowAStep1Background,
          flowAStep2Background: settings.flowAStep2Background,
          flowAStep3Background: settings.flowAStep3Background,
          flowAStep1FormBg: settings.flowAStep1FormBg,
          flowAStep2FormBg: settings.flowAStep2FormBg,
          flowAStep3FormBg: settings.flowAStep3FormBg,
          flowAStep1ButtonBg: settings.flowAStep1ButtonBg,
          flowAStep2ButtonBg: settings.flowAStep2ButtonBg,
          flowAStep3ButtonBg: settings.flowAStep3ButtonBg,
          // Flow B (/firstdegree) Step Backgrounds
          flowBStep1Background: settings.flowBStep1Background,
          flowBStep2Background: settings.flowBStep2Background,
          flowBStep3Background: settings.flowBStep3Background,
          flowBStep4Background: settings.flowBStep4Background,
          flowBStep1FormBg: settings.flowBStep1FormBg,
          flowBStep2FormBg: settings.flowBStep2FormBg,
          flowBStep3FormBg: settings.flowBStep3FormBg,
          flowBStep4FormBg: settings.flowBStep4FormBg,
          flowBStep1ButtonBg: settings.flowBStep1ButtonBg,
          flowBStep2ButtonBg: settings.flowBStep2ButtonBg,
          flowBStep3ButtonBg: settings.flowBStep3ButtonBg,
          flowBStep4ButtonBg: settings.flowBStep4ButtonBg,
          // Flow C (/onboarding) Step Backgrounds
          flowCStep1Background: settings.flowCStep1Background,
          flowCStep2Background: settings.flowCStep2Background,
          flowCStep3Background: settings.flowCStep3Background,
          flowCStep4Background: settings.flowCStep4Background,
          flowCStep1FormBg: settings.flowCStep1FormBg,
          flowCStep2FormBg: settings.flowCStep2FormBg,
          flowCStep3FormBg: settings.flowCStep3FormBg,
          flowCStep4FormBg: settings.flowCStep4FormBg,
          flowCStep1ButtonBg: settings.flowCStep1ButtonBg,
          flowCStep2ButtonBg: settings.flowCStep2ButtonBg,
          flowCStep3ButtonBg: settings.flowCStep3ButtonBg,
          flowCStep4ButtonBg: settings.flowCStep4ButtonBg,
          // User Flow A (Referee) Step Names
          flowAStep1Name: settings.flowAStep1Name,
          flowAStep2Name: settings.flowAStep2Name,
          flowAStep3Name: settings.flowAStep3Name,
          flowAStep4Name: settings.flowAStep4Name,
          // User Flow B (First Degree) Step Names
          flowBStep1Name: settings.flowBStep1Name,
          flowBStep2Name: settings.flowBStep2Name,
          flowBStep3Name: settings.flowBStep3Name,
          flowBStep4Name: settings.flowBStep4Name,
          // User Flow C (Second Degree) Step Names
          flowCStep1Name: settings.flowCStep1Name,
          flowCStep2Name: settings.flowCStep2Name,
          flowCStep3Name: settings.flowCStep3Name,
          flowCStep4Name: settings.flowCStep4Name,
          // Profile Pages
          profilePageBackground: settings.profilePageBackground,
          profilePageFormBg: settings.profilePageFormBg,
          // App/Dashboard Background
          appBackground: settings.appBackground,
          // Legacy fields
          step1Name: settings.step1Name,
          step2Name: settings.step2Name,
          step3Name: settings.step3Name,
          step4Name: settings.step4Name,
          fontFamily: settings.fontFamily,
          headingFont: settings.headingFont,
          customCSS: customCSS || null,
        },
      })
    } else {
      // Create new
      brandingSettings = await prisma.brandingSettings.create({
        data: {
          productName: settings.productName,
          desktopLogo: settings.desktopLogo || null,
          mobileLogo: settings.mobileLogo || null,
          desktopSidebarLogo: settings.desktopSidebarLogo || null,
          desktopHeaderLogo: settings.desktopHeaderLogo || null,
          footerLogo: settings.footerLogo || null,
          favicon: settings.favicon || null,
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          accentColor: settings.accentColor,
          step1Background: settings.step1Background,
          step2Background: settings.step2Background,
          step3Background: settings.step3Background,
          step4Background: settings.step4Background,
          // Flow A (/getintros) Step Backgrounds
          flowAStep1Background: settings.flowAStep1Background,
          flowAStep2Background: settings.flowAStep2Background,
          flowAStep3Background: settings.flowAStep3Background,
          flowAStep1FormBg: settings.flowAStep1FormBg,
          flowAStep2FormBg: settings.flowAStep2FormBg,
          flowAStep3FormBg: settings.flowAStep3FormBg,
          flowAStep1ButtonBg: settings.flowAStep1ButtonBg,
          flowAStep2ButtonBg: settings.flowAStep2ButtonBg,
          flowAStep3ButtonBg: settings.flowAStep3ButtonBg,
          // Flow B (/firstdegree) Step Backgrounds
          flowBStep1Background: settings.flowBStep1Background,
          flowBStep2Background: settings.flowBStep2Background,
          flowBStep3Background: settings.flowBStep3Background,
          flowBStep4Background: settings.flowBStep4Background,
          flowBStep1FormBg: settings.flowBStep1FormBg,
          flowBStep2FormBg: settings.flowBStep2FormBg,
          flowBStep3FormBg: settings.flowBStep3FormBg,
          flowBStep4FormBg: settings.flowBStep4FormBg,
          flowBStep1ButtonBg: settings.flowBStep1ButtonBg,
          flowBStep2ButtonBg: settings.flowBStep2ButtonBg,
          flowBStep3ButtonBg: settings.flowBStep3ButtonBg,
          flowBStep4ButtonBg: settings.flowBStep4ButtonBg,
          // Flow C (/onboarding) Step Backgrounds
          flowCStep1Background: settings.flowCStep1Background,
          flowCStep2Background: settings.flowCStep2Background,
          flowCStep3Background: settings.flowCStep3Background,
          flowCStep4Background: settings.flowCStep4Background,
          flowCStep1FormBg: settings.flowCStep1FormBg,
          flowCStep2FormBg: settings.flowCStep2FormBg,
          flowCStep3FormBg: settings.flowCStep3FormBg,
          flowCStep4FormBg: settings.flowCStep4FormBg,
          flowCStep1ButtonBg: settings.flowCStep1ButtonBg,
          flowCStep2ButtonBg: settings.flowCStep2ButtonBg,
          flowCStep3ButtonBg: settings.flowCStep3ButtonBg,
          flowCStep4ButtonBg: settings.flowCStep4ButtonBg,
          // User Flow A (Referee) Step Names
          flowAStep1Name: settings.flowAStep1Name,
          flowAStep2Name: settings.flowAStep2Name,
          flowAStep3Name: settings.flowAStep3Name,
          flowAStep4Name: settings.flowAStep4Name,
          // User Flow B (First Degree) Step Names
          flowBStep1Name: settings.flowBStep1Name,
          flowBStep2Name: settings.flowBStep2Name,
          flowBStep3Name: settings.flowBStep3Name,
          flowBStep4Name: settings.flowBStep4Name,
          // User Flow C (Second Degree) Step Names
          flowCStep1Name: settings.flowCStep1Name,
          flowCStep2Name: settings.flowCStep2Name,
          flowCStep3Name: settings.flowCStep3Name,
          flowCStep4Name: settings.flowCStep4Name,
          // Profile Pages
          profilePageBackground: settings.profilePageBackground,
          profilePageFormBg: settings.profilePageFormBg,
          // App/Dashboard Background
          appBackground: settings.appBackground,
          // Legacy fields
          step1Name: settings.step1Name,
          step2Name: settings.step2Name,
          step3Name: settings.step3Name,
          step4Name: settings.step4Name,
          fontFamily: settings.fontFamily,
          headingFont: settings.headingFont,
          customCSS: customCSS || null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Branding settings saved successfully',
    })
  } catch (error) {
    console.error('Failed to save branding settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save branding settings' },
      { status: 500 }
    )
  }
}
