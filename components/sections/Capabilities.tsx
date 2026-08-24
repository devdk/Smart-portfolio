import { site } from '@/lib/site.config'
import {
  Container,
  Meta,
  Pill,
  Section,
  SectionHeading,
  Surface,
} from '@/components/primitives'

/* ==========================================================================
   CAPABILITIES

   Answers spine question 1: "What do you build?"

   This is deliberately NOT a skills section with proficiency bars (spec §21
   bans percentages, correctly — they are meaningless and everyone knows it).
   It is four things a client can actually buy, described in outcome terms,
   with the technologies as supporting detail rather than the headline.

   The per-technology rationale lives on each project's `stack[].why`, which
   is where it means something.
   ========================================================================== */

export function Capabilities() {
  return (
    <Section id="chapter-craft" band aria-labelledby="capabilities-heading">
      <Container>
        <SectionHeading
          index="01 — What I build"
          id="capabilities-heading"
          title="Four kinds of problem I solve."
          lead="Most work falls into one of these. If yours does not, it is probably still worth a conversation."
        />

        <div
          data-reveal-group
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {site.capabilities.map((capability, i) => (
            <Surface
              key={capability.title}
              level={2}
              data-reveal
              className="flex flex-col p-6"
            >
              <Meta className="mb-5 block">
                {String(i + 1).padStart(2, '0')}
              </Meta>
              <h3 className="text-[1.125rem] font-medium text-ink">
                {capability.title}
              </h3>
              <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-2">
                {capability.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {capability.tech.map((tech) => (
                  <Pill key={tech}>{tech}</Pill>
                ))}
              </div>
            </Surface>
          ))}
        </div>
      </Container>
    </Section>
  )
}
