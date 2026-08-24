'use client'

import { useState } from 'react'
import { site } from '@/lib/site.config'
import {
  Container,
  Meta,
  Section,
  SectionHeading,
  Surface,
  cx,
} from '@/components/primitives'

/* ==========================================================================
   PROCESS  (spec §25)

   Answers spine question 4: "What is it like to work with you?"

   The spec asked for hover-to-reveal. Hover is not an interaction on touch,
   and it is not an interaction for keyboard users either, so this is built
   as a proper tablist: click or tap or arrow-key to select. Hover is added
   on top as an accelerator for mouse users, not as the mechanism.

   Each stage answers four questions, including "common mistakes" — which is
   the one that signals experience rather than process theatre.
   ========================================================================== */

export function Process() {
  const [active, setActive] = useState(0)
  const stages = site.process
  const current = stages[active]

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    let next: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (active + 1) % stages.length
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      next = (active - 1 + stages.length) % stages.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = stages.length - 1

    if (next !== null) {
      event.preventDefault()
      setActive(next)
      // Move focus with selection, per the tablist pattern.
      const tabs = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      tabs[next]?.focus()
    }
  }

  return (
    <Section id="chapter-process" aria-labelledby="process-heading">
      <Container>
        <SectionHeading
          index="04 — Process"
          id="process-heading"
          title="How a project actually runs."
          lead="Seven stages. What happens, what you get, and the mistake each stage is prone to."
        />

        <div
          role="tablist"
          aria-label="Project stages"
          onKeyDown={onKeyDown}
          className="flex flex-wrap gap-2"
        >
          {stages.map((stage, i) => {
            const selected = i === active
            return (
              <button
                key={stage.stage}
                role="tab"
                id={`process-tab-${i}`}
                aria-selected={selected}
                aria-controls={`process-panel-${i}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={cx(
                  'rounded-full border px-4 py-2 font-mono text-[0.75rem] uppercase tracking-[0.06em] transition-colors duration-[var(--duration-micro)]',
                  selected
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-hairline bg-white/[0.02] text-ink-3 hover:border-hairline-strong hover:text-ink-2',
                )}
              >
                {/* No opacity dimming here: the numeral inherits text-ink-3
                    (6.31:1), and 70% opacity drops it to ~4.4:1, which fails
                    AA. Opacity reduces contrast exactly like a lighter colour
                    does. */}
                <span className="mr-2">{String(i + 1).padStart(2, '0')}</span>
                {stage.stage}
              </button>
            )
          })}
        </div>

        {/* Progress rail. scaleX rather than width — transform is
            compositor-only, and this project's motion rule is
            transform-and-opacity. A width transition here would trigger
            layout on every stage change. */}
        <div className="mt-6 h-px w-full overflow-hidden bg-hairline" aria-hidden="true">
          <div
            className="h-px origin-left bg-accent transition-transform duration-[var(--duration-ui)] ease-[var(--ease-ui)]"
            style={{ transform: `scaleX(${(active + 1) / stages.length})` }}
          />
        </div>

        {current ? (
          <Surface
            level={2}
            id={`process-panel-${active}`}
            role="tabpanel"
            aria-labelledby={`process-tab-${active}`}
            tabIndex={0}
            className="mt-8 p-6 sm:p-8 lg:p-10"
          >
            <h3 className="text-h3 font-medium text-ink">{current.stage}</h3>
            <dl className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['What happens', current.what],
                ['What you get', current.deliverable],
                ['What you see', current.clientSees],
                ['Common mistake', current.mistake],
              ].map(([label, value]) => (
                <div key={label}>
                  <Meta as="dt" className="mb-2.5 block">
                    {label}
                  </Meta>
                  <dd className="text-[0.9375rem] leading-relaxed text-ink-2">{value}</dd>
                </div>
              ))}
            </dl>
          </Surface>
        ) : null}
      </Container>
    </Section>
  )
}
