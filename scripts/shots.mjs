import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const OUT = 'shots'
mkdirSync(OUT, { recursive: true })

const PAGES = [
  ['home', '/', { full: true }],
  ['home-hero', '/', { full: false }],
  ['work', '/work', { full: true }],
  ['case-study', '/work/crm', { full: true }],
  ['thinking', '/thinking', { full: true }],
  ['cv', '/cv', { full: true }],
  ['about', '/about', { full: true }],
  ['contact', '/contact', { full: false }],
  ['lab', '/lab', { full: false }],
  ['404', '/nope', { full: false }],
]

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })

// Desktop
const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
})

/* Scroll-reveal animations are driven by IntersectionObserver, so a
   fullPage screenshot taken without scrolling captures below-the-fold
   content still at opacity 0. That is correct behaviour, not a bug — but it
   makes for a useless screenshot, so scroll the page first and let the
   reveals fire. */
async function settle(page, full) {
  if (full) {
    const height = await page.evaluate(() => document.body.scrollHeight)
    for (let y = 0; y < height; y += 600) {
      await page.evaluate((y) => window.scrollTo(0, y), y)
      await page.waitForTimeout(90)
    }
    await page.evaluate(() => window.scrollTo(0, 0))
  }
  await page.waitForTimeout(1200)
}

for (const [name, path, opts] of PAGES) {
  const page = await desktop.newPage()
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await settle(page, opts.full)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: opts.full })
  await page.close()
}

// Command palette open
{
  const page = await desktop.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.keyboard.press('Control+k')
  await page.waitForTimeout(500)
  await page.keyboard.type('shop')
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/palette.png` })
  await page.close()
}

// Build With Me, mid-flow
{
  const page = await desktop.newPage()
  await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'E-commerce', exact: true }).click()
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: 'Speed', exact: true }).click()
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: 'An existing product', exact: true }).click()
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: '1–2 months', exact: true }).click()
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: 'See the recommendation' }).click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/qualifier-summary.png` })
  await page.close()
}

// Mobile
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  colorScheme: 'dark',
})
for (const [name, path] of [
  ['m-home', '/'],
  ['m-thinking', '/thinking'],
  ['m-case', '/work/crm'],
]) {
  const page = await mobile.newPage()
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await settle(page, false)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
  await page.close()
}

// Reduced motion — content must be fully visible, not faded out
const reduced = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
  colorScheme: 'dark',
})
{
  const page = await reduced.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/reduced-motion.png`, fullPage: true })

  // Assert nothing is left invisible.
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('[data-reveal]')].filter(
      (el) => Number(getComputedStyle(el).opacity) < 0.99,
    ).length,
  )
  console.log(`reduced-motion: ${hidden} element(s) still transparent (expect 0)`)
  await page.close()
}

// Print rendering of /cv
{
  const page = await desktop.newPage()
  await page.goto(`${BASE}/cv`, { waitUntil: 'networkidle' })
  await page.emulateMedia({ media: 'print' })
  await page.pdf({ path: `${OUT}/cv-print.pdf`, format: 'A4', printBackground: false })
  await page.close()
}

await browser.close()
console.log('shots written')
