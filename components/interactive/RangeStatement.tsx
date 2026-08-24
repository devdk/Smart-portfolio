'use client'

import { useEffect, useState } from 'react'
import { RANGE_PAIRS } from '@/content/inventory'
import { cx } from '@/components/primitives'

/* ==========================================================================
   RANGE STATEMENT

   One sentence whose GRAMMAR carries the argument:

     I've built everything from ⟨humble thing⟩ to ⟨demanding thing⟩.

   Both halves swap together through five real pairs. The shape of the
   sentence says "I span a range" before the visitor has read either end, and
   each pair lands because both halves are true.

   ── WHY THIS INSTEAD OF AN EFFECT ─────────────────────────────────────────

   This replaced a particle-text hero. That was well built, but it was a
   recognisable effect spending the most valuable space on the site rendering
   a NAME — the least interesting available fact. This says what he does and
   how wide the range goes, in fewer pixels and a fraction of the JavaScript.
   The particle name moved to /about, where a name belongs.

   ── WHY EVERY PAIR IS STACKED IN ONE GRID CELL ────────────────────────────

   The pairs differ a lot in length: "197 endpoints in production" against
   "a CRM an accounting firm runs its practice on". Swapping the text inside
   one flowing block would make the heading two lines, then three, then two —
   the paragraph and the CTA below would jump on every cycle, and that is a
   cumulative layout shift on the most-viewed element on the site.

   So all five sentences occupy the SAME grid cell. The cell is naturally as
   tall as the longest of them, and only one is ever visible. Nothing reflows,
   ever, and no JavaScript measures anything — the browser does it.

   ── ACCESSIBILITY ─────────────────────────────────────────────────────────

   The cycling is decoration. The <h1> holds one complete, stable sentence
   (the strongest pair) for assistive tech, and every visual copy is
   aria-hidden, so a screen reader reads one clean claim rather than five
   overlapping ones or a stuttering live region.

   The range is not lost to a non-visual reader: the paragraph beneath the
   heading names both ends of it in real prose, and the evidence wall below is
   real content. Under reduced motion nothing cycles.
   ========================================================================== */

const HOLD_MS = 3600
const FADE_MS = 420

export function RangeStatement() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (RANGE_PAIRS.length < 2) return

    const cycle = setInterval(() => {
      setIndex((i) => (i + 1) % RANGE_PAIRS.length)
    }, HOLD_MS)
    return () => clearInterval(cycle)
  }, [])

  const first = RANGE_PAIRS[0]!

  return (
    <h1
      className="max-w-4xl font-medium"
      style={{
        // Deliberately smaller than --text-h1. The sentence runs to ~70
        // characters, so display sizing would push the evidence wall two
        // screens down and turn a brief into a billboard.
        fontSize: 'clamp(1.625rem, 0.9rem + 2.4vw, 3rem)',
        lineHeight: 1.14,
        letterSpacing: '-0.02em',
      }}
    >
      {/* The accessible sentence: one stable claim, never the cycling text. */}
      <span className="sr-only">
        I&rsquo;ve built everything from {first.from} to {first.to}.
      </span>

      {/* Every pair in one grid cell, so the block is as tall as the longest
          and never reflows. */}
      <span aria-hidden="true" className="grid">
        {RANGE_PAIRS.map((pair, i) => (
          <span
            key={pair.from}
            className={cx(
              'col-start-1 row-start-1 transition-opacity ease-[var(--ease-ui)]',
              i === index ? 'opacity-100' : 'opacity-0',
            )}
            style={{ transitionDuration: `${FADE_MS}ms` }}
          >
            <span className="text-ink-2">I&rsquo;ve built everything from </span>
            <span className="text-ink">{pair.from}</span>
            <span className="text-ink-2"> to </span>
            {/* accent-bright rather than accent: at this size the mid-tone
                accent reads dull against the canvas, and the bright variant
                exists for exactly this — large display type. */}
            <span className="text-accent-bright">{pair.to}</span>
            <span className="text-ink-2">.</span>
          </span>
        ))}
      </span>
    </h1>
  )
}
