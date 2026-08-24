'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  LAB_POINTS,
  LAB_SOURCES,
  PCA_EXPLAINED_VARIANCE,
  PCA_EXPLAINED_VARIANCE_1,
  PCA_EXPLAINED_VARIANCE_2,
  PCA_DIMENSIONS,
  type LabPoint,
} from '@/content/lab-data'
import { Meta, cx } from '@/components/primitives'
import { Caption } from '@/components/lab/Caption'
import { subscribeToChapter } from '@/components/layout/ChapterNarrative'

/* ==========================================================================
   INSTRUMENT 01 — EMBEDDING MAP

   Every dot is a real chunk of this site's own corpus — the CV, the FAQ, the
   three intros, the seven project write-ups — embedded with
   bge-small-en-v1.5 into 384 dimensions and projected to two by PCA at build
   time (scripts/build-lab-data.ts has the derivation and the honest
   explained-variance figure).

   ── WHY CANVAS AND NOT SVG ─────────────────────────────────────────────────
   Twenty-three circles is well within SVG's comfort zone, so this is not a
   performance argument. It is a layer argument: the map draws points, the
   connecting lines to a query's nearest matches, and a faint axis cross, and
   in SVG each of those is a DOM node that React reconciles on every hover.
   In canvas the whole picture is one composited layer redrawn by one function,
   which also makes the geometry a single source of truth — the same transform
   that positions a dot positions the tooltip and resolves a mouse hit.

   ── WHY THE CANVAS IS NOT THE INTERFACE ────────────────────────────────────
   A canvas is a picture; it has no accessibility tree. So it is aria-hidden,
   and underneath it every point also exists as a real focusable button whose
   accessible name is the same source and label the tooltip shows. Tab through
   the list and you get the map's information without ever seeing the map.
   That is the requirement, not a courtesy: the visual is the enhancement.

   ── THE HONEST HALF ────────────────────────────────────────────────────────
   The map is real embeddings. The query is NOT embedded. Running bge-small in
   the browser to place one dot means shipping a ~30 MB model, and this site
   has a performance argument to keep. So a typed query is scored against the
   23 chunks by IDF-weighted term overlap — plain lexical retrieval — and
   placed at the weighted centroid of its three best matches. The UI says
   exactly that, in those words. Claiming "your text was embedded" would be a
   two-word lie in the middle of an instrument whose entire purpose is showing
   what really happens.
   ========================================================================== */

/* --- Geometry ------------------------------------------------------------- */

/** Padding inside the canvas, in CSS pixels, so no dot is clipped. */
const PAD = 26
/** Radius of a corpus dot, and of the hit-test around it. */
const DOT = 5
const HIT_RADIUS = 20

type Transform = { ox: number; oy: number; scale: number }

/**
 * Maps data coordinates to canvas pixels with ONE scale factor for both axes.
 *
 * The build script already normalised x and y against a shared divisor so the
 * plot's proportions are truthful; stretching each axis to fill the box here
 * would undo that and make the second component (10.8% of the variance) look
 * as strong as the first (14.3%). Instead the data's real extent is fitted
 * into the box at a uniform scale and centred, so the box may have margins —
 * margins are the honest cost of not lying about the aspect ratio.
 */
function fit(width: number, height: number): Transform {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const point of LAB_POINTS) {
    minX = Math.min(minX, point.x)
    maxX = Math.max(maxX, point.x)
    minY = Math.min(minY, point.y)
    maxY = Math.max(maxY, point.y)
  }
  const spanX = Math.max(maxX - minX, 0.001)
  const spanY = Math.max(maxY - minY, 0.001)
  const usableW = Math.max(width - PAD * 2, 10)
  const usableH = Math.max(height - PAD * 2, 10)
  const scale = Math.min(usableW / spanX, usableH / spanY)

  return {
    ox: (width - (minX + maxX) * scale) / 2,
    oy: (height + (minY + maxY) * scale) / 2, // y flipped: screen grows down
    scale,
  }
}

