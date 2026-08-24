'use client'

import { useEffect, useRef } from 'react'

/* ==========================================================================
   BEAM

   A hairline down the left edge that fills as you scroll, glowing in the
   current chapter's hue. Borrowed from GitHub's homepage motif and doing two
   jobs at once: it is a progress indicator, and it is the most visible carrier
   of the chapter colour — a continuous thread that changes temperature as you
   move through the argument.

   Implementation notes:

   - scaleY on a pre-sized element. Never `height`, which would trigger layout
     on every scroll event.
   - The fill is smoothed with a lerp toward the scroll position rather than
     tracking it exactly, so it feels weighted instead of twitchy. It reads as
     a physical instrument.
   - Desktop only (xl+) and hidden under reduced motion, because a constantly
     moving element in peripheral vision is exactly what that preference is
     asking us not to do.
   - The glow uses `box-shadow`, which is not animated — only the transform is.
     The colour transition is inherited from the registered chapter property.
   ========================================================================== */

export function Beam() {
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /* Bound to a const so the hoisted tick() below keeps the narrowed type —
       see the note in ParticleName.tsx for why this is necessary. */
    const fillEl = fillRef.current
    if (!fillEl) return
    const fill = fillEl

    let raf = 0
    let target = 0
    let value = 0

    function measure() {
      const max = document.documentElement.scrollHeight - window.innerHeight
      target = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0
    }

    function tick() {
      value += (target - value) * 0.12
      // Floor at a sliver so the beam never fully disappears at the top.
      fill.style.transform = `scaleY(${Math.max(value, 0.004).toFixed(4)})`
      raf = requestAnimationFrame(tick)
    }

    measure()
    value = target
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      data-print-hide
      className="pointer-events-none fixed bottom-0 left-6 top-14 z-[100] hidden w-px bg-hairline motion-safe:xl:block"
    >
      <div
        ref={fillRef}
        className="h-full w-px origin-top will-change-transform"
        style={{
          transform: 'scaleY(0.004)',
          background:
            'linear-gradient(to bottom, transparent, var(--chapter-dim) 30%, var(--chapter-accent))',
          boxShadow: '0 0 12px var(--chapter-accent)',
        }}
      />
    </div>
  )
}
