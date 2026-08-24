import Link from 'next/link'
import { decisions, incidents, allPrinciples } from '@/lib/content'
import {
  Arrow,
  Container,
  Meta,
  Pill,
  Section,
  SectionHeading,
  Surface,
} from '@/components/primitives'

/* ==========================================================================
   HOW I THINK  (teaser for /thinking)

   Answers spine question 3: "How do you think?"

   This is the most important section on the site, so it gets the strongest
   position on the home page — immediately after the work, while the reader
   is still asking "but are they any good?".

   It surfaces one of each artefact: a decision, an incident, a principle.
   The point is to show that these exist at all — almost no portfolio has
   them — and let the reader choose to go deeper.
   ========================================================================== */

const REPEAT_LABEL = {
  yes: 'Would repeat',
  no: 'Would not repeat',
  qualified: 'Would repeat, with caveats',
} as const

export function ThinkingTeaser() {
  const decision = decisions.find((d) => d.id === 'typed-data-vs-mdx') ?? decisions[0]
  const incident = incidents[0]
  const principle = allPrinciples[0]

  return (
    <Section id="chapter-thinking" band aria-labelledby="thinking-heading">
      <Container>
        <SectionHeading
          index="03 — How I think"
          id="thinking-heading"
          title="Every technical decision creates a trade-off. Here are mine, written down."
          lead="A decision log and a failure archive. Most portfolios show what was built; these show why, and what broke on the way."
        />

        <div data-reveal-group className="grid gap-4 lg:grid-cols-3">
          {/* Decision */}
          {decision ? (
            <Surface level={2} data-reveal className="flex flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                <Meta>Decision log</Meta>
                <Pill active={decision.wouldRepeat === 'yes'}>
                  {REPEAT_LABEL[decision.wouldRepeat]}
                </Pill>
              </div>
              <h3 className="mt-5 text-[1.0625rem] font-medium leading-snug text-ink">
                {decision.question}
              </h3>
              <dl className="mt-5 space-y-3 text-[0.875rem]">
                <div>
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ink-3">
                    Chose
                  </dt>
                  <dd className="mt-0.5 text-ink-2">{decision.chose}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ink-3">
                    Traded away
                  </dt>
                  <dd className="mt-0.5 line-clamp-3 text-ink-2">{decision.tradeoff}</dd>
                </div>
              </dl>
              <p className="mt-auto pt-6">
                <Link
                  href={`/thinking#${decision.id}`}
                  className="group inline-flex items-center gap-2 text-[0.875rem] text-accent"
                >
                  Read the full decision
                  <span className="transition-transform duration-[var(--duration-micro)] group-hover:translate-x-0.5">
                    <Arrow />
                  </span>
                </Link>
              </p>
            </Surface>
          ) : null}

          {/* Incident */}
          {incident ? (
            <Surface level={2} data-reveal className="flex flex-col p-6">
              <Meta>Failure archive</Meta>
              <h3 className="mt-5 text-[1.0625rem] font-medium leading-snug text-ink">
                {incident.title}
              </h3>
              <dl className="mt-5 space-y-3 text-[0.875rem]">
                <div>
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ink-3">
                    Symptom
                  </dt>
                  <dd className="mt-0.5 line-clamp-3 text-ink-2">{incident.symptom}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ink-3">
                    Lesson
                  </dt>
                  <dd className="mt-0.5 line-clamp-2 text-ink-2">{incident.lesson}</dd>
                </div>
              </dl>
              <p className="mt-auto pt-6">
                <Link
                  href={`/thinking#${incident.id}`}
                  className="group inline-flex items-center gap-2 text-[0.875rem] text-accent"
                >
                  Read the incident
                  <span className="transition-transform duration-[var(--duration-micro)] group-hover:translate-x-0.5">
                    <Arrow />
                  </span>
                </Link>
              </p>
            </Surface>
          ) : null}

          {/* Principle */}
          {principle ? (
            <Surface level={3} data-reveal className="flex flex-col p-6">
              <Meta>Principle</Meta>
              <blockquote className="mt-5 text-[1.25rem] font-medium leading-snug text-ink">
                “{principle.statement}”
              </blockquote>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-2">
                {principle.explanation}
              </p>
              <p className="mt-auto pt-6">
                <Link
                  href="/thinking#principles"
                  className="group inline-flex items-center gap-2 text-[0.875rem] text-accent"
                >
                  All principles
                  <span className="transition-transform duration-[var(--duration-micro)] group-hover:translate-x-0.5">
                    <Arrow />
                  </span>
                </Link>
              </p>
            </Surface>
          ) : null}
        </div>

        <p data-reveal className="mt-8 font-mono text-[0.8125rem] text-ink-3">
          {decisions.length} decision{decisions.length === 1 ? '' : 's'}
          <span aria-hidden="true"> · </span>
          {incidents.length} incident{incidents.length === 1 ? '' : 's'}
          <span aria-hidden="true"> · </span>
          {allPrinciples.length} principles
        </p>
      </Container>
    </Section>
  )
}
