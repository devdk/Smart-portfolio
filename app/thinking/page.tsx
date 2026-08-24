import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'

import { decisions, incidents, allPrinciples, getProject } from '@/lib/content'
import { isPlaceholder, metricPresentation, type Decision, type Incident } from '@/lib/schema'
import {
  Arrow,
  Container,
  EmptyState,
  Meta,
  Pill,
  Section,
  SectionHeading,
  Surface,
  cx,
} from '@/components/primitives'

/* ==========================================================================
   /thinking — THE DIFFERENTIATOR

   Three artefacts, in the order a sceptical reader needs them:
     1. Decisions  — can this person reason about alternatives?
     2. Failures   — what happens when they are wrong?
     3. Principles — what generalises out of the two above?

   Fully server-rendered on purpose. Every earlier draft of this page wanted
   filters, accordions and a tab set, all of which hide the content that is
   the entire reason the page exists — and all of which would ship JavaScript
   to do what a heading and an anchor already do. Collapsed content is also
   not indexable in the way open content is, and this is the page that should
   be indexed. So: no client component, no interactivity, everything visible.

   Deep links matter here. The command palette (lib/content.ts) emits
   /thinking#<decision-id> and /thinking#<incident-id>, so every entry heading
   carries its content id. html { scroll-padding-top } in theme.css clears the
   fixed nav on those jumps, so no per-anchor offset is needed.
   ========================================================================== */

export const metadata: Metadata = {
  title: 'Thinking',
  description:
    'A decision log, a failure archive and the principles behind them: why each technical choice was made, what it cost, what broke, and what changed as a result.',
}

const REPEAT_LABEL: Record<Decision['wouldRepeat'], string> = {
  yes: 'Would repeat',
  no: 'Would not repeat',
  qualified: 'Would repeat, with caveats',
}

/* --- Local helpers -------------------------------------------------------
   These are page-local rather than promoted into primitives: they encode the
   shape of decision/incident records, not a reusable visual language.       */

/**
 * Prose that may still be an unfilled [PLACEHOLDER]. Placeholders render in
 * ink-3 so an unfinished entry looks unfinished instead of looking like real
 * content — the text itself is passed through untouched, because inventing a
 * replacement is exactly what lib/schema.ts exists to prevent.
 */
function Value({ children, className }: { children: string; className?: string }) {
  return (
    <p
      className={cx(
        'text-[0.9375rem] leading-relaxed',
        isPlaceholder(children) ? 'text-ink-3' : 'text-ink-2',
        className,
      )}
    >
      {children}
    </p>
  )
}

/** A labelled field inside a <dl>. The div wrapper is valid in a dl and keeps
    dt/dd pairs from being separated by the grid. */
function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Meta as="dt" className="mb-2 block">
        {label}
      </Meta>
      <dd>{children}</dd>
    </div>
  )
}

/** Pros or cons. The +/− glyph is decorative; the Meta label carries the
    meaning, so screen readers are not read a column of symbols. */
