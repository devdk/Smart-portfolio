'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { cx } from '@/components/primitives'

/* ==========================================================================
   GRAPH MAP

   The interactive half. Positions arrive already solved from
   lib/graph-layout.ts, so this file does no physics — it renders coordinates
   and handles pan, zoom, hover and selection.

   ── WHY THE DATA IS A PROP AND NOT AN IMPORT ──────────────────────────────

   This is a client component. Importing lib/graph.ts here would pull the
   entire content module graph — every project, every decision, all the prose —
   into the browser bundle to draw about sixty circles. The server slices out
   exactly the fields the picture needs and passes them down. That is the
   difference between a few KB and a few hundred.

   ── WHAT IS ACTUALLY INTERACTIVE, AND WHY ONLY THAT ───────────────────────

   Pan, zoom, hover, select. Deliberately NOT node dragging: dragging a node
   in a pre-solved layout either does nothing useful or requires re-running the
   solver, and re-running it destroys the one property that makes this layout
   worth having — that the picture is the same every time you come back.

   ── KEYBOARD ──────────────────────────────────────────────────────────────

   Every node is a real <button> in the SVG, so Tab reaches them in a stable
   order and Enter selects. The selection panel is a live region, so a screen
   reader hears what was selected rather than being told to look at a circle.
   The full relationship list also exists as plain markup outside this
   component, which is what makes the picture safe to treat as decoration.
   ========================================================================== */

export type MapNode = {
  id: string
  kind: string
  label: string
  href?: string
  x: number
  y: number
  r: number
  labelled: boolean
  degree: number
  /** Short human line shown in the panel. */
  detail?: string
}

export type MapEdge = { a: string; b: string; kind: string; accent: boolean }

/* Colour per kind. Every one of these clears 4.5:1 on the canvas as a fill,
   and the LABEL colour is separate — a fill can be dimmer than text is allowed
   to be, and conflating the two is how graphs end up with unreadable names. */
const KIND_COLOR: Record<string, string> = {
  person: 'var(--color-accent-bright)',
  project: 'var(--color-accent)',
  client: '#4ade80',
  organisation: '#fbbf24',
  industry: '#8fd6ff',
  technology: '#8a9299',
  decision: '#c4b5fd',
  incident: '#fb7185',
}

const KIND_LABEL: Record<string, string> = {
  person: 'Me',
  project: 'Project',
  client: 'Client',
  organisation: 'Employer',
  industry: 'Industry',
  technology: 'Technology',
  decision: 'Decision',
  incident: 'Failure',
}

const ZOOM_STEP = 1.35
const ZOOM_MIN = 0.6
const ZOOM_MAX = 4

