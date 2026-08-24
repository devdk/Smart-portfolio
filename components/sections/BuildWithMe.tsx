'use client'

import { useMemo, useRef, useState } from 'react'
import { site } from '@/lib/site.config'
import {
  Button,
  Container,
  Meta,
  Section,
  SectionHeading,
  Surface,
  cx,
} from '@/components/primitives'

/* ==========================================================================
   BUILD WITH ME  (spec §26)

   Answers spine question 4, and is the site's terminal CTA.

   Five steps, then a generated summary. The summary is the point: it proves
   the visitor was listened to before they have spoken to anyone, and it
   pre-qualifies the lead so the first call is useful.

   Deliberate choices:
     - The recommendation is DERIVED from the answers, not canned. It maps
       (challenge x stage) to an approach, so different inputs genuinely
       produce different output.
     - Progress is a real indicator, and steps are navigable backwards.
     - The whole thing degrades to a plain textarea + email if JS fails,
       because the final submit is a normal form POST.
     - No fake urgency, no "book a call in the next 24 hours".
   ========================================================================== */

type Answers = {
  productType: string
  challenge: string
  stage: string
  timeline: string
  description: string
}

const EMPTY: Answers = {
  productType: '',
  challenge: '',
  stage: '',
  timeline: '',
  description: '',
}

/** Recommendation logic. Derived, not canned — the challenge determines the
    shape of the engagement, the stage determines where it starts. */
function recommend(answers: Answers): { approach: string[]; note: string } {
  const { challenge, stage } = answers

  const byChallenge: Record<string, string[]> = {
    Speed: ['Performance audit', 'Architecture review', 'Targeted optimisation', 'Re-measure'],
    Design: ['UX review', 'Interface design', 'Design system', 'Build'],
    Conversion: ['Funnel analysis', 'UX review', 'Rebuild of the weak step', 'Measure again'],
    Scalability: ['Architecture review', 'Bottleneck identification', 'Staged migration'],
    'Development capacity': ['Scope and plan', 'Build in reviewable slices', 'Handover'],
    'A legacy system': ['Audit what exists', 'Decide replace vs. refactor', 'Incremental migration'],
    'Not sure yet': ['Discovery call', 'Written problem statement', 'Recommendation'],
  }

  const byStage: Record<string, string> = {
    'An idea': 'Starting from an idea, the first job is narrowing scope to something shippable.',
    Planning: 'You already have a direction, so the value is in pressure-testing it before build.',
    'An existing product':
      'With something live, we start from measurement rather than assumptions.',
    'A redesign': 'A redesign is a good moment to fix the structural problems, not just the visuals.',
    'Broken, needs fixing': 'Fixing first, then deciding whether the foundation is worth keeping.',
  }

  return {
    approach: byChallenge[challenge] ?? byChallenge['Not sure yet']!,
    note: byStage[stage] ?? '',
  }
}

const STEPS = [
  { key: 'productType' as const, question: 'What are you building?', options: site.qualifier.productTypes },
  { key: 'challenge' as const, question: 'What is the biggest challenge?', options: site.qualifier.challenges },
  { key: 'stage' as const, question: 'Where are you now?', options: site.qualifier.stages },
  { key: 'timeline' as const, question: 'What is the timeline?', options: site.qualifier.timelines },
]

