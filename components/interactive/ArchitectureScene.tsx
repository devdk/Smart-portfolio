'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Meta, Pill, cx } from '@/components/primitives'
import type { Project } from '@/lib/schema'

/* ==========================================================================
   ARCHITECTURE SCENE — the system assembling itself as you read it

   Part 05 of a case study used to be a static list of nodes. The list was
   correct and it is still here, unchanged in substance, because it is the
   thing that has to be readable in every condition. What is added on top, for
   a wide viewport belonging to someone who has not asked for less motion, is
   the diagram being BUILT one component at a time as the page scrolls: the
   node materialises, then the edge to the next one draws itself, then a packet
   starts travelling down it. The claim being made is that this is a system
   that was assembled in an order, for reasons, and the order is the argument.

   ── WHY STICKY, AND WHY THE DEFINITION OF "PINNED" LIVES IN CSS ────────────
   Same reasoning as the Process tablist, and deliberately the same
   mechanism so there is one pinning pattern in this codebase rather than two.
   `position: sticky` holds the diagram with no scroll listener, survives
   resize with no refresh, and cannot desynchronise from the scrollbar because
   it IS the scrollbar. JavaScript is left with the single job CSS cannot do:
   deciding which step we are on. That is one getBoundingClientRect per
   animation frame on a passive listener, and it does not run at all when the
   scene is not pinned.

   The either/or between "assembling diagram" and "finished diagram" is a media
   query in styles/theme.css, not a Tailwind variant stack and not a JS branch:
   Tailwind's `lg:motion-reduce:*` resolves by stylesheet emission order rather
   than class order, and a JS branch would paint the wrong layout first and
   correct it after hydration. CSS knows at first paint. The same query string
   is passed to matchMedia below, so "pinned" is defined exactly once.

   ── WHY THE DETAIL PANEL IS THE ORDERED LIST ITSELF ────────────────────────
   The tempting build is a diagram plus a panel showing only the active node,
   with the other five faded to nothing. That is content hidden behind a scroll
   position: unreachable by Ctrl+F, unreachable by a screen reader that is not
   driving the scroll, and — because axe resolves a transparent foreground
   against its background — a contrast violation waiting to happen.

   So the <ol> is complete, always, and on a pinned viewport it IS the detail
   panel: one node per scroll step, laid out so the step you are on is the card
   in front of you. Emphasis is carried by an accent spine that cross-fades
   between cards, never by taking contrast away from the text of the others.
   Every node's tech, purpose, rationale and failure mode is in the DOM on
   first paint, at full contrast, selectable, findable, in reading order.

   The SVG is therefore decorative and marked aria-hidden — a complete semantic
   equivalent is always beside it, including every edge label, which is listed
   under the node it leaves from.
   ========================================================================== */

/** The one definition of "pinned". styles/theme.css contains the identical
    condition; if one changes, change both. */
const PINNED_QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

/* --- Diagram geometry -----------------------------------------------------
   Fixed viewBox units, computed here rather than measured from the DOM. That
   is what makes the whole scene layout-read-free: every path, label and
   travelling dot is known at render time, so nothing has to observe an
   element to find out where to draw. LANE_X is the gutter that non-linear
   edges (a fan-out, a loop back) bow into so they cannot sit on top of the
   spine of the diagram.                                                     */
const X = 8
const NODE_W = 288
const NODE_H = 56
const GAP = 40
const STRIDE = NODE_H + GAP
const CENTRE_X = X + NODE_W / 2
const RIGHT_X = X + NODE_W
const LANE_X = 336
const VIEW_W = 352

const nodeY = (index: number): number => index * STRIDE

/**
 * The path an edge takes. Adjacent nodes are joined straight down the spine;
 * anything else bows out into the right-hand lane, so a fan-out or a loop back
 * is still legible rather than overlapping the column.
 */
