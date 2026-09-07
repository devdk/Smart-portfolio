import { GRAPH_EDGES, GRAPH_NODES, type GraphNode, type NodeKind } from '@/lib/graph'

/* ==========================================================================
   GRAPH LAYOUT

   A force-directed layout, solved ONCE at build time, exported as fixed
   coordinates.

   ── WHY THE SIMULATION RUNS AT BUILD AND NOT IN THE BROWSER ───────────────

   Every force-directed graph on the web has the same flaw: it arrives as a
   pile in the middle of the screen and spends two seconds untangling itself
   while you wait. You cannot read it, screenshot it, or link someone to "the
   bit on the left", because there is no stable left.

   Running the solver here fixes all of that at once:

     - first paint is the finished layout. Nothing settles.
     - the picture is identical on every visit and every device, so it can be
       screenshotted, described and pointed at
     - the browser gets coordinates, not a physics loop, so panning and zooming
       stay smooth on a phone and cost no battery

   The interaction — pan, zoom, select, hover — is still live. What is not live
   is the part that only ever produced a delay.

   ── WHY IT IS DETERMINISTIC ───────────────────────────────────────────────

   No Math.random anywhere. Seed positions come off a golden-angle spiral,
   which spreads points evenly with no clumping and no randomness, so two
   builds of the same content produce byte-identical coordinates. A random
   seed would make every rebuild look like a content change in the diff — the
   same reason scripts/build-lab-data.ts seeds its power iteration by hand.

   ── THE FORCES, AND WHY THESE ─────────────────────────────────────────────

   1. REPULSION between every pair, so labels do not overlap. With 72 nodes
      the all-pairs cost is ~2,500 comparisons per tick — trivial, and it
      avoids the approximation error a Barnes-Hut tree would introduce for no
      benefit at this size.

   2. SPRINGS along edges, with a rest length that varies BY EDGE KIND. This
      is what makes the picture readable rather than uniform: a technology sits
      close to the projects that use it, while a client sits further out so its
      name has room. A single spring length for everything produces a hairball.

   3. GRAVITY toward the centre, weighted by degree. Well-connected nodes drift
      inward and become hubs; leaves fall to the rim. That is the shape that
      makes a graph legible at a glance — it puts the important things where
      the eye lands first.
   ========================================================================== */

export type LaidOutNode = GraphNode & {
  x: number
  y: number
  /** Edge count. Drives radius, so importance is visible without a legend. */
  degree: number
}

const WIDTH = 1000
const HEIGHT = 700
const ITERATIONS = 620

/** Kinds that carry a permanent text label, and therefore need room for it. */
const LABELLED = new Set<NodeKind>(['person', 'project', 'organisation'])

/** Rest length per edge kind. Shorter means "belongs with". */
const SPRING: Record<string, number> = {
  USES: 58,
  FOR_CLIENT: 104,
  BUILT_AT: 120,
  IN_INDUSTRY: 70,
  DECIDED_IN: 76,
  HAPPENED_IN: 68,
  BUILT: 230,
  RETURNED: 150,
}

/** How strongly a node resists being moved. The person node is the anchor. */
const MASS: Record<NodeKind, number> = {
  person: 14,
  project: 3.4,
  client: 2.2,
  organisation: 5,
  industry: 1.6,
  technology: 1,
  decision: 1,
  incident: 1,
}

