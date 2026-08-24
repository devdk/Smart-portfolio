/* ==========================================================================
   PERFORMANCE BUDGET GATE

   The plan makes performance a CI gate rather than an aspiration, because a
   portfolio that argues for performance and scores badly argues against
   itself.

   ── WHY THIS MEASURES "ABOVE FLOOR" RATHER THAN AN ABSOLUTE NUMBER ────────

   The plan originally set a 140 KB gzip budget for first-load JS. That number
   turned out to be impossible, and not because of anything in this codebase:
   a route with a bare layout and ZERO client components ships 178.3 KB gzip
   on Next 16.3 + React 19. That is the App Router client runtime, and it is a
   constant nobody building on this stack can opt out of.

   Measured on this project:
     178.3 KB   framework floor (empty layout, empty page, no client code)
     185.9 KB   full home page
       7.6 KB   ← everything this project actually wrote

   An absolute budget dominated by a constant is not a useful gate: it fails
   on day one and then gets ignored, which is worse than having no gate. So
   this measures the delta above the floor, which is the part the codebase
   controls and the part a regression would show up in.

   The floor is re-measured, not hardcoded from memory: it is taken from the
   smallest route in the build, which is always the one with the least client
   JS. If a future Next release changes the floor, the gate adapts.

   Lighthouse and Core Web Vitals assertions belong in a separate CI step
   against a preview deployment — they need a real browser on a real network,
   which this does not pretend to provide.

   Run after `next build`, with the production server running:
     npm run check:budget
   ========================================================================== */

import { readFileSync, existsSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

/** How much gzipped client JS this project's own code may add on top of the
    unavoidable framework runtime. Raise only with a measurement to justify it. */
const APP_CODE_BUDGET_KB = 25

const BASE = process.env.BASE ?? 'http://localhost:3000'

const ROUTES = [
  '/',
  '/work',
  '/thinking',
  '/cv',
  '/about',
  '/contact',
  '/lab',
  '/work/crm',
]

async function chunkBytesFor(route: string): Promise<number | null> {
  let html: string
  try {
    const response = await fetch(`${BASE}${route}`)
    if (!response.ok) return null
    html = await response.text()
  } catch {
    return null
  }

  const chunks = [...new Set(html.match(/\/_next\/static\/chunks\/[^"]+?\.js/g) ?? [])]
  let total = 0
  for (const chunk of chunks) {
    const path = `.next${chunk.replace('/_next', '')}`
    if (!existsSync(path) || !statSync(path).isFile()) continue
    total += gzipSync(readFileSync(path), { level: 6 }).length
  }
  return total
}

const kb = (bytes: number) => bytes / 1024

async function main(): Promise<void> {
const measured: { route: string; bytes: number }[] = []

for (const route of ROUTES) {
  const bytes = await chunkBytesFor(route)
  if (bytes === null) {
    console.error(
      `✗ check:budget — could not reach ${BASE}${route}.\n` +
        '  Run `npm run build && npm start` first, or set BASE.\n',
    )
    process.exit(1)
  }
  measured.push({ route, bytes })
}

/* The lightest route approximates the framework floor: it is the one with the
   least of our own client code on it. */
const floor = Math.min(...measured.map((m) => m.bytes))

console.log('\nFirst-load JS, gzipped')
console.log('─'.repeat(66))
console.log(`  ${'route'.padEnd(20)} ${'total'.padStart(10)} ${'app code'.padStart(10)}`)
console.log('─'.repeat(66))

let worstApp = 0
for (const { route, bytes } of measured.sort((a, b) => b.bytes - a.bytes)) {
  const app = kb(bytes - floor)
  worstApp = Math.max(worstApp, app)
  const flag = app > APP_CODE_BUDGET_KB ? '  ← OVER' : ''
  console.log(
    `  ${route.padEnd(20)} ${kb(bytes).toFixed(1).padStart(7)} KB ${app.toFixed(1).padStart(7)} KB${flag}`,
  )
}

console.log('─'.repeat(66))
console.log(`  framework floor (measured):  ${kb(floor).toFixed(1)} KB`)
console.log(`  worst app-code delta:        ${worstApp.toFixed(1)} KB / ${APP_CODE_BUDGET_KB} KB budget`)
console.log('')

if (worstApp > APP_CODE_BUDGET_KB) {
  console.error(
    `✗ check:budget — app code exceeds ${APP_CODE_BUDGET_KB} KB on at least one route.\n\n` +
      '  Options, in order of preference:\n' +
      '   1. Move a client component to the server (look for a stray "use client")\n' +
      '   2. Dynamic-import an interactive system that is below the fold\n' +
      '   3. Replace a library with platform APIs — this project dropped GSAP\n' +
      '      (43.5 KB gzip) for IntersectionObserver + CSS keyframes on exactly\n' +
      '      this reasoning\n' +
      '   4. Drop a dependency\n' +
      '  Raising the budget is the last resort, not the first.\n',
  )
  process.exit(1)
}

console.log(`✓ check:budget — app code within ${APP_CODE_BUDGET_KB} KB above the framework floor.\n`)
}

void main()
