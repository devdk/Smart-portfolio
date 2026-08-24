'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import { Button, Meta, cx } from '@/components/primitives'
import { Caption } from '@/components/lab/Caption'

/* ==========================================================================
   INSTRUMENT 02 — SAMPLING

   Two sliders, ten candidate continuations, and the actual arithmetic a model
   does between its final layer and the word it emits: divide the logits by the
   temperature, softmax, sort, keep the smallest set of tokens whose cumulative
   probability reaches top-p, renormalise, draw.

   ── WHAT IS REAL AND WHAT IS FIXED ─────────────────────────────────────────
   The logits are fixed — they are a plausible hand-set distribution for the
   prompt, not the output of a forward pass, and the caption says "fixed
   logits" for that reason. Everything downstream of them is the real
   computation, including the numerical-stability trick (subtract the maximum
   before exponentiating) that every production implementation needs and every
   toy demo omits until it overflows at temperature 0.1.

   The candidates are Dheeraj's actual domains rather than the usual
   "cat / dog / mat", plus two deliberate absurdities. The absurdities are the
   useful part: raising the temperature is abstract until you watch "lasagne"
   climb out of the noise floor and into the nucleus.

   ── WHY NO ANIMATION LIBRARY ───────────────────────────────────────────────
   The reference version of this used motion's `layout` prop and animated bar
   `width`. Neither is available or wanted here: there is no motion library in
   this project's dependencies, and animating width means a layout pass per
   frame per bar. Both effects are CSS transitions on transforms instead —
   rows are positioned by `translateY(var(--row))` so a re-sort is a
   compositor-only move, and each bar's magnitude is `scaleX()` on a
   full-width track so its length changes without touching layout. This is the
   codebase's motion rule (transform and opacity only), and here it is also
   simply the faster way to do it.
   ========================================================================== */

const PROMPT = 'Dheeraj builds'

/** Row pitch. One constant so the container height and the per-row transform
    can never disagree, which is the classic bug in transform-positioned lists. */
const ROW = 2.125 // rem

/**
 * Fixed logits. Ordered here by plausibility for readability; the component
 * sorts by probability at render time, which is what makes the re-sort
 * visible when the temperature flattens the distribution.
 */
const CANDIDATES: { token: string; logit: number }[] = [
  { token: 'CRMs', logit: 3.4 },
  { token: 'dashboards', logit: 3.05 },
  { token: 'lead engines', logit: 2.7 },
  { token: 'video pipelines', logit: 2.35 },
  { token: 'WordPress sites', logit: 2.1 },
  { token: 'scrapers', logit: 1.55 },
  { token: 'RAG pipelines', logit: 1.2 },
  { token: 'ad analysers', logit: 0.75 },
  { token: 'submarines', logit: -2.4 },
  { token: 'lasagne', logit: -3.9 },
]

type Row = {
  token: string
  logit: number
  p: number
  /** Probability after the nucleus is renormalised. 0 for excluded tokens. */
  pNucleus: number
  inNucleus: boolean
  cumulative: number
}

function distribution(temperature: number, topP: number): Row[] {
  /* Subtract the maximum scaled logit before exponentiating. Mathematically a
     no-op (it cancels in the ratio), numerically essential: at temperature 0.1
     the largest term here is e^34, and a colder slider or a larger logit
     overflows to Infinity and returns NaN for every probability. */
  const scaled = CANDIDATES.map((candidate) => candidate.logit / temperature)
  const max = Math.max(...scaled)
  const exponentiated = scaled.map((value) => Math.exp(value - max))
  const total = exponentiated.reduce((sum, value) => sum + value, 0)

  const sorted = CANDIDATES.map((candidate, index) => ({
    token: candidate.token,
    logit: candidate.logit,
    p: (exponentiated[index] ?? 0) / total,
  })).sort((a, b) => b.p - a.p)

  /* Nucleus (top-p) sampling keeps the SMALLEST set whose cumulative
     probability reaches p — which means the token that crosses the threshold
     is included, not excluded. Testing the cumulative total BEFORE adding the
     current token is what implements that, and getting it backwards is the
     usual off-by-one: at top-p = 0.9 with a single 0.95 token you would keep
     nothing and sample from an empty set. */
  let cumulative = 0
  const rows: Row[] = sorted.map((row, index) => {
    const inNucleus = index === 0 || cumulative < topP
    cumulative += row.p
    return { ...row, inNucleus, cumulative, pNucleus: 0 }
  })

  const mass = rows.reduce((sum, row) => sum + (row.inNucleus ? row.p : 0), 0)
  for (const row of rows) row.pNucleus = row.inNucleus && mass > 0 ? row.p / mass : 0
  return rows
}

/** Shannon entropy of the truncated, renormalised distribution, in bits. The
    number the temperature slider is really moving. */
function entropyBits(rows: Row[]): number {
  let sum = 0
  for (const row of rows) {
    if (row.pNucleus > 0) sum -= row.pNucleus * Math.log2(row.pNucleus)
  }
  return sum
}

/**
 * Row position. The offset goes into a custom property and the transform
 * reads it, rather than writing `translateY(4.25rem)` directly, because the
 * indirection is what makes the row's position one declarative value: React
 * only ever changes `--row`, and the transition on `transform` does the rest.
 *
 * The cast is unavoidable — React's CSSProperties has no index signature for
 * `--*` names.
 */
