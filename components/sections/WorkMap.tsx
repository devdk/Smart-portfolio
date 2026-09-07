import {
  GRAPH_EDGES,
  GRAPH_STATS,
  repeatClients,
  technologyReach,
} from '@/lib/graph'
import { LAYOUT, VIEWBOX, isLabelled, radiusFor } from '@/lib/graph-layout'
import { GraphMap, type MapEdge, type MapNode } from '@/components/interactive/GraphMap'
import { Meta } from '@/components/primitives'

/* ==========================================================================
   WORK MAP

   The server half of the map: reads the graph, slices out exactly the fields
   the picture needs, and hands them to the client island.

   This used to be its own route at /graph and a nav item. It is a VIEW of the
   work now — /work?view=map — because the graph answers the same question the
   listing answers ("what has he built") through a different lens, and a nav
   slot implies a different subject. The filters apply to both views, so "show
   me the Shopify work, as a map" is one shareable URL.
   ========================================================================== */

/* BUILT would draw eleven lines from one point to every project — a starburst
   carrying no information, since "he built it" is true of everything here. */
const DRAWN = new Set(['FOR_CLIENT', 'BUILT_AT', 'USES', 'IN_INDUSTRY', 'DECIDED_IN', 'HAPPENED_IN'])

export function WorkMap({ projects: matching }: { projects: string[] }) {
  const returning = repeatClients()
  const returningIds = new Set(returning.map((r) => r.client.id))
  const matchingIds = new Set(matching.map((slug) => `project:${slug}`))
  const filtered = matchingIds.size < GRAPH_STATS.byKind.project

  const nodes: MapNode[] = LAYOUT.filter((n) => n.kind !== 'person').map((n) => ({
    id: n.id,
    kind: n.kind,
    label: n.label,
    ...(n.href ? { href: n.href } : {}),
    x: n.x,
    y: n.y,
    r: radiusFor(n),
    labelled: isLabelled(n),
    degree: n.degree,
    ...(n.kind === 'project' && n.attrs.year
      ? { detail: `${n.attrs.year} · ${String(n.attrs.status ?? '')}` }
      : {}),
    ...(n.kind === 'technology' && n.attrs.category ? { detail: String(n.attrs.category) } : {}),
  }))

  const present = new Set(nodes.map((n) => n.id))
  const edges: MapEdge[] = GRAPH_EDGES.filter(
    (e) => DRAWN.has(e.kind) && present.has(e.from) && present.has(e.to),
  ).map((e) => ({
    a: e.from,
    b: e.to,
    kind: e.kind,
    accent: e.kind === 'FOR_CLIENT' && returningIds.has(e.to),
  }))

  const shared = technologyReach().filter((t) => t.count > 1)

  return (
    <div className="flex flex-col gap-8">
      <GraphMap nodes={nodes} edges={edges} width={VIEWBOX.width} height={VIEWBOX.height} />

      {/* The map is the content. These are the two facts it makes visible that
          no project page states, and nothing else. */}
      <div className="grid gap-8 md:grid-cols-3">
        {returning.map((row) => (
          <div key={row.client.id}>
            <Meta className="mb-2 block">Came back</Meta>
            <p className="text-[0.9375rem] leading-relaxed text-ink-2">
              <span className="text-ink">{row.client.label}</span> hired me for{' '}
              {row.projects.length} separate projects. Neither project page says they share a
              client — the map is the only place it shows.
            </p>
          </div>
        ))}

        <div>
          <Meta className="mb-2 block">Reached for most</Meta>
          <ul className="flex flex-col gap-1 text-[0.9375rem]">
            {shared.slice(0, 5).map(({ technology, count }) => (
              <li key={technology.id} className="flex items-baseline justify-between gap-3">
                <span className="text-ink-2">{technology.label}</span>
                <span className="font-mono text-[0.8125rem] tabular-nums text-ink-3">
                  {count} projects
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Meta className="mb-2 block">Provenance</Meta>
          <p className="font-mono text-[0.8125rem] leading-relaxed text-ink-3">
            {GRAPH_STATS.declared} edges read from a typed field
            <br />
            {GRAPH_STATS.computed} calculated from those
            <br />
            0 guessed from a paragraph
          </p>
          {filtered ? (
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-3">
              The map always shows the whole network. A filter narrows the list; narrowing a
              graph removes the connections that make it worth looking at.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