function toScreen(transform: Transform, x: number, y: number): [number, number] {
  return [transform.ox + x * transform.scale, transform.oy - y * transform.scale]
}

/* --- Colour -------------------------------------------------------------
   Canvas cannot use a Tailwind class, so these read the live design tokens
   with getComputedStyle. That is the sanctioned exception to the no-hex rule
   and it is load-bearing: --chapter-bright is a registered @property that the
   chapter system interpolates, so reading it here means the map re-tints with
   the rest of the interface for free.

   Per-source hues are DERIVED from the chapter accent rather than picked: the
   accent is parsed to HSL and rotated by a per-source offset within a narrow
   arc. Ten hand-picked hex values would be ten hardcoded colours that stop
   agreeing with the page the moment the chapter changes; a rotation stays in
   the chapter's family whatever the chapter is. Sources are additionally
   distinguished by MARK SHAPE, because hue alone is not a distinction anyone
   with a colour-vision deficiency can rely on — and the DOM list carries the
   whole thing as text regardless.                                          */

type Hsl = { h: number; s: number; l: number }

function parseColour(value: string): Hsl {
  const text = value.trim()
  let r = 0
  let g = 0
  let b = 0

  /* No token value at all — custom properties unsupported, or the stylesheet
     failed to load. Degrade to a neutral light grey so the marks stay visible
     instead of drawing black-on-black. Deliberately expressed as HSL numbers
     rather than a hex literal: this is a "tokens unavailable" fallback, not a
     second opinion about what colour the map should be. */
  if (text.length === 0) return { h: 0, s: 0, l: 0.72 }

  if (text.startsWith('#')) {
    const hex = text.slice(1)
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex
    r = parseInt(full.slice(0, 2), 16) / 255
    g = parseInt(full.slice(2, 4), 16) / 255
    b = parseInt(full.slice(4, 6), 16) / 255
  } else {
    // rgb(90 240 242) or rgb(90, 240, 242) — the form getComputedStyle
    // returns for a registered <color> property in every current engine.
    const numbers = text.match(/[\d.]+/g) ?? []
    r = Number(numbers[0] ?? 0) / 255
    g = Number(numbers[1] ?? 0) / 255
    b = Number(numbers[2] ?? 0) / 255
  }

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const delta = max - min
  if (delta === 0) return { h: 0, s: 0, l }

  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / delta + 2) / 6
  else h = ((r - g) / delta + 4) / 6
  return { h: h * 360, s, l }
}

function hsl({ h, s, l }: Hsl, alpha = 1): string {
  const hue = ((h % 360) + 360) % 360
  const sat = Math.round(Math.min(Math.max(s, 0), 1) * 100)
  const light = Math.round(Math.min(Math.max(l, 0), 1) * 100)
  return alpha >= 1
    ? `hsl(${hue.toFixed(1)} ${sat}% ${light}%)`
    : `hsl(${hue.toFixed(1)} ${sat}% ${light}% / ${alpha})`
}

/**
 * Hue offset for a source, within a ±72° arc of the chapter accent.
 *
 * The offsets fan OUTWARD from zero rather than sweeping left to right, so
 * the first source — `cv`, which is a third of the corpus — sits on the accent
 * hue exactly and the rest spread either side of it. Sweeping instead would
 * put the largest group at one end of the arc and make the whole map read as
 * whatever colour that end happened to be, which is how a violet chapter ends
 * up looking green.
 */
function hueOffset(index: number, total: number): number {
  if (total <= 1 || index === 0) return 0
  const steps = Math.ceil((total - 1) / 2)
  const step = 72 / steps
  return (index % 2 === 1 ? 1 : -1) * Math.ceil(index / 2) * step
}

type MarkShape = 'circle' | 'square' | 'triangle' | 'diamond'

function shapeFor(source: string): MarkShape {
  if (source === 'cv') return 'circle'
  if (source === 'faq') return 'square'
  if (source === 'intros') return 'triangle'
  return 'diamond'
}