function rowStyle(index: number): CSSProperties {
  return {
    '--row': `${index * ROW}rem`,
    transform: 'translateY(var(--row))',
  } as CSSProperties
}

export function Sampling() {
  const [temperature, setTemperature] = useState(0.8)
  const [topP, setTopP] = useState(0.9)
  const [output, setOutput] = useState<string[]>([])

  const rows = useMemo(() => distribution(temperature, topP), [temperature, topP])
  const nucleusSize = rows.filter((row) => row.inNucleus).length
  const nucleusMass = rows.reduce((sum, row) => sum + (row.inNucleus ? row.p : 0), 0)
  const bits = entropyBits(rows)

  function sample() {
    // Draw from the renormalised nucleus, which is what the model actually
    // samples from — not from the full distribution with the tail hidden.
    let r = Math.random()
    for (const row of rows) {
      if (!row.inNucleus) continue
      r -= row.pNucleus
      if (r <= 0) {
        setOutput((previous) => [...previous.slice(-7), row.token])
        return
      }
    }
    // Floating-point remainder: fall back to the most likely token rather
    // than emitting nothing.
    const first = rows[0]
    if (first) setOutput((previous) => [...previous.slice(-7), first.token])
  }

  return (
    <div>
      <Caption>
        demonstrates: temperature and top-p — how a model chooses its next word. Real softmax
        over fixed logits.
      </Caption>

      <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
        <div>
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <label className="min-w-56 flex-1">
              <span className="flex items-baseline justify-between font-mono text-meta text-ink-2">
                <span>temperature</span>
                <span className="text-accent">{temperature.toFixed(2)}</span>
              </span>
              <input
                type="range"
                min={0.1}
                max={2}
                step={0.05}
                value={temperature}
                onChange={(event) => setTemperature(Number(event.target.value))}
                className="mt-2 w-full accent-accent"
              />
            </label>

            <label className="min-w-56 flex-1">
              <span className="flex items-baseline justify-between font-mono text-meta text-ink-2">
                <span>top-p</span>
                <span className="text-accent">{topP.toFixed(2)}</span>
              </span>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={topP}
                onChange={(event) => setTopP(Number(event.target.value))}
                className="mt-2 w-full accent-accent"
              />
            </label>
          </div>

          {/* Transform-positioned rows. The container's height is derived from
              the same ROW constant the transforms use, so nothing can drift.
              Keys are the token strings, so React moves the existing DOM node
              instead of rewriting its text — which is the only reason the
              re-sort reads as movement rather than as a flicker. */}
          <div
            className="relative mt-7"
            style={{ height: `${rows.length * ROW}rem` }}
          >
            {rows.map((row, index) => {
              return (
                <div
                  key={row.token}
                  style={rowStyle(index)}
                  className="absolute inset-x-0 top-0 flex h-[2.125rem] items-center gap-3 transition-transform duration-[var(--duration-ui)] ease-[var(--ease-ui)]"
                >
                  <span
                    className={cx(
                      'w-[7.5rem] shrink-0 text-right font-mono text-[0.75rem]',
                      row.inNucleus ? 'text-ink' : 'text-ink-3 line-through',
                    )}
                  >
                    {row.token}
                  </span>

                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <span
                      className={cx(
                        'block h-full origin-left rounded-full transition-transform duration-[var(--duration-ui)] ease-[var(--ease-ui)]',
                        row.inNucleus ? 'bg-accent' : 'bg-accent/25',
                      )}
                      /* scaleX, never width. A width transition on ten bars is
                         ten layout invalidations per frame; scaleX is a
                         compositor property. The 0.004 floor keeps a
                         near-zero probability visible as a sliver rather than
                         vanishing, so the tail is legible. */
                      style={{ transform: `scaleX(${Math.max(row.p, 0.004)})` }}
                    />
                  </span>

                  <span
                    className={cx(
                      'w-14 shrink-0 text-right font-mono text-[0.75rem] tabular-nums',
                      row.inNucleus ? 'text-ink-2' : 'text-ink-3',
                    )}
                  >
                    {(row.p * 100).toFixed(1)}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:border-l lg:border-hairline lg:pl-6">
          <Meta as="p" className="mb-3 block">
            the nucleus
          </Meta>
          <dl className="space-y-2 font-mono text-[0.75rem]">
            {[
              ['tokens kept', `${nucleusSize} of ${rows.length}`],
              ['mass kept', `${(nucleusMass * 100).toFixed(1)}%`],
              ['entropy', `${bits.toFixed(2)} bits`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-3">{label}</dt>
                <dd className="tabular-nums text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-3">
            Entropy is the number the temperature slider is really moving: at 0.1 the
            distribution collapses onto one token and the model becomes a lookup table; at 2.0
            it flattens until lasagne is a plausible thing to build.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" onClick={sample}>
              Sample a token
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOutput([])}
              disabled={output.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* The running output. role=status so each sampled token is announced —
          a button that visibly appends text and silently appends nothing is a
          worse interaction for a screen-reader user than no button. */}
      <p
        role="status"
        className="mt-6 rounded-[var(--radius-sm)] border border-hairline bg-white/[0.02] px-4 py-3 font-mono text-[0.8125rem] leading-relaxed text-ink-2"
      >
        <span className="text-ink-3">&gt; </span>
        {PROMPT}{' '}
        <span className="text-accent">{output.join(' ')}</span>
        {output.length === 0 ? (
          <span className="text-ink-3">— nothing sampled yet</span>
        ) : null}
      </p>
    </div>
  )
}