function solve(): LaidOutNode[] {
  const nodes = GRAPH_NODES.map((node, i) => {
    /* Golden-angle spiral: even coverage, deterministic, no clumps. */
    const angle = i * 2.399963229728653
    const radius = 26 * Math.sqrt(i + 1)
    return {
      ...node,
      x: WIDTH / 2 + Math.cos(angle) * radius,
      y: HEIGHT / 2 + Math.sin(angle) * radius * 0.7,
      vx: 0,
      vy: 0,
      degree: GRAPH_EDGES.filter((e) => e.from === node.id || e.to === node.id).length,
    }
  })

  const index = new Map(nodes.map((n, i) => [n.id, i]))
  const links = GRAPH_EDGES.map((edge) => ({
    a: index.get(edge.from),
    b: index.get(edge.to),
    rest: SPRING[edge.kind] ?? 90,
  })).filter((l): l is { a: number; b: number; rest: number } => l.a !== undefined && l.b !== undefined)

  for (let step = 0; step < ITERATIONS; step += 1) {
    /* Cooling schedule. Large moves early to escape the spiral, small moves
       late so the final frames only polish. */
    const alpha = 0.9 * (1 - step / ITERATIONS) ** 1.6 + 0.012

    // 1. Repulsion
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i]!
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j]!
        let dx = b.x - a.x
        let dy = b.y - a.y
        let distSq = dx * dx + dy * dy
        if (distSq < 0.01) {
          /* Exactly coincident points have no direction to separate along.
             Nudge deterministically by index rather than randomly. */
          dx = (i % 3) - 1 || 0.5
          dy = (j % 3) - 1 || 0.5
          distSq = dx * dx + dy * dy
        }
        const dist = Math.sqrt(distSq)

        // Labelled nodes repel each other far harder than unlabelled ones.
        // This is not aesthetic tuning — it is the fix for the real failure of
        // the first solve, where seven project names overlapped into an
        // unreadable stack on the left. Repulsion between DOTS only has to keep
        // circles apart; repulsion between LABELLED dots has to keep roughly
        // 140px of text apart, so it needs a different constant.
        const bothLabelled = LABELLED.has(a.kind) && LABELLED.has(b.kind)
        const strength = bothLabelled ? 27000 : 2400
        const force = (strength * alpha) / distSq
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        const massA = MASS[a.kind]
        const massB = MASS[b.kind]
        a.vx -= fx / massA
        a.vy -= fy / massA
        b.vx += fx / massB
        b.vy += fy / massB
      }
    }

    // 2. Springs
    for (const link of links) {
      const a = nodes[link.a]!
      const b = nodes[link.b]!
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
      const force = (dist - link.rest) * 0.06 * alpha
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      a.vx += fx / MASS[a.kind]
      a.vy += fy / MASS[a.kind]
      b.vx -= fx / MASS[b.kind]
      b.vy -= fy / MASS[b.kind]
    }

    // 3. Gravity, stronger on well-connected nodes
    for (const node of nodes) {
      const pull = 0.0022 * alpha * (1 + node.degree * 0.16)
      node.vx += (WIDTH / 2 - node.x) * pull
      node.vy += (HEIGHT / 2 - node.y) * pull
    }

    // Integrate, with damping
    for (const node of nodes) {
      node.x += node.vx
      node.y += node.vy
      node.vx *= 0.82
      node.vy *= 0.82
    }
  }

  /* Normalise into the viewBox with a margin, so the picture always fills the
     frame regardless of how the solve happened to spread out. */
  const xs = nodes.map((n) => n.x)
  const ys = nodes.map((n) => n.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const margin = 62
  const scaleX = (WIDTH - margin * 2) / Math.max(1, maxX - minX)
  const scaleY = (HEIGHT - margin * 2) / Math.max(1, maxY - minY)
  const scale = Math.min(scaleX, scaleY)

  return nodes.map((node) => ({
    id: node.id,
    kind: node.kind,
    label: node.label,
    ...(node.href ? { href: node.href } : {}),
    attrs: node.attrs,
    degree: node.degree,
    /* Rounded to one decimal: enough precision for a 1000-unit viewBox, and it
       keeps the serialised payload small. */
    x: Math.round((margin + (node.x - minX) * scale) * 10) / 10,
    y: Math.round((margin + (node.y - minY) * scale) * 10) / 10,
  }))
}

export const LAYOUT: readonly LaidOutNode[] = solve()

export const LAYOUT_BY_ID: Record<string, LaidOutNode> = Object.fromEntries(
  LAYOUT.map((n) => [n.id, n]),
)

export const VIEWBOX = { width: WIDTH, height: HEIGHT } as const

/** Radius from degree. Hubs read as hubs before a word is read. */
export function radiusFor(node: LaidOutNode): number {
  if (node.kind === 'person') return 15
  return Math.min(12.5, 4.4 + Math.sqrt(node.degree) * 2.1)
}

/** Which nodes carry a permanent label. Everything else labels on hover or
    selection — 72 labels at once is the hairball this layout exists to
    avoid. */
export function isLabelled(node: LaidOutNode): boolean {
  // Must agree with the set the solver uses, or the layout reserves room for
  // labels it never draws.
  return LABELLED.has(node.kind)
}
