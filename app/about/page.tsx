import type { Metadata } from 'next'
import { site } from '@/lib/site.config'
import { ParticleName } from '@/components/interactive/ParticleName'
import { isPlaceholder } from '@/lib/schema'
import {
  ButtonLink,
  Container,
  Meta,
  Section,
  Surface,
  cx,
} from '@/components/primitives'

export const metadata: Metadata = {
  title: 'About',
  description: `About ${site.name} — ${site.role}. ${site.positioning}`,
}

/* ==========================================================================
   ABOUT  (spec §30)

   The brief was specific about what to avoid: "I'm a passionate developer".
   So this is a story in four beats plus a timeline, and every beat is a
   concrete claim rather than a disposition.

   Placeholders render muted rather than hidden — an empty section would be
   invisible in review, whereas a visibly unfilled one gets written.
   ========================================================================== */

export default function AboutPage() {
  return (
    <>
      <Section className="pt-32 sm:pt-40">
        <Container>
          <Meta className="mb-6 block">About</Meta>

          {/* The particle name lives here, not on the home page.

              It was the hero for a while, and it was well built — but a hero's
              job is to say what someone does and how wide their range goes,
              and a name does neither. On a page that is explicitly about the
              person, the name IS the subject, so the effect finally sits
              where its content matches its prominence.

              A real <h1> is inside it; the canvas is aria-hidden decoration. */}
          <ParticleName text="DHEERAJ" />

          <p className="text-body-lg mt-6 max-w-2xl text-ink-2">{site.about.intro}</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/work">See the work</ButtonLink>
            <ButtonLink href="/cv" variant="ghost">
              CV and experience
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <Section band aria-labelledby="story-heading">
        <Container>
          <h2 id="story-heading" className="sr-only">
            Background
          </h2>
          <div data-reveal-group className="grid gap-4 md:grid-cols-2">
            {site.about.sections.map((section, i) => (
              <Surface key={section.heading} level={2} data-reveal className="p-6 sm:p-8">
                <Meta className="mb-5 block">
                  {String(i + 1).padStart(2, '0')}
                </Meta>
                <h3 className="text-h3 font-medium text-ink">{section.heading}</h3>
                <p
                  className={cx(
                    'mt-4 text-[1rem] leading-relaxed',
                    isPlaceholder(section.body) ? 'text-ink-3' : 'text-ink-2',
                  )}
                >
                  {section.body}
                </p>
              </Surface>
            ))}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="timeline-heading">
        <Container>
          <h2 id="timeline-heading" className="text-h2 mb-12 font-medium text-ink">
            Timeline
          </h2>

          <ol data-reveal-group className="relative">
            {/* The rail. Decorative, so it is hidden from assistive tech —
                the ordered list already conveys sequence. */}
            <span
              aria-hidden="true"
              className="absolute bottom-2 left-[5.5rem] top-2 hidden w-px bg-hairline sm:block"
            />

            {site.about.timeline.map((entry, i) => (
              <li
                key={`${entry.year}-${i}`}
                data-reveal
                className="relative flex flex-col gap-2 py-5 sm:flex-row sm:gap-10"
              >
                <Meta className="sm:w-20 sm:shrink-0 sm:text-right">{entry.year}</Meta>
                <span
                  aria-hidden="true"
                  className="absolute left-[5.5rem] top-[1.9rem] hidden size-2 -translate-x-1/2 rounded-full bg-accent sm:block"
                />
                <p
                  className={cx(
                    'text-[1rem] sm:pl-10',
                    isPlaceholder(entry.event) ? 'text-ink-3' : 'text-ink-2',
                  )}
                >
                  {entry.event}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  )
}