function Judgements({
  label,
  items,
  tone,
}: {
  label: string
  items: readonly string[]
  tone: 'pro' | 'con'
}) {
  if (items.length === 0) return null
  return (
    <div className="mt-4">
      <Meta as="p" className="mb-2 block">
        {label}
      </Meta>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[0.875rem] leading-relaxed">
            <span aria-hidden="true" className={tone === 'pro' ? 'text-accent' : 'text-ink-3'}>
              {tone === 'pro' ? '+' : '−'}
            </span>
            <span className={isPlaceholder(item) ? 'text-ink-3' : 'text-ink-2'}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Related projects. Resolved through getProject so the real title shows
    where the project exists, with the slug as an honest fallback. */
function RelatedProjects({ slugs }: { slugs: readonly string[] }) {
  if (slugs.length === 0) return null
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline pt-5">
      <Meta>Appears in</Meta>
      {slugs.map((slug) => (
        <Link
          key={slug}
          href={`/work/${slug}`}
          className="group inline-flex items-center gap-1.5 text-[0.875rem] text-accent"
        >
          {getProject(slug)?.title ?? slug}
          <span className="transition-transform duration-[var(--duration-micro)] group-hover:translate-x-0.5">
            <Arrow className="size-3.5" />
          </span>
        </Link>
      ))}
    </div>
  )
}

/**
 * before → after for an incident. metricPresentation() is the single source of
 * truth for how a source is labelled and whether it may be stated as an
 * unqualified claim; re-implementing that mapping here is precisely how an
 * honesty gate drifts out of sync with the data it guards.
 */
function IncidentResult({ result }: { result: NonNullable<Incident['result']> }) {
  const { claimable, label } = metricPresentation({
    label: 'Result',
    before: result.before,
    after: result.after,
    source: result.source,
    capturedAt: result.capturedAt,
  })

  return (
    <Surface level={1} className="flex flex-wrap items-baseline gap-x-3 gap-y-2 px-5 py-4">
      <span className="font-mono text-[1.0625rem] text-ink-3">{result.before}</span>
      <Arrow className="text-ink-3" />
      <span className="font-mono text-[1.0625rem] text-ink">{result.after}</span>
      <Meta className="w-full">
        {claimable ? label : `${label} — not independently verified`}
        <span aria-hidden="true"> · </span>
        {result.capturedAt}
      </Meta>
    </Surface>
  )
}

/* --- Page ---------------------------------------------------------------- */

export default function ThinkingPage() {
  return (
    <>
      {/* Page header. Not a <Section>: it sits under the fixed nav and needs
          the hero's clearance rather than the standard section rhythm. */}
      <header className="pb-16 pt-32 sm:pt-40">
        <Container>
          <Meta className="mb-5 block">Thinking</Meta>
          <h1 className="text-h1 max-w-4xl font-medium text-ink">
            Decisions, failures, and what generalised out of them.
          </h1>
          <p className="text-body-lg mt-6 max-w-2xl text-ink-2">
            Most portfolios show what was built. This one shows why: the alternatives that were
            considered, what each choice cost, and what broke afterwards. It is the part of the
            work that cannot be faked, which is the reason it is published.
          </p>

          {/* Plain anchors, not <Link>: these are same-document jumps, so
              client-side routing has nothing to do. */}
          <nav aria-label="Sections on this page" className="mt-10 flex flex-wrap gap-2">
            {[
              ['#decisions', `${decisions.length} decisions`],
              ['#failures', `${incidents.length} incidents`],
              ['#principles', `${allPrinciples.length} principles`],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full border border-hairline bg-white/[0.02] px-4 py-2 font-mono text-[0.75rem] uppercase tracking-[0.06em] text-ink-3 transition-colors duration-[var(--duration-micro)] hover:border-hairline-strong hover:text-ink-2"
              >
                {label}
              </a>
            ))}
          </nav>
        </Container>
      </header>

      {/* ---------- 01 Decision log ---------- */}
      <Section id="decisions" aria-labelledby="decisions-heading" className="border-t border-hairline">
        <Container>
          <SectionHeading
            index="01 — Decision log"
            id="decisions-heading"
            title="Every technical decision creates a trade-off. These are the ones I made, and what they cost."
            lead="Each entry names the alternatives it beat, the single deciding factor, and what was given up. A decision with no trade-off is a preference."
          />

          {decisions.length === 0 ? (
            <EmptyState>No decisions have been written up yet.</EmptyState>
          ) : (
            <div className="space-y-6">
              {decisions.map((decision, index) => (
                <Surface
                  key={decision.id}
                  as="article"
                  level={2}
                  className="break-inside-avoid rounded-[var(--radius-lg)] p-6 sm:p-8 lg:p-10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Meta>Decision {String(index + 1).padStart(2, '0')}</Meta>
                    <div className="flex flex-wrap items-center gap-2">
                      {decision.revisitedAt ? (
                        <Pill>Revisited {decision.revisitedAt}</Pill>
                      ) : null}
                      <Pill active={decision.wouldRepeat === 'yes'}>
                        {REPEAT_LABEL[decision.wouldRepeat]}
                      </Pill>
                    </div>
                  </div>

                  {/* id lives on the heading so /thinking#<id> lands on the
                      question, and so the fragment target is the element a
                      screen reader announces after the jump. */}
                  <h3
                    id={decision.id}
                    className="text-h3 mt-5 max-w-3xl font-medium text-ink"
                  >
                    {decision.question}
                  </h3>

                  <dl className="mt-7">
                    <Field label="Context">
                      <Value className="max-w-prose">{decision.context}</Value>
                    </Field>

                    <Field label="Options considered" className="mt-7">
                      {/* Two columns from the sm breakpoint up: the pros and
                          cons only argue with each other if they are read
                          alongside each other. More than two options wrap into
                          the same grid rather than compressing further. */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {decision.options.map((option) => {
                          const chosen = option.name === decision.chose
                          return (
                            <Surface
                              key={option.name}
                              level={chosen ? 3 : 1}
                              className="p-5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="text-[0.9375rem] font-medium leading-snug text-ink">
                                  {option.name}
                                </h4>
                                {chosen ? <Pill active>Chosen</Pill> : null}
                              </div>
                              <Judgements label="For" items={option.pros} tone="pro" />
                              <Judgements label="Against" items={option.cons} tone="con" />
                            </Surface>
                          )
                        })}
                      </div>
                    </Field>

                  </dl>

                  {/* A sibling <dl> rather than a grid <div> nested inside the
                      previous one. `dl > div > div > dt` is invalid markup and
                      axe flags it; sibling definition lists are valid and read
                      correctly to a screen reader. The grid lives on the <dl>. */}
                  <dl className="mt-7 grid gap-7 sm:grid-cols-2">
                    <Field label="Chose">
                      <p className="text-[0.9375rem] font-medium leading-relaxed text-ink">
                        {decision.chose}
                      </p>
                    </Field>
                    <Field label="Because">
                      <Value>{decision.because}</Value>
                    </Field>
                  </dl>

                  <dl>

                    {/* The trade-off carries the credibility of the whole
                        section, so it is the only field that gets its own
                        surface treatment: accent rule, brighter ink, larger
                        measure. Static styling — nothing animates. */}
                    <Field
                      label="Trade-off"
                      className="mt-7 rounded-[var(--radius-sm)] border-l-2 border-accent bg-accent/[0.05] px-5 py-4"
                    >
                      <p
                        className={cx(
                          'text-body-lg max-w-prose',
                          isPlaceholder(decision.tradeoff) ? 'text-ink-3' : 'text-ink',
                        )}
                      >
                        {decision.tradeoff}
                      </p>
                    </Field>

                    <Field label="Outcome" className="mt-7">
                      <Value className="max-w-prose">{decision.outcome}</Value>
                    </Field>
                  </dl>

                  <RelatedProjects slugs={decision.projects} />
                </Surface>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* ---------- 02 Failure archive ---------- */}
      <Section id="failures" band aria-labelledby="failures-heading">
        <Container>
          <SectionHeading
            index="02 — Failure archive"
            id="failures-heading"
            title="Things I broke, and how I found out."
            lead="Written as incident reports: symptom, impact, root cause, the investigation trail including the steps that led nowhere, the fix, and the measurement that closed it."
          />

          {incidents.length === 0 ? (
            <EmptyState>No incidents have been written up yet.</EmptyState>
          ) : (
            <div className="space-y-6">
              {incidents.map((incident, index) => (
                <Surface
                  key={incident.id}
                  as="article"
                  level={2}
                  className="break-inside-avoid rounded-[var(--radius-lg)] p-6 sm:p-8 lg:p-10"
                >
                  <Meta>Incident {String(index + 1).padStart(2, '0')}</Meta>
                  <h3
                    id={incident.id}
                    className="text-h3 mt-5 max-w-3xl font-medium text-ink"
                  >
                    {incident.title}
                  </h3>

                  <dl className="mt-7 grid gap-7 sm:grid-cols-2">
                    <Field label="Symptom">
                      <Value>{incident.symptom}</Value>
                    </Field>
                    <Field label="Impact">
                      <Value>{incident.impact}</Value>
                    </Field>
                  </dl>

                  <dl className="mt-7">

                    <Field label="Root cause" className="mt-7">
                      <Value className="max-w-prose">{incident.cause}</Value>
                    </Field>

                    <Field label="Investigation" className="mt-7">
                      {/* An ordered list, because the order is the argument:
                          it shows how the cause was narrowed down, including
                          the steps that ruled things out. */}
                      <ol className="max-w-prose space-y-3">
                        {incident.investigation.map((step, stepIndex) => (
                          <li key={step} className="flex gap-4">
                            <span
                              aria-hidden="true"
                              className="mt-0.5 font-mono text-[0.75rem] text-ink-3"
                            >
                              {String(stepIndex + 1).padStart(2, '0')}
                            </span>
                            <span
                              className={cx(
                                'text-[0.9375rem] leading-relaxed',
                                isPlaceholder(step) ? 'text-ink-3' : 'text-ink-2',
                              )}
                            >
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </Field>

                    <Field label="Fix" className="mt-7">
                      <Value className="max-w-prose">{incident.fix}</Value>
                    </Field>

                    {/* Rendered only when a real, dated measurement exists.
                        No result block is the honest output for an incident
                        that was never measured. */}
                    {incident.result ? (
                      <Field label="Result" className="mt-7">
                        <IncidentResult result={incident.result} />
                      </Field>
                    ) : null}

                    <Field label="Lesson" className="mt-7">
                      <p
                        className={cx(
                          'text-body-lg max-w-prose',
                          isPlaceholder(incident.lesson) ? 'text-ink-3' : 'text-ink',
                        )}
                      >
                        {incident.lesson}
                      </p>
                    </Field>
                  </dl>

                  <RelatedProjects slugs={incident.projects} />
                </Surface>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* ---------- 03 Principles ---------- */}
      <Section id="principles" aria-labelledby="principles-heading">
        <Container>
          <SectionHeading
            index="03 — Principles"
            id="principles-heading"
            title="What holds across all of it."
            lead="Engineering principles, not motivational quotes. Each one has to point at something real — a principle with no evidence is a slogan."
          />

          {allPrinciples.length === 0 ? (
            <EmptyState>No principles have been written up yet.</EmptyState>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {allPrinciples.map((principle) => (
                <Surface
                  key={principle.id}
                  as="article"
                  level={1}
                  className="break-inside-avoid flex flex-col p-6 sm:p-8"
                >
                  <h3
                    id={principle.id}
                    className="text-[1.25rem] font-medium leading-snug text-ink"
                  >
                    {principle.statement}
                  </h3>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-2">
                    {principle.explanation}
                  </p>
                  <dl className="mt-auto pt-6">
                    <Field label="Evidence">
                      <Value>{principle.evidence}</Value>
                    </Field>
                  </dl>
                  <RelatedProjects slugs={principle.projects} />
                </Surface>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
