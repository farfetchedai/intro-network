import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic'

interface Element {
  id: string
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'image' | 'button'
  content: string
  order: number
  url?: string
}

interface Column {
  id: string
  align: 'left' | 'center' | 'right'
  classes: string
  elements: Element[]
}

interface SectionContent {
  columns: Column[]
}

interface Section {
  id: string
  order: number
  isFullWidth: boolean
  columns: number
  content: string
}

interface Page {
  id: string
  title: string
  slug: string
  sections: Section[]
}

async function getHomepage(): Promise<Page | null> {
  try {
    const homepage = await prisma.page.findFirst({
      where: {
        isHomepage: true,
        isPublished: true,
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return homepage as Page | null
  } catch (error) {
    // Handle case where Page table doesn't exist (e.g., migrations not run)
    console.error('Failed to fetch CMS homepage:', error)
    return null
  }
}

const renderElement = (element: Element) => {
  const commonClasses = 'w-full'

  switch (element.type) {
    case 'h1':
      return (
        <h1 key={element.id} className={`${commonClasses} text-4xl font-bold text-gray-900 mb-4`}>
          {element.content}
        </h1>
      )
    case 'h2':
      return (
        <h2 key={element.id} className={`${commonClasses} text-3xl font-bold text-gray-900 mb-3`}>
          {element.content}
        </h2>
      )
    case 'h3':
      return (
        <h3 key={element.id} className={`${commonClasses} text-2xl font-bold text-gray-900 mb-3`}>
          {element.content}
        </h3>
      )
    case 'h4':
      return (
        <h4 key={element.id} className={`${commonClasses} text-xl font-bold text-gray-900 mb-2`}>
          {element.content}
        </h4>
      )
    case 'p':
      return (
        <p key={element.id} className={`${commonClasses} text-gray-700 mb-4`}>
          {element.content}
        </p>
      )
    case 'image':
      return element.content ? (
        <img
          key={element.id}
          src={element.content}
          alt=""
          className={`${commonClasses} h-auto rounded-lg mb-4`}
        />
      ) : null
    case 'button':
      return (
        <a
          key={element.id}
          href={element.url || '#'}
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-4"
        >
          {element.content}
        </a>
      )
    default:
      return null
  }
}

const getAlignmentClass = (align: Column['align']) => {
  switch (align) {
    case 'center':
      return 'text-center items-center'
    case 'right':
      return 'text-right items-end'
    default:
      return 'text-left items-start'
  }
}

const getColumnGridClass = (columnCount: number) => {
  switch (columnCount) {
    case 2:
      return 'grid-cols-1 md:grid-cols-2'
    case 3:
      return 'grid-cols-1 md:grid-cols-3'
    default:
      return 'grid-cols-1'
  }
}

export default async function Home() {
  // Check if there's a CMS homepage
  const cmsHomepage = await getHomepage()

  // If CMS homepage exists, render it
  if (cmsHomepage) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white">
          {cmsHomepage.sections.map((section) => {
            const content: SectionContent = JSON.parse(section.content)
            const WrapperComponent = section.isFullWidth ? 'div' : 'div'
            const wrapperClass = section.isFullWidth ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'

            return (
              <section key={section.id} className="py-12">
                <WrapperComponent className={wrapperClass}>
                  <div className={`grid gap-8 ${getColumnGridClass(section.columns)}`}>
                    {content.columns.map((column) => (
                      <div
                        key={column.id}
                        className={`flex flex-col ${getAlignmentClass(column.align)} ${column.classes}`}
                      >
                        {column.elements
                          .sort((a, b) => a.order - b.order)
                          .map((element) => renderElement(element))}
                      </div>
                    ))}
                  </div>
                </WrapperComponent>
              </section>
            )
          })}
        </div>
        <Footer />
      </>
    )
  }

  // Default landing page if no CMS homepage
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 pb-16">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Intro Network
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Expand your professional network through trusted introductions from
                your contacts
              </p>
            </div>

            <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Create Profile</h3>
                <p className="text-gray-600">
                  Share your skills, experience, and achievements to help others
                  introduce you
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  2. Ask Your Network
                </h3>
                <p className="text-gray-600">
                  Request introductions from your 1st degree contacts who can
                  connect you
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Get Connected</h3>
                <p className="text-gray-600">
                  Receive vetted introductions and expand your professional circle
                </p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/referee"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Get Started
              </Link>
            </div>

            <div className="mt-24 bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <div className="space-y-4 text-gray-600">
                <div>
                  <strong className="text-gray-900">For Referees:</strong> Create
                  your profile with your skills and achievements, add your 1st
                  degree contacts, customize your message, and send requests for
                  introductions.
                </div>
                <div>
                  <strong className="text-gray-900">
                    For 1st Degree Contacts:
                  </strong>{' '}
                  Receive requests from people you know, add people from your network
                  who would benefit from connecting, and facilitate introductions.
                </div>
                <div>
                  <strong className="text-gray-900">For Referrals:</strong> Receive
                  introduction requests with context about the person, review their
                  background, and approve or decline the introduction.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