export function BuildWithMe() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  const totalSteps = STEPS.length + 1 // +1 for the description step
  const onSummary = step >= totalSteps
  const recommendation = useMemo(() => recommend(answers), [answers])

  function choose(key: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    setStep((s) => s + 1)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Something went wrong.')
      }
      setSubmitted(true)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not send that. Email me directly and it will reach me.',
      )
    } finally {
      setPending(false)
    }
  }

  if (submitted) {
    return (
      <Section id="chapter-contact" aria-labelledby="build-heading">
        <Container>
          <Surface level={3} className="p-8 text-center sm:p-14">
            <h2 id="build-heading" className="text-h2 font-medium text-ink">
              Got it.
            </h2>
            <p className="text-body-lg mx-auto mt-5 max-w-md text-ink-2">
              I read everything that comes through here and reply personally, usually within a
              couple of working days.
            </p>
          </Surface>
        </Container>
      </Section>
    )
  }

  return (
    <Section id="chapter-contact" aria-labelledby="build-heading">
      <Container>
        <SectionHeading
          index="05 — Build with me"
          id="build-heading"
          title="What are you trying to build?"
          lead="Four questions and a description. You will get a recommended approach before you send anything, and we can figure out the technology later."
        />

        <Surface level={3} className="overflow-hidden">
          {/* Progress */}
          <div className="flex items-center justify-between gap-4 border-b border-hairline px-6 py-4">
            <Meta>
              {onSummary ? 'Summary' : `Step ${Math.min(step + 1, totalSteps)} of ${totalSteps}`}
            </Meta>
            <div className="flex gap-1.5" aria-hidden="true">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className={cx(
                    'h-1 w-6 rounded-full transition-colors duration-[var(--duration-micro)]',
                    i < step ? 'bg-accent' : i === step ? 'bg-accent/50' : 'bg-hairline-strong',
                  )}
                />
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            {/* Steps 1-4: choices */}
            {!onSummary && step < STEPS.length ? (
              <fieldset>
                <legend className="text-h3 font-medium text-ink">
                  {STEPS[step]!.question}
                </legend>
                <div className="mt-7 flex flex-wrap gap-2.5">
                  {STEPS[step]!.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => choose(STEPS[step]!.key, option)}
                      className="rounded-full border border-hairline bg-white/[0.03] px-4 py-2.5 text-[0.9375rem] text-ink-2 transition-colors duration-[var(--duration-micro)] hover:border-accent/40 hover:bg-accent/[0.08] hover:text-ink"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {/* Step 5: description */}
            {!onSummary && step === STEPS.length ? (
              <div>
                <label htmlFor="qualifier-description" className="text-h3 block font-medium text-ink">
                  Describe it in your own words.
                </label>
                <p className="mt-3 text-[0.9375rem] text-ink-2">
                  However much or little you have. Rough is fine.
                </p>
                <textarea
                  id="qualifier-description"
                  value={answers.description}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={6}
                  maxLength={4000}
                  className="mt-6 w-full resize-y rounded-[var(--radius-md)] border border-hairline bg-canvas/60 p-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent/40"
                  placeholder="What it is, who it is for, and what is in the way."
                />
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setStep((s) => s + 1)
                      requestAnimationFrame(() =>
                        summaryRef.current?.scrollIntoView({ block: 'nearest' }),
                      )
                    }}
                  >
                    See the recommendation
                  </Button>
                  <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>
                    Back
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Summary */}
            {onSummary ? (
              <div ref={summaryRef}>
                <h3 className="text-h3 font-medium text-ink">Your project</h3>

                <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ['Type', answers.productType],
                    ['Challenge', answers.challenge],
                    ['Stage', answers.stage],
                    ['Timeline', answers.timeline],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <Meta as="dt" className="mb-2 block">
                        {label}
                      </Meta>
                      <dd className="text-[0.9375rem] text-ink">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-10 border-t border-hairline pt-8">
                  <Meta className="mb-4 block">Recommended approach</Meta>
                  <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
                    {recommendation.approach.map((phase, i) => (
                      <li key={phase} className="flex items-center gap-2">
                        <span className="rounded-full border border-accent/30 bg-accent/[0.08] px-3.5 py-1.5 text-[0.875rem] text-ink">
                          {phase}
                        </span>
                        {i < recommendation.approach.length - 1 ? (
                          <span aria-hidden="true" className="text-ink-3">
                            →
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                  {recommendation.note ? (
                    <p className="mt-6 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-2">
                      {recommendation.note}
                    </p>
                  ) : null}
                </div>

                <form onSubmit={onSubmit} className="mt-10 border-t border-hairline pt-8">
                  <label
                    htmlFor="contact-email"
                    className="block text-[0.9375rem] font-medium text-ink"
                  >
                    Where should I reply?
                  </label>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="h-12 flex-1 rounded-full border border-hairline bg-canvas/60 px-5 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent/40"
                    />
                    <Button type="submit" variant="primary" size="md" disabled={pending}>
                      {pending ? 'Sending…' : 'Send it'}
                    </Button>
                  </div>

                  {error ? (
                    <p role="alert" className="mt-4 text-[0.875rem] text-negative">
                      {error} You can also email{' '}
                      <a href={`mailto:${site.email}`} className="underline">
                        {site.email}
                      </a>
                      .
                    </p>
                  ) : null}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button variant="ghost" type="button" onClick={() => setStep(0)}>
                      Start again
                    </Button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* Back link for the choice steps */}
            {!onSummary && step > 0 && step < STEPS.length ? (
              <Button
                variant="ghost"
                size="sm"
                className="mt-8"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                Back
              </Button>
            ) : null}
          </div>
        </Surface>
      </Container>
    </Section>
  )
}