function drawMark(
  ctx: CanvasRenderingContext2D,
  shape: MarkShape,
  x: number,
  y: number,
  r: number,
): void {
  ctx.beginPath()
  if (shape === 'circle') {
    ctx.arc(x, y, r, 0, Math.PI * 2)
  } else if (shape === 'square') {
    ctx.rect(x - r * 0.88, y - r * 0.88, r * 1.76, r * 1.76)
  } else if (shape === 'triangle') {
    ctx.moveTo(x, y - r * 1.15)
    ctx.lineTo(x + r, y + r * 0.75)
    ctx.lineTo(x - r, y + r * 0.75)
    ctx.closePath()
  } else {
    ctx.moveTo(x, y - r * 1.25)
    ctx.lineTo(x + r * 1.25, y)
    ctx.lineTo(x, y + r * 1.25)
    ctx.lineTo(x - r * 1.25, y)
    ctx.closePath()
  }
  ctx.fill()
}

/* --- Lexical retrieval ----------------------------------------------------
   Deliberately simple and deliberately labelled. This is IDF-weighted term
   overlap, which is the oldest trick in information retrieval and the honest
   one to use when there is no encoder on the client.                       */

const STOPWORDS = new Set(
  ('a an and are as at be but by can did do does for from had has have he her his how i if in ' +
    'into is it its me my no not of on or our so than that the their them then there these they ' +
    'this to too us was we were what when where which who will with you your')
    .split(' '),
)

function terms(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((word) => word.replace(/^\.+|\.+$/g, ''))
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
}

type Match = { point: LabPoint; score: number; hits: string[] }

export type Placement = {
  x: number
  y: number
  matches: Match[]
}

/** Document frequencies and per-chunk term sets, computed once for the
    lifetime of the module. Twenty-three documents is small enough that this
    is cheaper than shipping a precomputed table in the generated data. */
const CORPUS = LAB_POINTS.map((point) => ({ point, set: new Set(terms(point.text)) }))
const IDF = ((): Map<string, number> => {
  const df = new Map<string, number>()
  for (const { set } of CORPUS) {
    for (const term of set) df.set(term, (df.get(term) ?? 0) + 1)
  }
  const idf = new Map<string, number>()
  const n = CORPUS.length
  // Smoothed IDF: ln((N+1)/(df+1)) + 1. A term in every chunk still carries a
  // little weight rather than zero, which stops short queries scoring nothing.
  for (const [term, count] of df) idf.set(term, Math.log((n + 1) / (count + 1)) + 1)
  return idf
})()

/** Highest IDF in the corpus, used to weight terms the corpus has never seen
    (an unknown word is maximally specific — it just matches nothing). */
const MAX_IDF = Math.log(CORPUS.length + 1) + 1

function place(query: string): Placement | null {
  const queryTerms = [...new Set(terms(query))]
  if (queryTerms.length === 0) return null

  const scored: Match[] = []
  for (const { point, set } of CORPUS) {
    let score = 0
    const hits: string[] = []
    for (const term of queryTerms) {
      if (!set.has(term)) continue
      score += IDF.get(term) ?? MAX_IDF
      hits.push(term)
    }
    if (score > 0) scored.push({ point, score, hits })
  }
  if (scored.length === 0) return null

  scored.sort((a, b) => b.score - a.score || a.point.id.localeCompare(b.point.id))
  const matches = scored.slice(0, 3)

  const total = matches.reduce((sum, match) => sum + match.score, 0)
  if (total === 0) return null
  const x = matches.reduce((sum, m) => sum + m.point.x * m.score, 0) / total
  const y = matches.reduce((sum, m) => sum + m.point.y * m.score, 0) / total
  return { x, y, matches }
}

/* --- Component ------------------------------------------------------------ */

const percent = (value: number): string => `${(value * 100).toFixed(1)}%`

