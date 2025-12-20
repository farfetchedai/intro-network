import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const { handlers } = NextAuth(authOptions)

// Export the handlers for Next.js 16
export const GET = handlers.GET
export const POST = handlers.POST
