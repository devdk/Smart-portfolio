import { projects, decisions, incidents, hasProjectPage } from '@/lib/content'
import { site } from '@/lib/site.config'

/* ==========================================================================
   THE KNOWLEDGE GRAPH

   Every project, client, employer, technology, decision and incident on the
   site, as nodes and typed edges. Answers the questions keyword search
   structurally cannot — the ones that need a CHAIN of facts:

     "which clients did he work with at Mirasphere?"
        organisation ← BUILT_AT ← project → FOR_CLIENT → client

     "what has he built with Liquid?"
        technology ← USES ← project

     "has any client hired him twice?"
        client with more than one incoming FOR_CLIENT edge

   ── WHY THIS IS BUILT AT MODULE LOAD AND NOT GENERATED TO A FILE ──────────

   content/lab-data.ts and content/ask-corpus.ts are generated artefacts, and
   they carry the standing cost of every generated artefact: they go stale
   silently when their inputs change, which is why `npm run build:lab` has to
   be remembered after every content edit.

   This graph is a pure function of already-validated data. Building it on
   import removes staleness as a category of bug — there is no second copy to
   drift. It costs a few milliseconds over eleven projects, once, at build
   time. Generating it to disk would buy nothing and reintroduce the one
   failure mode worth designing out.

   ── WHY EVERY EDGE CARRIES PROVENANCE ────────────────────────────────────

   A graph is persuasive in a way prose is not: an arrow between two names
   looks like a fact even when it is a guess. On a page that names real
   clients — Fordham Finance Group, Swann, RECC — that is a dangerous
   property.

   So every edge is labelled:

     declared   read straight out of a typed field. `project.employer` says
                Mirasphere Digital, so the edge exists.

     computed   derived by counting or joining declared edges. "This client
                appears on two projects" is arithmetic over declared facts,
                not an opinion about them.

   There is deliberately NO third value for "inferred from prose". Nothing
   here is produced by matching strings against paragraphs, because an edge
   built that way would be indistinguishable, once drawn, from one that was
   actually stated. That is the same reason lib/schema.ts has no 'estimate'
   metric source.
   ========================================================================== */

export type NodeKind =
  | 'person'
  | 'project'
  | 'client'
  | 'organisation'
  | 'industry'
  | 'technology'
  | 'decision'
  | 'incident'

export type GraphNode = {
  /** `kind:slug`, stable across builds. */
  id: string
  kind: NodeKind
  label: string
  /** Where a visitor can read this for themselves. Absent when there is no
      page — an unreadable citation is worse than none. */
  href?: string
  /** Declared attributes only. Never a computed summary. */
  attrs: Record<string, string | number>
}

export type EdgeKind =
  | 'BUILT'
  | 'FOR_CLIENT'
  | 'BUILT_AT'
  | 'IN_INDUSTRY'
  | 'USES'
  | 'DECIDED_IN'
  | 'HAPPENED_IN'
  | 'RETURNED'

export type Provenance = 'declared' | 'computed'

export type GraphEdge = {
  from: string
  to: string
  kind: EdgeKind
  provenance: Provenance
  /** Shown on the edge when it helps. */
  label?: string
}

/* --------------------------------------------------------------------------
   Construction
   -------------------------------------------------------------------------- */

const nodes = new Map<string, GraphNode>()
const edges: GraphEdge[] = []

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function addNode(node: GraphNode): string {
  const existing = nodes.get(node.id)
  if (existing) {
    /* Merge attributes rather than overwrite. A technology met on its fourth
       project should not lose what the first three recorded. */
    Object.assign(existing.attrs, node.attrs)
    return node.id
  }
  nodes.set(node.id, node)
  return node.id
}

function addEdge(edge: GraphEdge): void {
  /* Both endpoints must exist. A dangling edge renders as an arrow to nowhere
     and is the graph equivalent of a broken link. */
  if (!nodes.has(edge.from) || !nodes.has(edge.to)) return
  const duplicate = edges.some(
    (e) => e.from === edge.from && e.to === edge.to && e.kind === edge.kind,
  )
  if (!duplicate) edges.push(edge)
}

/* --- The person ----------------------------------------------------------- */
const PERSON = addNode({
  id: 'person:dheeraj',
  kind: 'person',
  label: site.name,
  href: '/about',
  attrs: { role: site.role, location: site.location },
})

