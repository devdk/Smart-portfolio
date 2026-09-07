import { site } from '@/lib/site.config'
import { hasProjectPage, projects } from '@/lib/content'
import { ButtonLink, Container, Meta, StatusDot } from '@/components/primitives'
import { RangeStatement } from '@/components/interactive/RangeStatement'
import { Evidence } from '@/components/sections/Evidence'
import { MagneticCta } from '@/components/interactive/MagneticCta'

/* ==========================================================================
   HERO — chapter 01, identity

   Two jobs, in this order: say briefly who Dheeraj is, then make the breadth
   of the work land as a surprise.

   ── WHAT CHANGED, AND WHY ─────────────────────────────────────────────────

   This replaced a particle-name hero. That version was well built, but it
   was wrong in two ways at once. Particle text is a recognisable effect — a
   designer places it immediately — and it spent the most valuable screen on
   the site rendering a NAME, which is the least interesting available fact.
   An earlier revision then over-corrected by leading with a single project's
   metrics, which reads as a pitch-deck slide: depth closes curiosity where
   breadth opens it.

   So the hero is now:

     1. Who, where, how long — three facts, one mono line.
     2. The range statement. Its grammar is the argument: "everything from X
        to Y", where both ends are true and swap through five real pairs.
     3. The self-portrait paragraph — brief, first person, no adjectives.
     4. The evidence wall. Thirty-two tiles you feel before you read, four of
        them real case-study links.

   The particle name moved to /about, where a name actually belongs.

   Server component throughout. The only client islands are the statement's
   swap and the magnetic CTA; the wall is pure CSS.
   ========================================================================== */

export function Hero() {
  const writtenUpCount = projects.filter(hasProjectPage).length
  const caseStudyCount = projects.filter((p) => p.tier === 'flagship').length

  return (
    <section
      id="chapter-identity"
      className="relative pb-16 pt-24 sm:pt-28 lg:pb-24 lg:pt-32"
    >
      <Container>
        {/* Who, where, how long. */}
        <div
          data-hero-fade
          style={{ '--hero-index': 0 } as React.CSSProperties}
          className="mb-9 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-ink-3"
        >
          <span className="inline-flex items-center gap-2">
            <StatusDot />
            <span className="text-ink-2">{site.name}</span>
          </span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>{site.role}</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>{site.location}</span>
        </div>

        {/* The statement. Range built into the grammar. */}
        <div data-hero-fade style={{ '--hero-index': 1 } as React.CSSProperties}>
          <RangeStatement />
        </div>


        <div
          data-hero-fade
          style={{ '--hero-index': 3 } as React.CSSProperties}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <MagneticCta>
            <ButtonLink href="/work" variant="primary" size="lg" data-cursor="VIEW">
              See the work
            </ButtonLink>
          </MagneticCta>
          <ButtonLink href="/contact" variant="secondary" size="lg">
            Build something with me
          </ButtonLink>
        </div>
      </Container>

      {/* The proof. Straight after the buttons — a first-time visitor should
          reach real work without reading a paragraph first. */}
      <Container className="mt-14 lg:mt-16">
        <div
          data-hero-fade
          style={{ '--hero-index': 4 } as React.CSSProperties}
          className="mb-6"
        >
          <Meta>Everything shipped so far</Meta>
        </div>
        <div data-hero-fade style={{ '--hero-index': 5 } as React.CSSProperties}>
          <Evidence />
        </div>
      </Container>
    </section>
  )
}