function edgePath(fromIndex: number, toIndex: number): string {
  const yFrom = nodeY(fromIndex)
  const yTo = nodeY(toIndex)

  if (toIndex === fromIndex + 1) {
    return `M ${CENTRE_X} ${yFrom + NODE_H} L ${CENTRE_X} ${yTo}`
  }

  const midFrom = yFrom + NODE_H / 2
  const midTo = yTo + NODE_H / 2
  return `M ${RIGHT_X} ${midFrom} C ${LANE_X} ${midFrom} ${LANE_X} ${midTo} ${RIGHT_X} ${midTo}`
}

/** Where the travelling dot starts, so it has a sane resting position if
    `offset-path` is unsupported (see the comment on the dot itself). */
function edgeStart(fromIndex: number, toIndex: number): { x: number; y: number } {
  if (toIndex === fromIndex + 1) return { x: CENTRE_X, y: nodeY(fromIndex) + NODE_H }
  return { x: RIGHT_X, y: nodeY(fromIndex) + NODE_H / 2 }
}

type Architecture = NonNullable<Project['architecture']>

type PlacedEdge = {
  key: string
  from: number
  to: number
  label: string | undefined
  d: string
  start: { x: number; y: number }
  /** The step at which this edge has both of its ends on screen. */
  revealAt: number
  labelX: number
  labelY: number
  labelAnchor: 'start' | 'end'
}

