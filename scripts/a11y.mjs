import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const BASE = process.env.BASE ?? 'http://localhost:3000'

/* Project routes are DISCOVERED from the sitemap rather than listed here.

   This list used to name '/work/crm' and nothing else, which meant every
   project added after it shipped untested — and the supporting-tier pages are
   exactly where an untested regression would land, because they render a
   different set of sections from the flagships. A hardcoded list of routes on
   a site that grows is a check that quietly stops checking.

   Falls back to the flagship route if the sitemap cannot be read, so a
   sitemap change can never silently reduce this to zero coverage. */
async function projectRoutes() {
  try {
    const xml = await (await fetch(`${BASE}/sitemap.xml`)).text()
    const found = [...xml.matchAll(/<loc>([^<]*\/work\/[^<]+)<\/loc>/g)].map((m) =>
      new URL(m[1]).pathname,
    )
    if (found.length > 0) return [...new Set(found)]
  } catch {
    /* fall through */
  }
  return ['/work/crm']
}

const ROUTES = [
  '/',
  '/work',
  '/thinking',
  '/cv',
  '/about',
  '/contact',
  '/lab',
  ...(await projectRoutes()),
  '/nope',
]

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })

let totalViolations = 0
let totalBroken = 0

/* Routes that are SUPPOSED to 404. Everything else must actually resolve.

   This assertion exists because of a real miss: three new project pages
   returned 404 while this script printed "clean" for all of them. It was not
   lying — a 404 page IS accessible — but "axe found nothing" had been quietly
   standing in for "the page works", and those are different claims. A check
   that passes on a broken page is worse than no check, because it is trusted.

   So each route now asserts three things: the HTTP status is what it should
   be, the page is not the not-found template in disguise, and there is exactly
   one h1. Then axe runs on top of that. */
const EXPECT_404 = new Set(['/nope'])

for (const route of ROUTES) {
  const page = await ctx.newPage()
  const response = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })

  const status = response?.status() ?? 0
  const wantsError = EXPECT_404.has(route)
  const h1s = await page.$$eval('h1', (els) => els.map((e) => e.textContent?.trim() ?? ''))

  const problems = []
  if (wantsError) {
    if (status !== 404) problems.push(`expected 404, got ${status}`)
  } else {
    if (status !== 200) problems.push(`expected 200, got ${status}`)
    if (h1s.some((h) => /doesn’t exist|does not exist|not found/i.test(h))) {
      problems.push('rendered the not-found page')
    }
    if (h1s.length !== 1) problems.push(`${h1s.length} h1 elements, expected 1`)
  }

  if (problems.length > 0) {
    totalBroken += 1
    console.log(`${route.padEnd(28)} BROKEN — ${problems.join('; ')}`)
    await page.close()
    continue
  }
  // Reveal everything so axe sees real content, not opacity-0 elements.
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += 800) { await page.evaluate(y => window.scrollTo(0,y), y); await page.waitForTimeout(60) }
  await page.waitForTimeout(800)

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  const v = results.violations
  totalViolations += v.length
  console.log(`${route.padEnd(28)} ${v.length === 0 ? 'clean' : `${v.length} violation(s)`}`)
  for (const item of v) {
    console.log(`   [${item.impact}] ${item.id}: ${item.help}`)
    for (const node of item.nodes.slice(0, 2)) {
      console.log(`      ${node.html.slice(0, 120)}`)
    }
  }
  await page.close()
}

// ---- Keyboard: command palette full operation ----
{
  const page = await ctx.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.keyboard.press('Control+k')
  // The palette is a lazy chunk; wait for it to mount rather than guessing.
  /* Generous: the palette is a lazy chunk and this is the first interaction in
     a cold context. A tight timeout here produced a "broken palette" report
     that was really a slow first fetch — measured at 380ms once warm. */
  await page.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 20_000 })
  const dialogVisible = await page.locator('[role="dialog"]').isVisible()
  await page.waitForTimeout(200)
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
  await page.keyboard.type('think')
  await page.waitForTimeout(300)
  await page.keyboard.press('ArrowDown')
  const activeDesc = await page.evaluate(() =>
    document.querySelector('[role="combobox"]')?.getAttribute('aria-activedescendant'))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  const closed = (await page.locator('[role="dialog"]').count()) === 0
  console.log(`\nPalette keyboard: open=${dialogVisible} focus=${focusedTag} activedescendant=${Boolean(activeDesc)} escape-closes=${closed}`)

  // Enter navigates
  await page.keyboard.press('Control+k')
  await page.waitForTimeout(600)
  await page.keyboard.type('thinking')
  await page.waitForTimeout(300)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(1200)
  console.log(`Palette Enter navigated to: ${new URL(page.url()).pathname}`)
  await page.close()
}

// ---- Keyboard: tablists ----
// Scoped per tablist by accessible name. The homepage has TWO of them now
// (Process and the Lab's act rail), so an unscoped [role="tab"] selector
// matches both and fails Playwright's strict mode.
for (const name of ['Project stages', 'Instruments']) {
  const page = await ctx.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  const list = page.getByRole('tablist', { name })
  await list.getByRole('tab').first().focus()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(200)
  const selected = await list.locator('[role="tab"][aria-selected="true"]').textContent()
  console.log(`${name} tablist ArrowRight -> ${selected?.trim()}`)
  await page.close()
}

// ---- Keyboard: skip link ----
{
  const page = await ctx.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.keyboard.press('Tab')
  const first = await page.evaluate(() => document.activeElement?.textContent?.trim())
  console.log(`First Tab stop: "${first}"`)
  await page.close()
}

await browser.close()
console.log(
  `\n${totalBroken === 0 ? `✓ routes: all ${ROUTES.length} resolved as expected` : `✗ routes: ${totalBroken} broken`}`,
)
console.log(
  `${totalViolations === 0 ? '✓ axe: no WCAG A/AA violations across all routes' : `✗ axe: ${totalViolations} total violations`}`,
)
process.exit(totalViolations === 0 && totalBroken === 0 ? 0 : 1)
