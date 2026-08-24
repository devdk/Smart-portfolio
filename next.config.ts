import type { NextConfig } from 'next'

/* Build-time constants.

   Next.js 16.3's Cache Components correctly refuses to prerender an unstable
   `new Date()` — the value would differ between build and request. The build
   stamp and the copyright year are genuinely build-time facts, so they are
   resolved here (next.config runs once, in Node, at build time) and inlined
   as string literals. No Date call survives into the rendered output. */
const BUILD_TIME = new Date().toISOString()

/* Where this build thinks it lives, and whether it may be indexed.

   Both are inlined here rather than read at render time for the same reason
   BUILD_TIME is: they are facts about the build, they are needed in client
   components as well as server ones, and `process.env` is not available in the
   browser unless it is inlined.

   SITE_ORIGIN lets a preview deploy on onrender.com emit canonical URLs and a
   sitemap that point at ITSELF rather than at the production domain. Without
   it, a staging deploy publishes a sitemap full of production URLs, which is
   how a preview environment ends up competing with the real site in search.

   ALLOW_PLACEHOLDERS is the escape hatch for deploying a site that still has
   [BRACKETED] content — useful for showing someone work in progress. It is
   deliberately wired to indexability: you may preview a site with holes in
   it, but a site with holes is never indexable. See app/robots.ts. */
const SITE_ORIGIN = process.env.SITE_ORIGIN ?? ''
const ALLOW_PLACEHOLDERS = process.env.ALLOW_PLACEHOLDERS === '1' ? '1' : ''

const nextConfig: NextConfig = {
  env: {
    BUILD_TIME,
    BUILD_YEAR: String(new Date().getFullYear()),
    SITE_ORIGIN,
    ALLOW_PLACEHOLDERS,
    /* Render exposes the commit and branch under its own names. Mapped here so
       the footer's build stamp works on Render as well as Vercel instead of
       silently reading "local / dev" on a real deployment. */
    COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.RENDER_GIT_COMMIT ?? '',
    COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF ?? process.env.RENDER_GIT_BRANCH ?? '',
  },

  /* Next.js 16.3 Instant Navigations. The plan's ruling was to lean on the
     framework making navigations instant rather than adding an artificial
     transition curtain.

     MEASURED, not assumed: with these flags the zero-client-component
     baseline is 178.3 KB gzip; with them off it is 181.4 KB. They are
     marginally CHEAPER as well as faster to navigate, so they stay on. */
  cacheComponents: true,
  partialPrefetching: true,

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Security headers. Kept here rather than in middleware so they apply to
  // static assets too and cost nothing at request time.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
