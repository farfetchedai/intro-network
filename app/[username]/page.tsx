import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BusinessCard from '@/components/BusinessCard'

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

async function getPage(slug: string): Promise<Page | null> {
  const page = await prisma.page.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      sections: {
        orderBy: { order: 'asc' },
      },
    },
  })

  return page as Page | null
}

async function getUserByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
      statementSummary: true,
      introRequest: true,
      username: true,
      linkedinUrl: true,
      twitterUrl: true,
      facebookUrl: true,
      instagramUrl: true,
      websiteUrl: true,
    },
  })

  return user
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  // First check if username is a username
  const user = await getUserByUsername(username)

  if (user) {
    // Render public profile
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Header />
        <main className="flex-1 pt-24 pb-12 px-4">
          <div className="max-w-2xl mx-auto">
            <BusinessCard user={user} />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // If not a username, check for CMS page
  const page = await getPage(username)

  if (!page) {
    notFound()
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

  return (
    <>
      <Header />
      <div className="flex-1 bg-white">
        {page.sections.map((section) => {
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

export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: { isPublished: true },
    select: { slug: true },
  })

  return pages.map((page) => ({
    username: page.slug,
  }))
}
