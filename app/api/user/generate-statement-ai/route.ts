import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { skills, company, achievement, achievementMethod, introRequest, firstName } = body

    // Validate required fields
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: 'At least one skill is required' },
        { status: 400 }
      )
    }

    // Get API settings
    const apiSettings = await prisma.apiSettings.findFirst()

    if (!apiSettings?.anthropicApiKey) {
      return NextResponse.json(
        { error: 'AI service not configured. Please add your Anthropic API key in admin settings.' },
        { status: 503 }
      )
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiSettings.anthropicApiKey,
    })

    // Build context for the AI
    const filteredSkills = skills.filter((s: string) => s && s.trim())
    const primarySkill = filteredSkills[0] || ''
    const secondarySkill = filteredSkills[1] || ''
    const skillsList = filteredSkills.join(' and ')

    // Generate 1st person summary (for business card)
    const firstPersonPrompt = `Generate a professional, first-person summary for a business card profile. The summary should be natural-sounding, engaging, and 2-3 sentences long.

Here's the person's information:
- Name: ${firstName || 'This person'}
- Primary Skill: ${primarySkill}
${secondarySkill ? `- Secondary Skill: ${secondarySkill}` : ''}
${company ? `- Company where achievement happened: ${company}` : ''}
${achievement ? `- Key Achievement: ${achievement}` : ''}
${achievementMethod ? `- How they achieved it: ${achievementMethod}` : ''}
${introRequest ? `- Looking to meet: ${introRequest}` : ''}

Write a first-person professional summary that:
1. MUST mention BOTH skills (${skillsList}) - weave them naturally into the narrative
2. MUST mention the company name "${company}" when describing the achievement
3. Describes the achievement in context of the company (without being boastful)
4. Ends with what kind of connections they're seeking (if provided)
5. Sounds conversational and genuine, not robotic
6. Is 2-3 sentences maximum

Return ONLY the summary text, no quotes or additional formatting.`

    const firstPersonMessage = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [{ role: 'user', content: firstPersonPrompt }],
    })

    const firstPersonContent = firstPersonMessage.content.find(block => block.type === 'text')
    if (!firstPersonContent || firstPersonContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Failed to generate summary' },
        { status: 500 }
      )
    }

    const statementSummary = firstPersonContent.text.trim()

    // Generate 3rd person summary (for referral requests) - shorter and in 3rd person
    const thirdPersonPrompt = `Convert the following first-person professional summary into a concise third-person version. Make it approximately 25% shorter while keeping the key information. Use "${firstName}" or "they/their" instead of "I/my".

Original first-person summary:
"${statementSummary}"

Requirements:
1. Write in third person (use "${firstName}" or "they/their")
2. Keep it to 1-2 sentences maximum
3. Maintain the key skills, company name, and achievement
4. Sound natural and professional
5. Make it approximately 25% shorter than the original

Return ONLY the third-person summary text, no quotes or additional formatting.`

    const thirdPersonMessage = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      messages: [{ role: 'user', content: thirdPersonPrompt }],
    })

    const thirdPersonContent = thirdPersonMessage.content.find(block => block.type === 'text')
    const statementSummary3rdPerson = thirdPersonContent?.type === 'text'
      ? thirdPersonContent.text.trim()
      : null

    return NextResponse.json({
      success: true,
      statementSummary,
      statementSummary3rdPerson,
    })
  } catch (error) {
    console.error('AI generation error:', error)

    // Handle specific Anthropic errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Anthropic API key in admin settings.' },
          { status: 401 }
        )
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate summary. Please try again or write your own.' },
      { status: 500 }
    )
  }
}