export function EmbeddingMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const transformRef = useRef<Transform>({ ox: 0, oy: 0, scale: 1 })

  const [active, setActive] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [size, setSize] = useState({ width: 0, height: 0 })

  const inputId = useId()
  const placement = useMemo(() => place(query), [query])

  const sourceIndex = useMemo(() => {
    const map = new Map<string, number>()
    LAB_SOURCES.forEach((source, index) => map.set(source.id, index))
    return map
  }, [])

  /* Size the backing store to the device pixel ratio. Without this the map is
     visibly soft on every retina display, and the softness reads as a bug in
     the drawing code rather than a missing multiply. */
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize({ width: Math.round(width), height: Math.round(height) })
    })
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = size
    if (width < 2 || height < 2) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    /* Both reads are tokens, and there is no hex literal anywhere in this
       file: --chapter-bright is the live chapter hue, --color-accent-fixed is
       the brand cyan for the (impossible in practice) case where the
       registered property has not resolved yet. */
    const styles = getComputedStyle(canvas)
    const accent = parseColour(
      styles.getPropertyValue('--chapter-bright') ||
        styles.getPropertyValue('--color-accent-fixed'),
    )
    const inkFaint = styles.getPropertyValue('--color-ink-3').trim()
    /* Canvas's `font` shorthand takes a real font stack, not a var() — so the
       stack is read off the element (which carries `font-mono`) rather than
       written out here. One less place that has to know the typeface. */
    const mono = styles.fontFamily || 'monospace'
    /* The hairline token, not a hand-written rgba() — the axis cross has to be
       the same weight as every other divider on the site, and duplicating the
       value here would be a colour to keep in sync by hand. */
    const hairline = styles.getPropertyValue('--color-hairline').trim()

    const transform = fit(width, height)
    transformRef.current = transform

    // Axis cross through the corpus mean (data origin). Decorative: the DOM
    // caption names the axes.
    const [zx, zy] = toScreen(transform, 0, 0)
    ctx.strokeStyle = hairline
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(PAD * 0.5, zy)
    ctx.lineTo(width - PAD * 0.5, zy)
    ctx.moveTo(zx, PAD * 0.5)
    ctx.lineTo(zx, height - PAD * 0.5)
    ctx.stroke()

    // Lines from the query point to its matches, drawn first so dots sit on
    // top of them.
    if (placement) {
      const [qx, qy] = toScreen(transform, placement.x, placement.y)
      ctx.strokeStyle = hsl({ ...accent, l: Math.max(accent.l, 0.6) }, 0.5)
      ctx.lineWidth = 1
      for (const match of placement.matches) {
        const [mx, my] = toScreen(transform, match.point.x, match.point.y)
        ctx.beginPath()
        ctx.moveTo(qx, qy)
        ctx.lineTo(mx, my)
        ctx.stroke()
      }
    }

    LAB_POINTS.forEach((point, index) => {
      const [x, y] = toScreen(transform, point.x, point.y)
      const isActive = index === active
      const isMatch = placement?.matches.some((match) => match.point.id === point.id) ?? false
      const offset = hueOffset(sourceIndex.get(point.source) ?? 0, LAB_SOURCES.length)

      const tone: Hsl = isActive
        ? { ...accent, l: Math.min(accent.l + 0.12, 0.86) }
        : {
            h: accent.h + offset,
            s: Math.max(accent.s * 0.82, 0.4),
            l: Math.min(Math.max(accent.l * 0.86, 0.56), 0.78),
          }

      ctx.fillStyle = hsl(tone, isActive || isMatch ? 1 : 0.78)
      drawMark(ctx, shapeFor(point.source), x, y, isActive ? DOT * 1.7 : DOT)

      // A ring rather than a bigger dot for the active point: the dot's size
      // carries no data, so growing it is fine, but the ring is what makes it
      // findable at a glance.
      if (isActive) {
        ctx.strokeStyle = hsl({ ...accent, l: Math.min(accent.l + 0.12, 0.9) }, 0.85)
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(x, y, DOT * 3.1, 0, Math.PI * 2)
        ctx.stroke()
      }
    })

    if (placement) {
      const [qx, qy] = toScreen(transform, placement.x, placement.y)
      ctx.strokeStyle = hsl({ ...accent, l: Math.min(accent.l + 0.1, 0.9) })
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(qx, qy, DOT * 1.6, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(qx - DOT * 2.6, qy)
      ctx.lineTo(qx + DOT * 2.6, qy)
      ctx.moveTo(qx, qy - DOT * 2.6)
      ctx.lineTo(qx, qy + DOT * 2.6)
      ctx.stroke()

      // No ink token resolved: skip the label rather than invent a colour for
      // it. The marker itself is still drawn, and the DOM list below names it.
      if (inkFaint.length > 0) {
        ctx.font = `11px ${mono}`
        ctx.fillStyle = inkFaint
        ctx.textAlign = qx > width - 90 ? 'right' : 'left'
        ctx.fillText('your text', qx > width - 90 ? qx - 10 : qx + 10, qy - 9)
      }
    }
  }, [size, active, placement, sourceIndex])

  useEffect(draw, [draw])

  /* Redraw while the chapter hue interpolates. The accent is a registered
     @property transitioning over 900ms, so a single redraw on change would
     bake in whatever colour the transition happened to be passing through at
     that instant. A short rAF loop tracks it and then stops — no persistent
     animation frame, no React state in the loop (re-rendering 23 buttons at
     60fps to change one canvas colour would be absurd), and under reduced
     motion, where the transition is disabled outright, one redraw is enough. */
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    let raf = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const unsubscribe = subscribeToChapter(() => {
      drawRef.current()
      if (reduced) return
      cancelAnimationFrame(raf)
      const until = performance.now() + 1000
      const step = () => {
        drawRef.current()
        if (performance.now() < until) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    })

    return () => {
      unsubscribe()
      cancelAnimationFrame(raf)
    }
  }, [])

  /* Pointer hit-testing uses the same transform the draw pass stored, so the
     mouse can never disagree with the picture. */
  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const px = event.clientX - rect.left
    const py = event.clientY - rect.top
    const transform = transformRef.current

    let nearest: number | null = null
    let best = HIT_RADIUS
    LAB_POINTS.forEach((point, index) => {
      const [x, y] = toScreen(transform, point.x, point.y)
      const distance = Math.hypot(x - px, y - py)
      if (distance < best) {
        best = distance
        nearest = index
      }
    })
    setActive(nearest)
  }

  const current = active === null ? null : LAB_POINTS[active]
  const tooltip = (() => {
    if (!current || size.width < 2) return null
    const [x, y] = toScreen(transformRef.current, current.x, current.y)
    return { x, y, point: current }
  })()

  return (
    <div>
      <Caption>demonstrates: how related ideas cluster in embedding space</Caption>

      <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
        <div>
          <div
            ref={wrapRef}
            className="relative h-[clamp(15rem,38vw,20rem)] overflow-hidden rounded-[var(--radius-md)] border border-hairline bg-canvas-2"
          >
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className="size-full font-mono"
              onPointerMove={onPointerMove}
              onPointerLeave={() => setActive(null)}
            />

            {/* Positioned with translate3d rather than left/top: this project
                only ever moves things with transforms, and a transform keeps
                the tooltip on the compositor instead of laying out the
                overlay on every pointer move. */}
            {tooltip ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 max-w-[15rem] rounded-[var(--radius-xs)] border border-hairline-strong bg-surface-raised px-2.5 py-1.5 font-mono text-[0.6875rem] leading-snug text-ink"
                style={{
                  transform: `translate3d(${Math.min(
                    Math.max(tooltip.x + 14, 8),
                    Math.max(size.width - 250, 8),
                  )}px, ${Math.min(Math.max(tooltip.y - 14, 8), Math.max(size.height - 56, 8))}px, 0)`,
                }}
              >
                <span className="text-accent">{tooltip.point.source}</span>
                <span className="text-ink-3"> · </span>
                {tooltip.point.label}
              </div>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <Meta>
              x = component 1 ({percent(PCA_EXPLAINED_VARIANCE_1)}) · y = component 2 (
              {percent(PCA_EXPLAINED_VARIANCE_2)})
            </Meta>
            <Meta>{LAB_POINTS.length} chunks · {PCA_DIMENSIONS}d → 2d</Meta>
          </div>

          <div className="mt-5">
            <label htmlFor={inputId} className="block text-[0.9375rem] text-ink">
              Drop an idea on the map
            </label>
            <input
              id={inputId}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="try: performance on a WordPress site"
              autoComplete="off"
              spellCheck={false}
              className="mt-2 w-full rounded-[var(--radius-sm)] border border-hairline bg-white/[0.03] px-3 py-2.5 font-mono text-[0.8125rem] text-ink placeholder:text-ink-3 focus:border-accent/50 focus:outline-none"
            />

            {/* role=status, not an aria-hidden decoration: this is the result
                of the interaction, and a keyboard user who cannot see the
                lines on the canvas needs to be told what matched. */}
            <div role="status" aria-live="polite" className="mt-3 min-h-10">
              {query.trim().length === 0 ? (
                <p className="text-[0.8125rem] leading-relaxed text-ink-3">
                  Your text is placed at the centroid of its closest matches by term overlap
                  — the map itself is real bge-small embeddings, projected with PCA. Your
                  words are not embedded, and pretending otherwise would be the one dishonest
                  thing in this instrument.
                </p>
              ) : placement ? (
                <ul className="space-y-1.5">
                  {placement.matches.map((match) => (
                    <li key={match.point.id} className="text-[0.8125rem] leading-snug">
                      <span className="font-mono text-accent">
                        {match.score.toFixed(2)}
                      </span>{' '}
                      <span className="text-ink">{match.point.label}</span>{' '}
                      <span className="font-mono text-ink-3">
                        [{match.point.source}] {match.hits.join(' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[0.8125rem] leading-relaxed text-ink-3">
                  No term in that shares a word with any of the {LAB_POINTS.length} chunks, so
                  there is nowhere honest to put it. A real embedding would still find the
                  nearest meaning — that is the difference this instrument is drawing your
                  attention to.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* The map's text equivalent. Not a fallback that duplicates the
            canvas — the same state drives both, so focusing an entry
            highlights its dot and shows the same tooltip. */}
        <div>
          <Meta as="p" className="mb-2 block">
            the corpus · scrolls
          </Meta>
          <ul className="max-h-[19rem] space-y-0.5 overflow-y-auto pr-1">
            {LAB_POINTS.map((point, index) => {
              const selected = index === active
              return (
                <li key={point.id}>
                  <button
                    type="button"
                    onFocus={() => setActive(index)}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => setActive(index)}
                    className={cx(
                      'w-full rounded-[var(--radius-xs)] px-2 py-1 text-left font-mono text-[0.6875rem] leading-snug transition-colors duration-[var(--duration-micro)]',
                      selected
                        ? 'bg-accent/12 text-ink'
                        : 'text-ink-3 hover:bg-white/[0.04] hover:text-ink-2',
                    )}
                  >
                    <span className={selected ? 'text-accent' : undefined}>
                      {point.source}
                    </span>
                    <span aria-hidden="true"> · </span>
                    {point.label}
                  </button>
                </li>
              )
            })}
          </ul>

          {current ? (
            <p className="mt-3 border-t border-hairline pt-3 text-[0.8125rem] leading-relaxed text-ink-2">
              {current.text.slice(0, 180)}
              {current.text.length > 180 ? '…' : ''}
            </p>
          ) : null}
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-[0.8125rem] leading-relaxed text-ink-3">
        The two axes are the directions of greatest variance in the 384-dimension
        embedding space, found by PCA. Together they hold{' '}
        <span className="text-ink-2">{percent(PCA_EXPLAINED_VARIANCE)}</span> of the corpus's
        total variance — so roughly three quarters of the structure is in dimensions this flat
        picture cannot show. Clusters here are real; exact distances are not.
      </p>
    </div>
  )
}