/* --- Projects, and everything hanging off them ---------------------------- */
for (const project of projects) {
  const projectId = addNode({
    id: `project:${project.slug}`,
    kind: 'project',
    label: project.title,
    ...(hasProjectPage(project) ? { href: `/work/${project.slug}` } : {}),
    attrs: {
      year: project.year,
      status: project.status,
      tier: project.tier,
      category: project.category,
      ...(project.url ? { url: project.url } : {}),
      ...(project.duration ? { duration: project.duration } : {}),
    },
  })

  addEdge({ from: PERSON, to: projectId, kind: 'BUILT', provenance: 'declared' })

  /* Only NAMED clients become nodes. A project with `clientDescriptor` was
     deliberately anonymised, and inventing a node called "an undisclosed
     client" would either merge unrelated clients into one entity or imply a
     name the site does not have permission to state. */
  if (project.client) {
    const clientId = addNode({
      id: `client:${slugify(project.client)}`,
      kind: 'client',
      label: project.client,
      attrs: {},
    })
    addEdge({
      from: projectId,
      to: clientId,
      kind: 'FOR_CLIENT',
      provenance: 'declared',
    })

    if (project.clientIndustry) {
      const industryId = addNode({
        id: `industry:${slugify(project.clientIndustry)}`,
        kind: 'industry',
        label: project.clientIndustry,
        attrs: {},
      })
      addEdge({
        from: clientId,
        to: industryId,
        kind: 'IN_INDUSTRY',
        provenance: 'declared',
      })
    }
  }

  if (project.employer) {
    const orgId = addNode({
      id: `organisation:${slugify(project.employer)}`,
      kind: 'organisation',
      label: project.employer,
      attrs: {},
    })
    addEdge({ from: projectId, to: orgId, kind: 'BUILT_AT', provenance: 'declared' })
  }

  for (const item of project.stack) {
    const techId = addNode({
      id: `technology:${slugify(item.name)}`,
      kind: 'technology',
      label: item.name,
      href: `/work?tech=${encodeURIComponent(item.name)}`,
      attrs: { category: item.category },
    })
    addEdge({ from: projectId, to: techId, kind: 'USES', provenance: 'declared' })
  }
}

/* --- Decisions and incidents --------------------------------------------- */
for (const decision of decisions) {
  const id = addNode({
    id: `decision:${decision.id}`,
    kind: 'decision',
    label: decision.question,
    href: `/thinking#${decision.id}`,
    attrs: { chose: decision.chose, wouldRepeat: decision.wouldRepeat },
  })
  for (const slug of decision.projects) {
    addEdge({
      from: id,
      to: `project:${slug}`,
      kind: 'DECIDED_IN',
      provenance: 'declared',
    })
  }
}

for (const incident of incidents) {
  const id = addNode({
    id: `incident:${incident.id}`,
    kind: 'incident',
    label: incident.title,
    href: `/thinking#${incident.id}`,
    attrs: { lesson: incident.lesson },
  })
  for (const slug of incident.projects) {
    addEdge({
      from: id,
      to: `project:${slug}`,
      kind: 'HAPPENED_IN',
      provenance: 'declared',
    })
  }
}

/* --- The one computed edge ------------------------------------------------
   A client with more than one project came back. That is arithmetic over
   declared FOR_CLIENT edges, and it is the single most persuasive fact a
   portfolio can carry — a client who returns has voted with their budget.
   It is also invisible in prose: the two projects live on different pages
   and nothing on either says "this is the same client as that one".
   -------------------------------------------------------------------------- */
for (const node of nodes.values()) {
  if (node.kind !== 'client') continue
  const theirProjects = edges.filter((e) => e.kind === 'FOR_CLIENT' && e.to === node.id)
  if (theirProjects.length > 1) {
    addEdge({
      from: node.id,
      to: PERSON,
      kind: 'RETURNED',
      provenance: 'computed',
      label: `${theirProjects.length} projects`,
    })
  }
}

export const GRAPH_NODES: readonly GraphNode[] = [...nodes.values()]
export const GRAPH_EDGES: readonly GraphEdge[] = edges

export const GRAPH_STATS = {
  nodes: GRAPH_NODES.length,
  edges: GRAPH_EDGES.length,
  declared: GRAPH_EDGES.filter((e) => e.provenance === 'declared').length,
  computed: GRAPH_EDGES.filter((e) => e.provenance === 'computed').length,
  byKind: Object.fromEntries(
    (['person', 'project', 'client', 'organisation', 'industry', 'technology', 'decision', 'incident'] as NodeKind[]).map(
      (kind) => [kind, GRAPH_NODES.filter((n) => n.kind === kind).length],
    ),
  ) as Record<NodeKind, number>,
} as const

/* ==========================================================================
   QUERIES

   Each returns real nodes, so a caller can render a citation rather than a
   claim. An empty result is a real answer and must not be dressed up as
   anything else — "nothing matched" is information.
   ========================================================================== */

