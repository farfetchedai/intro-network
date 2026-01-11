import { NextResponse } from 'next/server'
import { uploadToS3, isS3Configured } from '@/lib/services/s3'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('[Upload] Received file:', file?.name, 'size:', file?.size, 'type:', file?.type)

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Get file data
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mimeType = file.type || 'application/octet-stream'

    // Check if S3 is configured
    const useS3 = await isS3Configured()
    console.log('[Upload] S3 configured:', useS3)

    if (useS3) {
      // S3 upload - allow larger files (10MB)
      const maxS3Size = 10 * 1024 * 1024
      if (file.size > maxS3Size) {
        return NextResponse.json(
          { success: false, error: 'File too large. Maximum size is 10MB.' },
          { status: 400 }
        )
      }

      // Determine folder based on mime type
      const folder = mimeType.startsWith('image/') ? 'images' : 'documents'

      const result = await uploadToS3(buffer, file.name, mimeType, folder)
      console.log('[Upload] S3 upload result:', result)

      if (!result.success) {
        // Fallback to base64 if S3 upload fails
        console.warn('[Upload] S3 upload failed, falling back to base64:', result.error)
        return uploadAsBase64(buffer, mimeType, file.size)
      }

      console.log('[Upload] Success - S3 URL:', result.url)
      return NextResponse.json({
        success: true,
        url: result.url,
        storage: 's3',
      })
    } else {
      // Fallback to base64 storage
      return uploadAsBase64(buffer, mimeType, file.size)
    }
  } catch (error) {
    console.error('Failed to upload file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

function uploadAsBase64(buffer: Buffer, mimeType: string, fileSize: number) {
  // Check file size (limit to 2MB for base64 storage)
  const maxSize = 2 * 1024 * 1024
  if (fileSize > maxSize) {
    return NextResponse.json(
      { success: false, error: 'File too large. Maximum size is 2MB. Enable S3 storage for larger files.' },
      { status: 400 }
    )
  }

  const base64 = buffer.toString('base64')
  const dataUrl = `data:${mimeType};base64,${base64}`

  return NextResponse.json({
    success: true,
    url: dataUrl,
    storage: 'base64',
  })
}
