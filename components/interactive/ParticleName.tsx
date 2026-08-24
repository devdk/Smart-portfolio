'use client'

import { useEffect, useRef, useState } from 'react'

/* ==========================================================================
   PARTICLE NAME — the hero object

   The name is not text with an animation behind it. The name IS the particle
   system: ~9,000 points rain in from off-canvas, settle into the letterforms
   of "DHEERAJ", drift while you read, scatter away from the cursor, and
   dissolve as you scroll past.

   ── WHY CANVAS 2D AND NOT THREE.JS ────────────────────────────────────────

   The earlier scaffold did this with react-three-fiber and a custom GLSL
   shader. That is the more obvious tool, and it is roughly 150 KB gzipped
   before a line of application code — which is more than this entire site's
   JavaScript budget. This project already removed GSAP (43.5 KB) for the same
   reason, so importing a 3D engine to draw flat dots would have been
   inconsistent.

   Canvas 2D with typed arrays does the same job in about 4 KB:
     - positions, velocities and targets live in flat Float32Arrays, so the
       hot loop does no allocation and no property lookups
     - one `fillRect` per particle beats `arc()` by a wide margin at this
       count, and at 2px nobody can tell a square dot from a round one
     - the whole thing is a single canvas, so it composites as one layer

   ── WHY THE LETTERFORMS ARE SAMPLED, NOT HARDCODED ────────────────────────

   Target positions are read from the actual rendered glyphs: the name is
   drawn once to an offscreen canvas in the real Geist font at the real
   size, then getImageData is scanned for opaque pixels. So the particles form
   the same letterforms as the rest of the site's typography, at any viewport
   width, and it stays correct if the typeface ever changes. Hardcoded shape
   coordinates would drift out of sync with the design system immediately.

   ── ACCESSIBILITY AND FALLBACK ────────────────────────────────────────────

   A real <h1> is always in the DOM. The canvas is aria-hidden decoration
   layered over it. Under reduced motion, on touch, on small viewports, or if
   the canvas cannot initialise, the h1 simply shows and no canvas mounts —
   the heading is never hidden behind an effect it depends on.

   The particle colour is read from the live chapter accent, so the hero
   swarm re-tints with the rest of the interface.
   ========================================================================== */

type Props = {
  /** The word to form. Uppercased for sampling. */
  text: string
  className?: string
}

const CONFIG = {
  /** Sample every Nth pixel of the glyph bitmap. Lower = denser.
      At 2 the letterforms read as solid type rather than a faint cloud, which
      matters because this IS the h1 — it has to look like typography. */
  sampleGap: 2,
  /** Cap so a very wide viewport cannot spike the count. */
  maxParticles: 16000,
  /** Spring constant pulling a particle toward its letterform slot. */
  stiffness: 0.055,
  /** Velocity retained per frame. Under 1 so motion settles. */
  damping: 0.86,
  /** Radius within which the pointer pushes particles away. */
  pointerRadius: 110,
  pointerForce: 2.4,
  /** Idle drift amplitude, in pixels. */
  driftAmount: 0.55,
} as const

