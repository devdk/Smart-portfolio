/* ==========================================================================
   GRAPH REPORT AND GATE

     npm run check:graph

   Prints what the knowledge graph contains, then answers the relational
   questions from scripts/ask-gaps.ts — the ones keyword search was answering
   with coincidental word matches — and shows the exact nodes behind each
   answer so they can be checked.

   It is also a GATE. Three things fail the build:

     1. A dangling edge. An arrow to a node that does not exist renders as a
        line to nowhere.
     2. An orphan project. A project with no client, no employer and no
        technology is not in the graph in any useful sense, which means the
        content is missing typed fields.
     3. A known-answer query returning nothing. If "which projects use
        PostgreSQL" ever returns empty, something upstream broke silently.

   The last section is the honest one: relational questions the graph CANNOT
   answer, and the typed field each would need. A graph's most useful output
   is often the shape of its own gaps.
   ========================================================================== */

import {
  GRAPH_EDGES,
  GRAPH_NODES,
  GRAPH_STATS,
  clientsOf,
  neighbours,
  node,
  nodesOfKind,
  projectsForIndustry,
  projectsUsing,
  projectsWithAttr,
  projectsWithIncidents,
  repeatClients,
  technologyReach,
} from '../lib/graph'

const G = '[32m'
const R = '[31m'
const Y = '[33m'
const D = '[2m'
const X = '[0m'

let failures = 0
function fail(message: string): void {
  failures += 1
  console.log(`${R}✗${X} ${message}`)
}

console.log(`\n${GRAPH_STATS.nodes} nodes, ${GRAPH_STATS.edges} edges`)
console.log(
  `${D}${GRAPH_STATS.declared} declared (read from a typed field), ` +
    `${GRAPH_STATS.computed} computed (arithmetic over declared edges), 0 inferred from prose${X}\n`,
)

for (const [kind, count] of Object.entries(GRAPH_STATS.byKind)) {
  if (count > 0) console.log(`  ${String(count).padStart(3)} ${kind}`)
}

/* --- Integrity ----------------------------------------------------------- */
console.log(`\n${D}── integrity ────────────────────────────────────────────${X}`)

const ids = new Set(GRAPH_NODES.map((n) => n.id))
const dangling = GRAPH_EDGES.filter((e) => !ids.has(e.from) || !ids.has(e.to))
if (dangling.length > 0) {
  fail(`${dangling.length} dangling edge(s): ${dangling.slice(0, 3).map((e) => `${e.from}→${e.to}`).join(', ')}`)
} else {
  console.log(`${G}✓${X} no dangling edges`)
}

const orphans = nodesOfKind('project').filter((p) => neighbours(p.id).length <= 1)
if (orphans.length > 0) {
  fail(`orphan project(s) with nothing but a BUILT edge: ${orphans.map((p) => p.id).join(', ')}`)
} else {
  console.log(`${G}✓${X} every project connects to a client, employer or technology`)
}

/* --- The relational questions -------------------------------------------- */
console.log(`\n${D}── the questions keyword search could not answer ────────${X}\n`)

function show(question: string, results: { label: string; href?: string }[]): void {
  const mark = results.length > 0 ? `${G}✓${X}` : `${Y}—${X}`
  console.log(`${mark} ${question}`)
  if (results.length === 0) {
    console.log(`    ${D}no answer in the graph${X}`)
    return
  }
  for (const result of results) {
    console.log(`    · ${result.label}${result.href ? ` ${D}${result.href}${X}` : ''}`)
  }
  console.log()
}

const mirasphereClients = clientsOf('Mirasphere Digital')
show('which clients has he worked with at Mirasphere?', mirasphereClients)
if (mirasphereClients.length === 0) fail('clientsOf("Mirasphere Digital") returned nothing')

const liquid = projectsUsing('Liquid')
show('what has he built with Liquid?', liquid)
if (liquid.length === 0) fail('projectsUsing("Liquid") returned nothing')

const postgres = projectsUsing('PostgreSQL')
show('which projects used PostgreSQL?', postgres)
if (postgres.length === 0) fail('projectsUsing("PostgreSQL") returned nothing')

const returning = repeatClients()
show(
  'has any client hired him twice?',
  returning.map((r) => ({
    label: `${r.client.label} — ${r.projects.length} projects: ${r.projects.map((p) => p.label).join(', ')}`,
  })),
)

const accountancy = projectsForIndustry('accountancy')
show('what has he built for accounting firms?', accountancy)
if (accountancy.length === 0) fail('projectsForIndustry("accountancy") returned nothing')

show('which of his projects are live?', projectsWithAttr('status', 'live'))

show(
  'has he ever broken production?',
  projectsWithIncidents().flatMap((row) =>
    row.incidents.map((incident) => ({
      label: `${incident.label} ${D}(${row.project.label})${X}`,
      href: incident.href,
    })),
  ),
)

const reach = technologyReach().filter((r) => r.count > 1)
show(
  'what does he actually reach for, across projects?',
  reach.map((r) => ({ label: `${r.technology.label} — ${r.count} projects` })),
)

/* --- One two-hop traversal, to prove it is a graph and not a lookup ------ */
const swann = GRAPH_NODES.find((n) => n.kind === 'client' && n.label.startsWith('Swann'))
if (swann) {
  console.log(`${D}── two hops from ${swann.label} ─────────────────────────${X}`)
  for (const hop of neighbours(swann.id)) {
    console.log(`    ${hop.edge.kind.padEnd(12)} ${hop.node.label} ${D}(${hop.edge.provenance})${X}`)
    if (hop.node.kind === 'project') {
      for (const second of neighbours(hop.node.id)) {
        if (second.node.id === swann.id) continue
        console.log(`      ${D}${second.edge.kind.padEnd(10)} ${second.node.label}${X}`)
      }
    }
  }
  console.log()
}

/* --- What the graph cannot answer, and why ------------------------------- */
console.log(`${D}── what the graph cannot answer yet ─────────────────────${X}\n`)

const CANNOT: { question: string; needs: string }[] = [
  {
    question: 'which projects had performance problems?',
    needs:
      'The Zyvren LCP story is prose in `approach`. It would need either a typed `vitals` entry or a typed problem tag.',
  },
  {
    question: 'what is the biggest thing he has built?',
    needs:
      'No size is declared. `tier` is a proxy for importance, not scale — 197 endpoints and 55 models are prose in the CRM write-up.',
  },
  {
    question: 'which clients are in the UK?',
    needs: 'Client location is never typed. `clientIndustry` exists; a `clientRegion` does not.',
  },
  {
    question: 'what did he do on each project — build, SEO, consult?',
    needs:
      '`role` is a free-text sentence, so it cannot be grouped. A typed `contributions` list would make it queryable.',
  },
]

for (const gap of CANNOT) {
  console.log(`${Y}—${X} ${gap.question}`)
  console.log(`    ${D}${gap.needs}${X}\n`)
}

console.log('─'.repeat(72))
if (failures === 0) {
  console.log(`${G}✓ check:graph — graph is connected and every known query resolves${X}\n`)
  process.exit(0)
}
console.log(`${R}✗ check:graph — ${failures} problem(s)${X}\n`)
process.exit(1)
