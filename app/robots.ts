import type { MetadataRoute } from 'next'
import { build } from '@/lib/site.config'

/* robots.txt

   The origin comes from the build rather than from site.config's production
   domain, so a preview on onrender.com points its sitemap at itself. A staging
   deploy that publishes production URLs is how a preview ends up competing
   with the real site in search results.

   And when a build was allowed to ship with [BRACKETED] placeholders
   (ALLOW_PLACEHOLDERS=1), everything is disallowed. That coupling is
   deliberate: a half-finished portfolio is worth showing to a person and worth
   hiding from a crawler, because the crawler will cache the holes. */

export default function robots(): MetadataRoute.Robots {
  const base = build.origin

  if (!build.indexable) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      host: base,
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The API route has nothing to crawl and should not appear anywhere.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
