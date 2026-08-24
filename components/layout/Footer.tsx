import Link from 'next/link'
import { site, build } from '@/lib/site.config'
import { Container, Meta } from '@/components/primitives'
import { LocalClock } from './LocalClock'

/* ==========================================================================
   FOOTER  (spec §32)

   Minimal but not decorative. Two things earn their place:

   1. The live local clock — a small, honest signal that a real person in a
      real timezone maintains this.

   2. The BUILD STAMP. This is the mitigation for the highest-likelihood risk
      on the whole project: an ambitious portfolio going stale. Making the
      last-updated date visible to visitors is what creates the pressure to
      keep it current. The spec put this behind a "Developer Mode"; it works
      better in the open.
   ========================================================================== */

/** Formats the build-time constant. Not a live clock — see LocalClock for
    that, which is client-only precisely because it IS live. */
function formatBuildDate(iso: string): string {
  if (!iso) return 'unknown'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'unknown'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function Footer() {
  return (
    <footer className="relative border-t border-hairline">
      <Container className="py-16">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <p className="font-mono text-[0.9375rem] uppercase tracking-[0.1em] text-ink">
              {site.name}
            </p>
            <p className="mt-2 text-[0.9375rem] text-ink-2">{site.role}</p>
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-ink-3">
              Built with curiosity.
              <br />
              Deployed with caffeine.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <nav aria-label="Footer">
              <Meta as="p" className="mb-4">
                Explore
              </Meta>
              <ul className="space-y-2.5">
                {[
                  ['Work', '/work'],
                  ['Thinking', '/thinking'],
                  ['Lab', '/lab'],
                  ['About', '/about'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href!}
                      className="text-[0.9375rem] text-ink-2 transition-colors duration-[var(--duration-micro)] hover:text-ink"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <Meta as="p" className="mb-4">
                Connect
              </Meta>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/contact"
                    className="text-[0.9375rem] text-ink-2 transition-colors hover:text-ink"
                  >
                    Start a project
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cv"
                    className="text-[0.9375rem] text-ink-2 transition-colors hover:text-ink"
                  >
                    CV
                  </Link>
                </li>
                <li>
                  <a
                    href={site.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.9375rem] text-ink-2 transition-colors hover:text-ink"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href={site.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.9375rem] text-ink-2 transition-colors hover:text-ink"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <Meta as="p" className="mb-4">
                Local time
              </Meta>
              <LocalClock />
              <p className="mt-1 text-[0.8125rem] text-ink-3">{site.location}</p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Meta>© {build.year} {site.name}</Meta>

          {/* The staleness mitigation, in plain sight. */}
          <Meta className="normal-case">
            Last updated {formatBuildDate(build.builtAt)}
            <span aria-hidden="true"> · </span>
            <span className="text-ink-3">{build.sha}</span>
          </Meta>
        </div>
      </Container>
    </footer>
  )
}
