import Link from 'next/link'
import { featuredProjects } from '@/lib/content'
import {
  Arrow,
  Container,
  Section,
  SectionHeading,
} from '@/components/primitives'
import { ProjectCard } from './ProjectCard'

/* ==========================================================================
   SELECTED WORK

   Answers spine question 2: "Could you solve MY problem?"

   Asymmetric by construction (spec §13: "avoid a monotonous grid"). The
   first flagship gets a double-width card; the rest sit beside it. The
   asymmetry comes from the data — featured order — rather than from
   hardcoded positions, so adding a project does not require re-laying out
   the section.
   ========================================================================== */

export function WorkShowcase() {
  const [lead, ...rest] = featuredProjects

  return (
    <Section id="chapter-work" aria-labelledby="work-heading">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            index="02 — Selected work"
            id="work-heading"
            title="Three projects, in enough detail to judge."
            lead="Each one leads with the problem rather than the stack. The full case studies include the architecture, the decisions and what I would change."
            className="mb-0 max-w-2xl"
          />
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 pb-2 text-[0.9375rem] text-ink-2 transition-colors duration-[var(--duration-micro)] hover:text-ink"
          >
            All work
            <span className="transition-transform duration-[var(--duration-micro)] group-hover:translate-x-0.5">
              <Arrow />
            </span>
          </Link>
        </div>

        <div
          data-reveal-group
          className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2"
        >
          {lead ? <ProjectCard project={lead} size="lg" /> : null}
          {rest.map((project) => (
            <ProjectCard key={project.slug} project={project} size="md" />
          ))}
        </div>
      </Container>
    </Section>
  )
}
