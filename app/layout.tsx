import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import '@/styles/theme.css'

import { build, site } from '@/lib/site.config'
import { buildSearchIndex } from '@/lib/content'
import { Background } from '@/components/layout/Background'
import { StatusBar } from '@/components/layout/StatusBar'
import { Beam } from '@/components/layout/Beam'
import { ChapterNarrative } from '@/components/layout/ChapterNarrative'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Cursor } from '@/components/layout/Cursor'
import { CommandPaletteLoader } from '@/components/layout/CommandPaletteLoader'
import { MotionProvider } from '@/components/layout/MotionProvider'

const canonical = site.url.includes('[') ? undefined : site.url

export const metadata: Metadata = {
  ...(canonical ? { metadataBase: new URL(canonical) } : {}),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.positioning,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  keywords: [
    'web developer',
    'software developer',
    'Next.js',
    'React',
    'Shopify',
    'WordPress',
    'e-commerce development',
    site.name,
  ],
  openGraph: {
    type: 'website',
    title: `${site.name} — ${site.role}`,
    description: site.positioning,
    siteName: site.name,
    ...(canonical ? { url: canonical } : {}),
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.role}`,
    description: site.positioning,
  },
  /* Derived from the build, never hardcoded true. A preview deploy carrying
     placeholders must not tell crawlers to index it — and this is the signal
     that actually keeps a page out of the index, since robots.txt only stops
     the crawl, not the listing of a URL someone else linked to. */
  robots: build.indexable
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
  alternates: canonical ? { canonical: '/' } : undefined,
}

export const viewport: Viewport = {
  themeColor: '#08090A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

/* JSON-LD. Person + WebSite, per spec §45. Emitted server-side so it costs
   nothing at runtime and is present for crawlers on first byte. */
function StructuredData() {
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Person',
      '@id': `${canonical ?? ''}#person`,
      name: site.name,
      jobTitle: site.role,
      description: site.positioning,
      knowsAbout: [
        'Web Development',
        'React',
        'Next.js',
        'TypeScript',
        'Node.js',
        'Shopify',
        'WordPress',
        'E-commerce',
      ],
      ...(canonical ? { url: canonical } : {}),
    },
    {
      '@type': 'WebSite',
      '@id': `${canonical ?? ''}#website`,
      name: `${site.name} — ${site.role}`,
      description: site.positioning,
      ...(canonical ? { url: canonical } : {}),
      publisher: { '@id': `${canonical ?? ''}#person` },
    },
  ]

  return (
    <script
      type="application/ld+json"
      // Server-rendered from a static object literal — no user input reaches this.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
      }}
    />
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchIndex = buildSearchIndex()

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <StructuredData />
        {/* Marks JS as present so CSS can safely pre-hide elements that the
            IntersectionObserver will reveal. Without this, a script failure
            would leave content permanently invisible. Inlined and synchronous
            by design — it must run before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[600] focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-accent-ink"
        >
          Skip to content
        </a>

        <Background />
        <Cursor />
        <MotionProvider />

        {/* The chapter hue system. ChapterNarrative writes the active hue onto
            <html>; because those three custom properties are registered with
            @property in theme.css, the browser interpolates them and the whole
            interface re-tints together. StatusBar and Beam are the two most
            visible carriers of that colour. */}
        <ChapterNarrative />
        <StatusBar />
        <Beam />

        <Nav />

        <main id="main" className="relative">
          {children}
        </main>

        <Footer />

        <CommandPaletteLoader entries={searchIndex} />
      </body>
    </html>
  )
}
