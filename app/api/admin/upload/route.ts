import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const field = formData.get('field') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename with timestamp
    const timestamp = Date.now()
    const filename = `${field}-${timestamp}-${file.name.replace(/\s+/g, '-')}`

    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filepath = join(uploadDir, filename)

    // Ensure the uploads directory exists
    try {
      await writeFile(filepath, buffer)
    } catch (error) {
      // If directory doesn't exist, create it
      const { mkdir } = await import('fs/promises')
      await mkdir(uploadDir, { recursive: true })
      await writeFile(filepath, buffer)
    }

    // Return the public URL
    const url = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      url,
    })
  } catch (error) {
    console.error('Failed to upload file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