export function GraphMap({
  nodes,
  edges,
  width,
  height,
}: {
  nodes: MapNode[]
  edges: MapEdge[]
  width: number
  height: number
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  /** The node whose neighbourhood is currently lit: selection wins over hover. */
  const focus = selected ?? hovered

  /** Neighbour ids of the focused node, so everything else can recede. */
  const lit = useMemo(() => {
    if (!focus) return null
    const set = new Set<string>([focus])
    for (const edge of edges) {
      if (edge.a === focus) set.add(edge.b)
      if (edge.b === focus) set.add(edge.a)
    }
    return set
  }, [focus, edges])

  const selectedNode = selected ? byId.get(selected) : undefined
  const selectedNeighbours = useMemo(() => {
    if (!selected) return []
    return edges
      .filter((e) => e.a === selected || e.b === selected)
      .map((e) => ({
        kind: e.kind,
        node: byId.get(e.a === selected ? e.b : e.a),
      }))
      .filter((row): row is { kind: string; node: MapNode } => Boolean(row.node))
  }, [selected, edges, byId])

  const onPointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      /* Only start a pan on the background. Starting one on a node would make
         every node click feel like a missed drag. */
      if ((event.target as Element).closest('[data-node]')) return
      drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [pan],
  )

  const onPointerMove = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    const start = drag.current
    if (!start) return
    setPan({
      x: start.panX + (event.clientX - start.x),
      y: start.panY + (event.clientY - start.y),
    })
  }, [])

  const endDrag = useCallback(() => {
    drag.current = null
  }, [])

  const changeZoom = useCallback((factor: number) => {
    setZoom((current) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, current * factor)))
  }, [])

  const reset = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSelected(null)
  }, [])

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-[var(--radius-lg)] border border-hairline"
        style={{
          /* A soft wash so the graph sits on a surface rather than floating in
             the page. Two radials in the chapter hue, same treatment as the
             featured images use. */
          background:
            'radial-gradient(80% 60% at 18% 8%, rgb(255 255 255 / 0.035) 0%, transparent 60%),' +
            'radial-gradient(70% 70% at 88% 96%, color-mix(in oklab, var(--color-accent) 12%, transparent) 0%, transparent 62%),' +
            'var(--color-canvas-2)',
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={cx(
            'block w-full touch-none select-none',
            drag.current ? 'cursor-grabbing' : 'cursor-grab',
          )}
          style={{ aspectRatio: `${width} / ${height}` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          role="group"
          aria-label="Interactive map of clients, projects and technologies. The same relationships are listed as text below."
        >
          <g
            transform={`translate(${pan.x} ${pan.y}) scale(${zoom}) translate(${(width * (1 - 1 / zoom)) / 2 - (width * (1 - 1 / zoom)) / 2} 0)`}
            style={{ transformOrigin: 'center' }}
          >
            {/* Edges first, so nodes sit on top of their own lines. */}
            <g>
              {edges.map((edge) => {
                const a = byId.get(edge.a)
                const b = byId.get(edge.b)
                if (!a || !b) return null
                const isLit = lit ? lit.has(edge.a) && lit.has(edge.b) : false
                const dim = Boolean(lit) && !isLit
                return (
                  <line
                    key={`${edge.a}-${edge.b}-${edge.kind}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={edge.accent || isLit ? 'var(--color-accent)' : '#f4f6f7'}
                    strokeOpacity={dim ? 0.05 : isLit ? 0.8 : edge.accent ? 0.5 : 0.13}
                    strokeWidth={isLit ? 1.5 : edge.accent ? 1.2 : 0.8}
                    className="transition-[stroke-opacity,stroke-width] duration-200"
                  />
                )
              })}
            </g>

            {nodes.map((node) => {
              const dim = Boolean(lit) && !lit?.has(node.id)
              const isSelected = selected === node.id
              const color = KIND_COLOR[node.kind] ?? '#8a9299'
              const showLabel = node.labelled || isSelected || hovered === node.id

              return (
                <g
                  key={node.id}
                  data-node={node.id}
                  className="transition-opacity duration-200"
                  opacity={dim ? 0.22 : 1}
                >
                  {/* A real button, so Tab and Enter work without a
                      keydown handler pretending to be one. */}
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.label}. ${KIND_LABEL[node.kind] ?? node.kind}. ${node.degree} connections.`}
                    aria-pressed={isSelected}
                    className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-[var(--color-accent-bright)] [&:focus-visible>circle:first-child]:stroke-[3]"
                    onClick={() => setSelected(isSelected ? null : node.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setSelected(isSelected ? null : node.id)
                      }
                      if (event.key === 'Escape') setSelected(null)
                    }}
                    onPointerEnter={() => setHovered(node.id)}
                    onPointerLeave={() => setHovered(null)}
                    onFocus={() => setHovered(node.id)}
                    onBlur={() => setHovered(null)}
                  >
                    {/* Halo, drawn only when relevant, so the resting picture
                        stays calm. */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r + 7}
                      fill={color}
                      fillOpacity={isSelected ? 0.2 : hovered === node.id ? 0.12 : 0}
                      stroke="transparent"
                      className="transition-[fill-opacity] duration-200"
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r}
                      fill={color}
                      fillOpacity={node.kind === 'technology' ? 0.55 : 0.9}
                      stroke="var(--color-canvas)"
                      strokeWidth={1.5}
                    />
                  </g>

                  {showLabel ? (
                    <text
                      x={node.x}
                      y={node.y + node.r + 13}
                      textAnchor="middle"
                      className="pointer-events-none"
                      style={{
                        fill: dim ? '#8a9299' : '#f4f6f7',
                        fontSize: node.kind === 'project' || node.kind === 'person' ? 12 : 10.5,
                        paintOrder: 'stroke',
                        stroke: 'var(--color-canvas)',
                        strokeWidth: 3.5,
                        strokeLinejoin: 'round',
                      }}
                    >
                      {node.label.length > 24 ? `${node.label.slice(0, 23)}…` : node.label}
                    </text>
                  ) : null}
                </g>
              )
            })}
          </g>
        </svg>

        {/* --- Controls --- */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
          {[
            { label: 'Zoom in', sign: '+', action: () => changeZoom(ZOOM_STEP) },
            { label: 'Zoom out', sign: '−', action: () => changeZoom(1 / ZOOM_STEP) },
            { label: 'Reset the view', sign: '⤢', action: reset },
          ].map((control) => (
            <button
              key={control.label}
              type="button"
              onClick={control.action}
              aria-label={control.label}
              className="surface-2 flex size-9 items-center justify-center rounded-full border border-hairline text-ink-2 transition-colors duration-[var(--duration-micro)] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              <span aria-hidden="true" className="text-[0.9375rem] leading-none">
                {control.sign}
              </span>
            </button>
          ))}
        </div>

        {/* --- Selection panel --- */}
        {selectedNode ? (
          <div className="surface-4 absolute left-3 top-3 max-w-[17rem] rounded-[var(--radius-md)] border border-hairline-strong p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span
                className="font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
                style={{ color: KIND_COLOR[selectedNode.kind] }}
              >
                {KIND_LABEL[selectedNode.kind] ?? selectedNode.kind}
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-ink-3 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <p className="mt-1.5 text-[1rem] font-medium leading-snug text-ink">
              {selectedNode.href ? (
                <Link
                  href={selectedNode.href}
                  className="underline decoration-hairline-strong underline-offset-2 hover:decoration-current"
                >
                  {selectedNode.label}
                </Link>
              ) : (
                selectedNode.label
              )}
            </p>

            {selectedNode.detail ? (
              <p className="mt-1 text-[0.8125rem] text-ink-3">{selectedNode.detail}</p>
            ) : null}

            <ul className="mt-3 flex flex-col gap-1 border-t border-hairline pt-3 text-[0.8125rem]">
              {selectedNeighbours.slice(0, 8).map((row) => (
                <li key={`${row.kind}-${row.node.id}`} className="flex items-baseline gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1.5 shrink-0 rounded-full"
                    style={{ background: KIND_COLOR[row.node.kind] }}
                  />
                  <button
                    type="button"
                    onClick={() => setSelected(row.node.id)}
                    className="text-left text-ink-2 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                  >
                    {row.node.label}
                  </button>
                </li>
              ))}
              {selectedNeighbours.length > 8 ? (
                <li className="text-ink-3">+{selectedNeighbours.length - 8} more</li>
              ) : null}
            </ul>
          </div>
        ) : null}

        {/* Announced rather than only drawn. */}
        <p aria-live="polite" className="sr-only">
          {selectedNode
            ? `${selectedNode.label} selected. ${selectedNeighbours.length} connections.`
            : 'No node selected.'}
        </p>
      </div>

      {/* --- Legend --- */}
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {Object.entries(KIND_LABEL).map(([kind, label]) => (
          <li key={kind} className="flex items-center gap-2 text-[0.75rem] text-ink-3">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ background: KIND_COLOR[kind] }}
            />
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}