export function node(id: string): GraphNode | undefined {
  return nodes.get(id)
}

export function nodesOfKind(kind: NodeKind): GraphNode[] {
  return GRAPH_NODES.filter((n) => n.kind === kind)
}

/** Everything one step from a node, in both directions. */
export function neighbours(id: string): { edge: GraphEdge; node: GraphNode }[] {
  const out: { edge: GraphEdge; node: GraphNode }[] = []
  for (const edge of GRAPH_EDGES) {
    if (edge.from === id) {
      const target = nodes.get(edge.to)
      if (target) out.push({ edge, node: target })
    } else if (edge.to === id) {
      const source = nodes.get(edge.from)
      if (source) out.push({ edge, node: source })
    }
  }
  return out
}

/** Case-insensitive, so "postgres" finds "PostgreSQL" via the slug. */
function findByLabel(kind: NodeKind, needle: string): GraphNode | undefined {
  const target = slugify(needle)
  return (
    nodesOfKind(kind).find((n) => n.id === `${kind}:${target}`) ??
    nodesOfKind(kind).find((n) => slugify(n.label).includes(target))
  )
}

export function projectsUsing(technology: string): GraphNode[] {
  const tech = findByLabel('technology', technology)
  if (!tech) return []
  return GRAPH_EDGES.filter((e) => e.kind === 'USES' && e.to === tech.id)
    .map((e) => nodes.get(e.from))
    .filter((n): n is GraphNode => n?.kind === 'project')
}

export function clientsOf(organisation: string): GraphNode[] {
  const org = findByLabel('organisation', organisation)
  if (!org) return []
  const theirProjects = GRAPH_EDGES.filter((e) => e.kind === 'BUILT_AT' && e.to === org.id).map(
    (e) => e.from,
  )
  const clientIds = new Set(
    GRAPH_EDGES.filter((e) => e.kind === 'FOR_CLIENT' && theirProjects.includes(e.from)).map(
      (e) => e.to,
    ),
  )
  return [...clientIds].map((id) => nodes.get(id)).filter((n): n is GraphNode => Boolean(n))
}

export function projectsForIndustry(industry: string): GraphNode[] {
  const target = findByLabel('industry', industry)
  if (!target) return []
  const clientIds = GRAPH_EDGES.filter((e) => e.kind === 'IN_INDUSTRY' && e.to === target.id).map(
    (e) => e.from,
  )
  return GRAPH_EDGES.filter((e) => e.kind === 'FOR_CLIENT' && clientIds.includes(e.to))
    .map((e) => nodes.get(e.from))
    .filter((n): n is GraphNode => n?.kind === 'project')
}

/** Clients who came back. The computed edge, read back. */
export function repeatClients(): { client: GraphNode; projects: GraphNode[] }[] {
  return GRAPH_EDGES.filter((e) => e.kind === 'RETURNED')
    .map((e) => {
      const client = nodes.get(e.from)
      if (!client) return undefined
      const theirProjects = GRAPH_EDGES.filter(
        (edge) => edge.kind === 'FOR_CLIENT' && edge.to === client.id,
      )
        .map((edge) => nodes.get(edge.from))
        .filter((n): n is GraphNode => Boolean(n))
      return { client, projects: theirProjects }
    })
    .filter((r): r is { client: GraphNode; projects: GraphNode[] } => Boolean(r))
}

export function projectsWithAttr(key: string, value: string): GraphNode[] {
  return nodesOfKind('project').filter((n) => String(n.attrs[key] ?? '') === value)
}

/** Projects that have a written-up failure attached. Answers "has he broken
    anything", with the actual incidents rather than a yes. */
export function projectsWithIncidents(): { project: GraphNode; incidents: GraphNode[] }[] {
  return nodesOfKind('project')
    .map((project) => ({
      project,
      incidents: GRAPH_EDGES.filter((e) => e.kind === 'HAPPENED_IN' && e.to === project.id)
        .map((e) => nodes.get(e.from))
        .filter((n): n is GraphNode => Boolean(n)),
    }))
    .filter((row) => row.incidents.length > 0)
}

/** The technologies used on the most projects. Answers "what does he actually
    reach for", which a stack list on one page cannot. */
export function technologyReach(): { technology: GraphNode; count: number }[] {
  return nodesOfKind('technology')
    .map((technology) => ({
      technology,
      count: GRAPH_EDGES.filter((e) => e.kind === 'USES' && e.to === technology.id).length,
    }))
    .sort((a, b) => b.count - a.count || a.technology.label.localeCompare(b.technology.label))
}
