import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'
import * as mammoth from 'mammoth'
import { extractText } from 'unpdf'

// Extract text from PDF using unpdf (no canvas dependencies)
async function extractPdfText(buffer: Buffer): Promise<string> {
  // unpdf requires Uint8Array, not Buffer
  const uint8Array = new Uint8Array(buffer)
  const result = await extractText(uint8Array)
  // result.text can be a string or array of strings
  if (Array.isArray(result.text)) {
    return result.text.join('\n')
  }
  return String(result.text || '')
}

// Extract text from DOCX
async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Check file type
    const fileName = file.name.toLowerCase()
    const isPdf = fileName.endsWith('.pdf')
    const isDocx = fileName.endsWith('.docx')

    if (!isPdf && !isDocx) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload a PDF or DOCX file.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text from file
    let resumeText: string
    try {
      if (isPdf) {
        resumeText = await extractPdfText(buffer)
      } else {
        resumeText = await extractDocxText(buffer)
      }
    } catch (extractError) {
      console.error('Text extraction error:', extractError)
      return NextResponse.json(
        { success: false, error: 'Failed to read the file. Please ensure it is a valid PDF or DOCX.' },
        { status: 400 }
      )
    }

    // Check if we got any text
    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: 'Could not extract text from the file. The file may be empty or image-based.' },
        { status: 400 }
      )
    }

    // Get API settings
    const apiSettings = await prisma.apiSettings.findFirst()

    if (!apiSettings?.anthropicApiKey) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please add your Anthropic API key in admin settings.' },
        { status: 503 }
      )
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiSettings.anthropicApiKey,
    })

    // Build the prompt for career extraction
    const prompt = `Extract career history from this resume text. Return a JSON array of positions.

Each position should have:
- title: job title (string)
- companyName: company name (string)
- location: city/state or remote (string or null)
- startDate: start date in YYYY-MM format (string or null)
- endDate: end date in YYYY-MM format, null if current (string or null)
- isCurrent: true if this is current position (boolean)
- description: brief job description, 1-2 sentences max (string or null)

Important:
- Order from most recent to oldest
- Only include professional work experience, not education
- Parse dates to YYYY-MM format (e.g., "January 2020" becomes "2020-01")
- If only a year is given, use January of that year (e.g., "2020" becomes "2020-01")
- Mark the most recent position as isCurrent: true if no end date is specified

Resume text:
${resumeText.substring(0, 15000)}

Respond with ONLY a valid JSON array, no markdown formatting, no code blocks, no other text.`

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { success: false, error: 'Failed to parse resume. Please try again.' },
        { status: 500 }
      )
    }

    // Parse the JSON response
    let careerEntries
    try {
      // Clean up the response (remove any markdown formatting if present)
      let jsonText = textContent.text.trim()
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7)
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3)
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3)
      }
      jsonText = jsonText.trim()

      careerEntries = JSON.parse(jsonText)

      if (!Array.isArray(careerEntries)) {
        throw new Error('Response is not an array')
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw response:', textContent.text)
      return NextResponse.json(
        { success: false, error: 'Failed to parse career data from resume. Please try again or add entries manually.' },
        { status: 500 }
      )
    }

    // Validate and clean up entries
    const validEntries = careerEntries
      .filter((entry: Record<string, unknown>) => entry.title && entry.companyName)
      .map((entry: Record<string, unknown>) => ({
        title: String(entry.title || ''),
        companyName: String(entry.companyName || ''),
        location: entry.location ? String(entry.location) : null,
        startDate: entry.startDate ? String(entry.startDate) : null,
        endDate: entry.endDate ? String(entry.endDate) : null,
        isCurrent: Boolean(entry.isCurrent),
        description: entry.description ? String(entry.description) : null,
      }))

    if (validEntries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No career entries found in the resume.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      entries: validEntries,
      message: `Found ${validEntries.length} career ${validEntries.length === 1 ? 'entry' : 'entries'}`,
    })

  } catch (error) {
    console.error('Resume import error:', error)

    // Handle specific Anthropic errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key. Please check your Anthropic API key in admin settings.' },
          { status: 401 }
        )
      }
      if (error.status === 429) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process resume. Please try again.' },
      { status: 500 }
    )
  }
}