export function ArchitectureScene({
  architecture,
  projectTitle,
}: {
  architecture: Architecture
  projectTitle: string
}) {
  const { nodes, edges } = architecture
  const trackRef = useRef<HTMLDivElement>(null)

  /* Step 0 on the server and on first paint: node one is the only one that has
     materialised. Nothing depends on this for legibility — the list is whole
     regardless — so there is no hydration hazard in it being wrong for a frame
     on a viewport that turns out not to be pinned. */
  const [step, setStep] = useState(0)

  /* Pinned-ness is CSS's business, with one exception: whether "the current
     step" is a real concept at all. Unpinned, every node is equally present
     and marking one of them aria-current would be a lie to a screen reader.
     So this is read once after mount and used for nothing but that. */
  const [pinned, setPinned] = useState(false)

  const indexOfNode = (id: string): number => nodes.findIndex((node) => node.id === id)

  /* Edges are placed by looking their ends up in the node order. An edge
     naming a node that does not exist is dropped rather than drawn to
     nowhere — the schema does not enforce referential integrity, so this is
     the one place that can notice.

     `revealAt` is max(from, to) rather than the edge's own array position:
     for the linear pipelines all four case studies currently describe, that
     is exactly "at step N, edges 0..N-1 are drawn", and it stays correct for
     a diagram that branches, where edge order and node order diverge. */
  const placed: PlacedEdge[] = []
  edges.forEach((edge, i) => {
    const from = indexOfNode(edge.from)
    const to = indexOfNode(edge.to)
    if (from === -1 || to === -1) return

    const adjacent = to === from + 1
    const midY = (nodeY(from) + NODE_H / 2 + (nodeY(to) + NODE_H / 2)) / 2

    placed.push({
      key: `${edge.from}-${edge.to}-${i}`,
      from,
      to,
      label: edge.label,
      d: edgePath(from, to),
      start: edgeStart(from, to),
      revealAt: Math.max(from, to),
      labelX: adjacent ? CENTRE_X + 10 : LANE_X - 6,
      labelY: adjacent ? midY + 3.5 : midY,
      labelAnchor: adjacent ? 'start' : 'end',
    })
  })

  /* Outgoing edges per node, for the semantic list. Every edge appears under
     the node it leaves from, so the aria-hidden diagram is never the only
     place a connection or its label is stated. */
  const outgoing = nodes.map((node) =>
    edges
      .filter((edge) => edge.from === node.id)
      .map((edge) => ({
        label: edge.label,
        to: nodes.find((candidate) => candidate.id === edge.to)?.label ?? edge.to,
      })),
  )

  const viewH = nodes.length * STRIDE - GAP

  /* Scroll drives the step — one rect read per frame, and only while pinned. */
  useEffect(() => {
    /* Bound to a const immediately: `if (!trackRef.current) return` does not
       narrow inside the nested arrow functions below, and would not survive
       into a hoisted `function` declaration at all. Same reason as the note in
       components/interactive/ParticleName.tsx. */
    const track = trackRef.current
    if (!track) return

    const media = window.matchMedia(PINNED_QUERY)
    let isPinned = media.matches
    let frame = 0

    setPinned(isPinned)

    const read = () => {
      frame = 0
      const rect = track.getBoundingClientRect()

      /* The track is (nodes.length + 1) strides tall: one stride per node,
         plus a final one so the completed diagram holds still before the
         section ends. Stride is derived from the MEASURED height rather than
         re-deriving 60vh here, so the number only exists in theme.css. */
      const stride = rect.height / (nodes.length + 1)
      if (stride <= 0) return

      // Which stride the viewport's centre line currently falls in.
      const centre = -rect.top + window.innerHeight / 2
      const index = Math.min(nodes.length - 1, Math.max(0, Math.floor(centre / stride)))
      setStep(index)
    }

    const onScroll = () => {
      if (!isPinned || frame !== 0) return
      frame = requestAnimationFrame(read)
    }

    const onMediaChange = () => {
      isPinned = media.matches
      setPinned(isPinned)
      if (isPinned) read()
    }

    media.addEventListener('change', onMediaChange)
    window.addEventListener('scroll', onScroll, { passive: true })
    if (isPinned) read()

    return () => {
      media.removeEventListener('change', onMediaChange)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [nodes.length])

  /**
   * The rail moves the window rather than just setting state: while pinned,
   * scroll position is the source of truth, so a step set any other way would
   * be overruled by the next scroll event and the rail would look broken.
   * Inverts the read above exactly. `behavior: 'auto'` deliberately — this
   * codebase does not hijack scrolling with smooth behaviour.
   */
  function goToStep(index: number) {
    const track = trackRef.current
    if (!track || !window.matchMedia(PINNED_QUERY).matches) return
    const stride = track.offsetHeight / (nodes.length + 1)
    const trackTop = track.getBoundingClientRect().top + window.scrollY
    window.scrollTo({
      top: trackTop + (index + 0.5) * stride - window.innerHeight / 2,
      behavior: 'auto',
    })
    setStep(index)
  }

  return (
    /* The track IS the grid, deliberately: the sticky diagram can only stay
       pinned for as long as its containing block lasts, and that block is this
       element's column. Wrapping a shorter grid in a taller track would set the
       diagram loose one stride early — the last node would materialise as the
       diagram slid off the top. One element means the settle stride belongs to
       the column too. */
    <div
      ref={trackRef}
      className="arch-track grid gap-8 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:gap-10"
      style={{ '--arch-steps': nodes.length } as CSSProperties}
    >
      {/* ---- Column one: the diagram. Sticky only while pinned. ---- */}
      <div>
        {/* The stage centres the rail-and-diagram PAIR in the pinned viewport
            (grid + align-content in theme.css) rather than centring each of
            them separately, which is what keeps 01 on the rail beside node 01
            in the diagram at every viewport height. */}
        <div className="arch-stage">
          <div className="flex gap-4">
            {/* The step rail. Same visual language as the Lab's act rail —
                mono, uppercase, accent-tinted when current. It is display:none
                unless pinned, because unpinned there is no current step for it
                to mark and nothing it could usefully scroll to. */}
            {/* role="group" so the label is actually allowed to be here: ARIA
                prohibits aria-label on a generic element, and an unlabelled
                strip of two-digit buttons is the kind of thing that reads as
                "01, 02, 03" and nothing else. */}
            <div
              className="arch-rail flex-col gap-1.5"
              role="group"
              aria-label="Architecture steps"
            >
              {nodes.map((node, index) => {
                const current = index === step
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => goToStep(index)}
                    aria-current={pinned && current ? 'step' : undefined}
                    aria-label={`Step ${String(index + 1).padStart(2, '0')}: ${node.label}`}
                    className={cx(
                      'rounded-[var(--radius-xs)] border px-2 py-1.5 font-mono text-[0.6875rem] tracking-[0.06em]',
                      'transition-colors duration-[var(--duration-micro)] ease-[var(--ease-micro)]',
                      current
                        ? 'border-accent/40 bg-accent/10 text-accent'
                        : 'border-hairline bg-white/[0.02] text-ink-3 hover:border-hairline-strong hover:text-ink-2',
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </button>
                )
              })}
            </div>
  
            {/* Decorative by construction: the <ol> beside this carries every
                node's label, tech, purpose, rationale, failure mode and
                outgoing connections as text, so there is nothing here for
                assistive technology to miss. */}
            <svg
              viewBox={`0 0 ${VIEW_W} ${viewH}`}
              className="arch-diagram w-full"
              aria-hidden="true"
              focusable="false"
            >
              {placed.map((edge, i) => (
                <g
                  key={edge.key}
                  className="arch-edge"
                  data-on={step >= edge.revealAt ? 'true' : 'false'}
                >
                  {/* The stroke-dashoffset exception.
                      This codebase animates transform and opacity ONLY. This
                      line is the one documented exception, and it is a
                      deliberate choice rather than an oversight: there is no
                      transform that expresses "draw a line from one end to the
                      other", stroke-dashoffset is a presentation attribute the
                      compositor handles well, and it triggers neither layout
                      nor a paint of anything but the stroke itself. The
                      alternatives are worse in exactly the ways the motion
                      rules exist to prevent — animating a clip-path, animating
                      the second endpoint (SVG geometry invalidation every
                      frame), or masking with an animated width.
  
                      pathLength="1" normalises the geometry, so one dash value
                      draws a straight spine and a bowed lane edge identically
                      without measuring either. */}
                  <path
                    d={edge.d}
                    pathLength={1}
                    strokeDasharray={1}
                    className="arch-edge-line stroke-accent fill-none"
                    strokeWidth={1.25}
                    strokeLinecap="round"
                  />
  
                  {/* Data flow. Slow — one traverse per three seconds — because
                      it is meant to read as a system ticking over, not as a
                      loading spinner. Rendered always but display:none unless
                      pinned AND the edge is drawn, so a phone and a
                      reduced-motion visitor never get a moving dot.
  
                      cx/cy sit at the start of the path so that a browser
                      without offset-path support leaves the dot at the head of
                      its edge rather than in the corner of the viewBox;
                      transform-box: fill-box (in theme.css) is what makes the
                      offset anchor the dot's own centre. */}
                  <circle
                    className="arch-flow fill-accent"
                    cx={edge.start.x}
                    cy={edge.start.y}
                    r={3}
                    style={
                      {
                        offsetPath: `path("${edge.d}")`,
                        '--arch-flow-delay': `${i * 420}ms`,
                      } as CSSProperties
                    }
                  />
  
                  {edge.label ? (
                    <text
                      x={edge.labelX}
                      y={edge.labelY}
                      textAnchor={edge.labelAnchor}
                      className="arch-edge-label fill-ink-3 font-mono"
                      fontSize={10}
                    >
                      {edge.label}
                    </text>
                  ) : null}
                </g>
              ))}
  
              {nodes.map((node, index) => {
                const y = nodeY(index)
                return (
                  <g
                    key={node.id}
                    className="arch-node"
                    data-on={step >= index ? 'true' : 'false'}
                    data-active={step === index ? 'true' : 'false'}
                  >
                    <rect
                      x={X}
                      y={y}
                      width={NODE_W}
                      height={NODE_H}
                      rx={14}
                      className="fill-canvas-2 stroke-hairline-strong"
                      strokeWidth={1}
                    />
                    {/* Active state, cross-faded by opacity alone: an accent
                        wash and an accent ring over the resting card. Nothing
                        here changes the geometry, so the two states cannot
                        shift the diagram by a pixel between steps. */}
                    <rect
                      x={X}
                      y={y}
                      width={NODE_W}
                      height={NODE_H}
                      rx={14}
                      className="arch-node-wash fill-accent"
                    />
                    <rect
                      x={X + 0.5}
                      y={y + 0.5}
                      width={NODE_W - 1}
                      height={NODE_H - 1}
                      rx={13.5}
                      className="arch-node-ring stroke-accent fill-none"
                      strokeWidth={1.5}
                    />
                    <text
                      x={X + 18}
                      y={y + NODE_H / 2 + 4}
                      className="fill-ink-3 font-mono"
                      fontSize={11}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </text>
                    <text
                      x={X + 46}
                      y={y + NODE_H / 2 + 5}
                      className="fill-ink"
                      fontSize={15}
                    >
                      {node.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* ---- Column two: the complete list. This is the accessible
              equivalent of the diagram AND, while pinned, the detail panel.
              Never de-emphasised by lowering contrast — every card keeps
              ink/ink-2 text at every step, and the current one is marked by
              an accent spine that fades in as the previous fades out. ---- */}
      <ol
        className="arch-list flex flex-col gap-4"
        aria-label={`${projectTitle} architecture: ${nodes.length} components in order`}
      >
        {nodes.map((node, index) => {
          const current = index === step
          /* The card's own classes have to gate on `pinned` where CSS
             cannot: unpinned, "current" is not a concept, and tinting the
             first node's tech pill accent would claim a state that does not
             exist. Everything driven from theme.css gates on the media
             query instead and needs no such flag. */
          const emphasised = pinned && current
          const connections = outgoing[index] ?? []
          return (
            <li
              key={node.id}
              className="arch-detail"
              data-active={current ? 'true' : 'false'}
              aria-current={pinned && current ? 'step' : undefined}
            >
              <div className="surface-1 relative overflow-hidden rounded-[var(--radius-md)] p-5 sm:p-6">
                {/* The spine. A border-COLOUR change would be dead CSS here:
                    the surface-* utilities set the `border` shorthand and are
                    emitted after Tailwind's border utilities, so this is an
                    element of its own whose opacity is animated instead —
                    which is also the only property the motion rules allow. */}
                <span
                  aria-hidden="true"
                  className="arch-detail-spine absolute inset-y-0 left-0 w-[2px] bg-accent"
                />

                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <h3 className="text-h3 font-medium text-ink">
                    <Meta className="mr-3 align-middle">
                      {String(index + 1).padStart(2, '0')}
                    </Meta>
                    {node.label}
                  </h3>
                  <Pill active={emphasised}>{node.tech}</Pill>
                </div>

                <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <Meta as="dt" className="mb-1.5">
                      Purpose
                    </Meta>
                    <dd className="text-[0.9375rem] leading-relaxed text-ink-2">
                      {node.purpose}
                    </dd>
                  </div>
                  <div>
                    <Meta as="dt" className="mb-1.5">
                      Why this, not the obvious alternative
                    </Meta>
                    <dd className="text-[0.9375rem] leading-relaxed text-ink-2">
                      {node.rationale}
                    </dd>
                  </div>
                </dl>

                {node.failureMode ? (
                  /* The honest replacement for a fake failure simulator:
                     where this component gives way, and under what
                     conditions. A rule rather than a colour, so it reads as
                     engineering judgement and not a warning banner. */
                  <div className="mt-5 border-l-2 border-hairline-strong pl-4">
                    <Meta className="mb-1.5 block">What breaks first</Meta>
                    <p className="text-[0.9375rem] leading-relaxed text-ink-2">
                      {node.failureMode}
                    </p>
                  </div>
                ) : null}

                {connections.length > 0 ? (
                  <div className="mt-5 border-t border-hairline pt-4">
                    <Meta className="mb-1.5 block">Connects to</Meta>
                    <ul className="flex flex-col gap-1">
                      {connections.map((connection) => (
                        <li
                          key={`${node.id}-${connection.to}-${connection.label ?? ''}`}
                          className="text-[0.9375rem] text-ink-2"
                        >
                          {connection.to}
                          {connection.label ? (
                            <span className="text-ink-3"> · {connection.label}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
