'use client'

import { useEffect, useRef, useState } from 'react'

/* ==========================================================================
   CURSOR

   Constrained deliberately (spec §36, and the plan's ruling):
     - fine pointer only. Never on touch.
     - disabled under prefers-reduced-motion.
     - the native cursor is NEVER hidden, so it cannot become essential to
       navigation and cannot break for anyone.
     - transform + opacity only, driven by rAF.

   Note on implementation: an earlier version transitioned width/height to
   grow the dot into a ring. That violates this project's own motion rule
   (transform and opacity only), so the three states are instead three
   fixed-size stacked layers that scale. Same visual, compositor-only cost.

   Labels (VIEW / OPEN / DRAG) come from `data-cursor` on the hovered
   element, so any component can opt in without touching this file.
   ========================================================================== */

export function Cursor() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [label, setLabel] = useState<string | null>(null)
  const [active, setActive] = useState(false)
  /* The cursor must not appear until the pointer has actually moved.
     Rendering it immediately parks a stray dot in the middle of the viewport
     on every page load, which reads as a rendering artefact rather than a
     cursor. */
  const [seenPointer, setSeenPointer] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return
    setEnabled(true)

    let raf = 0
    let hasMoved = false
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let dotX = targetX
    let dotY = targetY
    let glowX = targetX
    let glowY = targetY

    function onMove(event: PointerEvent) {
      targetX = event.clientX
      targetY = event.clientY
      if (!hasMoved) {
        hasMoved = true
        // Jump straight to the pointer rather than lerping in from the
        // centre, so the first appearance is not a dot flying across.
        dotX = targetX
        dotY = targetY
        glowX = targetX
        glowY = targetY
        setSeenPointer(true)
      }

      const target = event.target as HTMLElement | null
      const labelled = target?.closest<HTMLElement>('[data-cursor]')
      const nextLabel = labelled?.dataset.cursor ?? null
      setLabel((prev) => (prev === nextLabel ? prev : nextLabel))

      const isInteractive = Boolean(
        labelled ??
          target?.closest('a, button, [role="button"], input, textarea, select'),
      )
      setActive((prev) => (prev === isInteractive ? prev : isInteractive))
    }

    function tick() {
      // Two lerp rates: the dot tracks tightly, the glow lags. Reads as
      // depth without needing a second animation system.
      dotX += (targetX - dotX) * 0.35
      dotY += (targetY - dotY) * 0.35
      glowX += (targetX - glowX) * 0.08
      glowY += (targetY - glowY) * 0.08

      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  if (!enabled) return null

  const transition =
    'transition-[transform,opacity] duration-[var(--duration-ui)] ease-[var(--ease-ui)]'

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[500] transition-opacity duration-[var(--duration-ui)]"
      style={{ opacity: seenPointer ? 1 : 0 }}
    >
      {/* Ambient glow — the single interactive background layer.
          A fixed-size radial, translated. Not a particle system. */}
      <div ref={glowRef} className="absolute left-0 top-0 will-change-transform">
        <div
          className="size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgb(0 226 228 / 0.055), transparent 62%)',
          }}
        />
      </div>

      {/* Cursor states — three fixed-size layers, scaled. */}
      <div ref={wrapRef} className="absolute left-0 top-0 will-change-transform">
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          {/* dot */}
          <div
            className={`absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ${transition}`}
            style={{
              transform: `translate(-50%, -50%) scale(${label || active ? 0 : 1})`,
              opacity: label || active ? 0 : 0.9,
            }}
          />
          {/* ring on interactive elements */}
          <div
            className={`absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/50 bg-accent/[0.14] ${transition}`}
            style={{
              transform: `translate(-50%, -50%) scale(${active && !label ? 1 : 0.4})`,
              opacity: active && !label ? 1 : 0,
            }}
          />
          {/* label chip */}
          <div
            className={`absolute left-1/2 top-1/2 flex size-17 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/50 bg-canvas/75 ${transition}`}
            style={{
              transform: `translate(-50%, -50%) scale(${label ? 1 : 0.4})`,
              opacity: label ? 1 : 0,
            }}
          >
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.08em] text-accent">
              {label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
