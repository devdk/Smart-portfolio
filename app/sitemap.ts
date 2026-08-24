import type { MetadataRoute } from 'next'
import { build } from '@/lib/site.config'
import { getCaseStudySlugs } from '@/lib/content'

/* Sitemap (spec §45).

   `/lab` is deliberately excluded: it is noindex in V1 because it has no
   content yet, and listing a noindex URL in a sitemap sends contradictory
   signals to crawlers. It gets added back with the V2 Lab.

   lastModified uses the build stamp rather than `new Date()` — the same
   build-time constant the footer uses, so the two can never disagree. */
export default function sitemap(): MetadataRoute.Sitemap {
  /* No sitemap for a build that is not indexable. Returning an empty array is
     the honest answer: robots.txt already disallows everything, and a sitemap
     listing pages that robots forbids is a contradiction crawlers log as an
     error. */
  if (!build.indexable) return []

  /* The origin this build is served from, not the production domain — see
     app/robots.ts. A preview deploy's sitemap must describe the preview. */
  const base = build.origin
  const lastModified = build.builtAt ? new Date(build.builtAt) : undefined

  const routes: { path: string; priority: number; changeFrequency: 'monthly' | 'yearly' }[] = [
    { path: '', priority: 1, changeFrequency: 'monthly' },
    { path: '/work', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/thinking', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/cv', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.8, changeFrequency: 'yearly' },
  ]

  const caseStudies = getCaseStudySlugs().map((slug) => ({
    path: `/work/${slug}`,
    priority: 0.8,
    changeFrequency: 'yearly' as const,
  }))

  return [...routes, ...caseStudies].map((route) => ({
    url: `${base}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