export function ParticleName({ text, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(pointer: fine)')
    const wide = window.matchMedia('(min-width: 768px)')

    // Anything less than a wide, fine-pointer, motion-allowing viewport gets
    // the plain heading. This is a flourish, never a requirement.
    if (reduced.matches || !fine.matches || !wide.matches) return

    /* Narrowed once, then bound to consts that the nested function
       declarations below can close over. `if (!canvasRef.current) return`
       does NOT narrow inside a hoisted `function` — TypeScript cannot prove
       the ref has not changed by the time that function runs, so the type
       re-widens to `| null` in every one of them. Binding here fixes all of
       it once instead of a non-null assertion per use site. */
    const canvasEl = canvasRef.current
    const wrapEl = wrapRef.current
    if (!canvasEl || !wrapEl) return

    const context = canvasEl.getContext('2d', { alpha: true })
    if (!context) return

    const canvas = canvasEl
    const wrap = wrapEl
    const ctx = context

    setActive(true)

    let raf = 0
    let disposed = false

    // Particle state. Flat typed arrays: no per-frame allocation.
    let count = 0
    let px = new Float32Array(0) // current position
    let py = new Float32Array(0)
    let vx = new Float32Array(0) // velocity
    let vy = new Float32Array(0)
    let tx = new Float32Array(0) // letterform target
    let ty = new Float32Array(0)
    let seed = new Float32Array(0) // per-particle phase, for drift and delay

    let dpr = 1
    let cssWidth = 0
    let cssHeight = 0
    let accent = '#00e2e4'
    let dissolve = 0
    let intro = 0

    const pointer = { x: -9999, y: -9999, inside: false }

    /** Read the live chapter hue so the swarm matches the interface. */
    function readAccent() {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--chapter-bright')
        .trim()
      if (value) accent = value
    }

    /**
     * Rebuild targets by rasterising the real font and scanning for ink.
     * Runs on mount and on resize.
     */
    function build() {
      const rect = wrap.getBoundingClientRect()
      cssWidth = Math.max(1, Math.floor(rect.width))
      cssHeight = Math.max(1, Math.floor(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.floor(cssWidth * dpr)
      canvas.height = Math.floor(cssHeight * dpr)
      canvas.style.width = `${cssWidth}px`
      canvas.style.height = `${cssHeight}px`

      // --- rasterise the word to an offscreen canvas -----------------------
      const off = document.createElement('canvas')
      off.width = cssWidth
      off.height = cssHeight
      const offCtx = off.getContext('2d', { willReadFrequently: true })
      if (!offCtx) return

      /* Match the site's display type: the same family and weight the h1
         uses, sized to fill the stage. Measured, then corrected, so the word
         fits the box at any viewport width. */
      const family =
        getComputedStyle(document.body).getPropertyValue('font-family') || 'sans-serif'
      let fontSize = Math.floor(cssHeight * 0.82)
      offCtx.font = `600 ${fontSize}px ${family}`
      const measured = offCtx.measureText(text)
      const targetWidth = cssWidth * 0.98
      if (measured.width > 0) {
        fontSize = Math.floor(fontSize * Math.min(1, targetWidth / measured.width))
        offCtx.font = `600 ${fontSize}px ${family}`
      }

      offCtx.fillStyle = '#fff'
      /* Left-aligned, not centred. Everything else on the page hangs off the
         same left edge, and a centred name would be the one element ignoring
         the editorial grid. */
      offCtx.textAlign = 'left'
      offCtx.textBaseline = 'middle'
      offCtx.letterSpacing = '-0.035em'
      offCtx.fillText(text, 0, cssHeight / 2)

      // --- scan for opaque pixels -----------------------------------------
      const { data } = offCtx.getImageData(0, 0, cssWidth, cssHeight)
      const xs: number[] = []
      const ys: number[] = []
      const gap = CONFIG.sampleGap

      for (let y = 0; y < cssHeight; y += gap) {
        for (let x = 0; x < cssWidth; x += gap) {
          // alpha channel of pixel (x, y)
          if (data[(y * cssWidth + x) * 4 + 3]! > 128) {
            xs.push(x)
            ys.push(y)
          }
        }
      }

      count = Math.min(xs.length, CONFIG.maxParticles)
      if (count === 0) return

      px = new Float32Array(count)
      py = new Float32Array(count)
      vx = new Float32Array(count)
      vy = new Float32Array(count)
      tx = new Float32Array(count)
      ty = new Float32Array(count)
      seed = new Float32Array(count)

      for (let i = 0; i < count; i++) {
        // Even sampling across the glyph pixels when we had to cap.
        const source = Math.floor((i / count) * xs.length)
        tx[i] = xs[source]!
        ty[i] = ys[source]!

        /* Start off-canvas on a ring, so the swarm arrives from outside the
           frame rather than expanding out of the middle. Deterministic from
           the index — no Math.random, so the entrance is identical every
           load and cannot look different between two visitors' screenshots. */
        const angle = (i * 2.399963) % (Math.PI * 2) // golden angle
        const radius = Math.max(cssWidth, cssHeight) * (0.75 + ((i % 41) / 41) * 0.6)
        px[i] = cssWidth * 0.35 + Math.cos(angle) * radius
        py[i] = cssHeight / 2 + Math.sin(angle) * radius * 0.55
        vx[i] = 0
        vy[i] = 0
        seed[i] = ((Math.sin(i * 127.1) * 43758.5453) % 1 + 1) % 1
      }
    }

    function frame(now: number) {
      if (disposed) return
      raf = requestAnimationFrame(frame)
      if (count === 0) return

      readAccent()

      // Intro eases 0 → 1 over roughly the first second.
      intro = Math.min(intro + 0.016, 1)

      /* Dissolve tracks scroll past the hero. Read once per frame, and only
         a cheap property — no getBoundingClientRect in the hot loop. */
      dissolve = Math.min(Math.max(window.scrollY / (window.innerHeight * 0.65), 0), 1)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (dissolve >= 1) return

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.fillStyle = accent
      ctx.globalAlpha = 1

      const t = now / 1000
      const size = 1.7

      for (let i = 0; i < count; i++) {
        const s = seed[i]!

        // Per-particle stagger, so the swarm arrives as a wave.
        const local = Math.min(Math.max((intro - s * 0.35) / 0.65, 0), 1)
        const eased = local * local * (3 - 2 * local)

        // Spring toward the letterform slot.
        const targetX = tx[i]!
        const targetY = ty[i]!
        let ax = (targetX - px[i]!) * CONFIG.stiffness * eased
        let ay = (targetY - py[i]!) * CONFIG.stiffness * eased

        // Idle drift once settled — keeps the word alive without moving it.
        ax += Math.sin(t * 0.9 + s * 40) * CONFIG.driftAmount * 0.05
        ay += Math.cos(t * 0.75 + s * 30) * CONFIG.driftAmount * 0.05

        // Pointer repulsion. Squared-distance check avoids a sqrt per particle
        // for the ~99% that are out of range.
        if (pointer.inside) {
          const dx = px[i]! - pointer.x
          const dy = py[i]! - pointer.y
          const d2 = dx * dx + dy * dy
          const r2 = CONFIG.pointerRadius * CONFIG.pointerRadius
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2)
            const push = (1 - d / CONFIG.pointerRadius) * CONFIG.pointerForce
            ax += (dx / d) * push
            ay += (dy / d) * push
          }
        }

        vx[i] = (vx[i]! + ax) * CONFIG.damping
        vy[i] = (vy[i]! + ay) * CONFIG.damping
        px[i] = px[i]! + vx[i]!
        py[i] = py[i]! + vy[i]!

        // Scatter outward as the hero leaves. Cheap directional spread.
        let drawX = px[i]!
        let drawY = py[i]!
        if (dissolve > 0) {
          const spread = dissolve * dissolve * 260
          drawX += Math.cos(s * 6.28) * spread
          drawY += Math.sin(s * 5.11) * spread + dissolve * 40
        }

        ctx.globalAlpha = (0.55 + s * 0.45) * (1 - dissolve)
        ctx.fillRect(drawX, drawY, size, size)
      }

      ctx.restore()
    }

    function onPointerMove(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.inside =
        pointer.x > -CONFIG.pointerRadius &&
        pointer.x < rect.width + CONFIG.pointerRadius &&
        pointer.y > -CONFIG.pointerRadius &&
        pointer.y < rect.height + CONFIG.pointerRadius
    }

    function onPointerLeave() {
      pointer.inside = false
    }

    let resizeTimer: number | undefined
    function onResize() {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        intro = 0
        build()
      }, 150)
    }

    /* Wait for fonts before sampling, or the glyphs get rasterised in the
       fallback face and the letterforms are subtly wrong. */
    const start = () => {
      build()
      raf = requestAnimationFrame(frame)
    }

    if (document.fonts?.status === 'loaded') start()
    else document.fonts?.ready.then(start).catch(start)

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [text])

  return (
    <div
      ref={wrapRef}
      className={`relative h-[clamp(5rem,14vw,13rem)] w-full ${className ?? ''}`}
    >
      {/* The real heading. Always present, always the accessible name.
          Hidden visually only once the canvas has actually initialised. */}
      <h1
        className="text-display absolute inset-0 flex items-center font-semibold text-ink transition-opacity duration-500"
        style={{ opacity: active ? 0 : 1 }}
        aria-hidden={false}
      >
        {text}
      </h1>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />
    </div>
  )
}
