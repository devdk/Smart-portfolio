/* ==========================================================================
   CAPTURE THE LIVE CLIENT SITES

   Run this on a machine with ordinary internet access:

     npx playwright install chromium     (once)
     node scripts/capture-live.mjs

   Output: public/shots/raw/<slug>-desktop.png and -mobile.png, plus a
   report.json recording what each URL actually returned.

   ── WHY THIS RUNS ON YOUR MACHINE AND NOT MINE ─────────────────────────────

   The sandbox I work in has a restricted egress allowlist. It can read those
   domains through a fetch proxy but a headless browser cannot reach them at
   all — every request comes back ERR_TUNNEL_CONNECTION_FAILED. So the capture
   has to happen where the network is real. Everything downstream of this file
   (compositing, optimising, wiring the images in) runs fine in the sandbox.

   ── THE RULES THESE CAPTURES FOLLOW ────────────────────────────────────────

   These images are evidence on a portfolio, which makes them claims about
   work that was done. So:

     - real pages at real URLs. No mockups, no "artist's impression".
     - consent banners are dismissed, because a cookie overlay is not what the
       client's site looks like — but nothing else is touched.
     - lazy images are given a chance to load, because a screenshot full of
       empty image frames misrepresents the site downward.
     - a URL that does not serve a public page is REPORTED, not faked. If the
       CRM returns a login screen, that is what the report will say, and the
       decision about whether to show it is a human one.
   ========================================================================== */

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT_DIR = 'public/shots/raw'

/** Slug must match the project slug in content/projects.ts. */
const TARGETS = [
  { slug: 'crm', url: 'https://crm.fordhamfinance.co.uk/' },
  { slug: 'ads-analyser', url: 'https://meta-competitor-analysis.dheerajdrive.com/' },
  { slug: 'chefs-and-homes', url: 'https://chefsandhomes.com/' },
  { slug: 'zyvren', url: 'https://zyvren.com/' },
  { slug: 'women-wellness-first', url: 'https://womenwellnessfirst.com/' },
  { slug: 'allure-dental', url: 'https://alluredentalcare.co.uk/' },
  { slug: 'swann-bookkeeping', url: 'https://swann-bookkeeping.com/' },
  { slug: 'mariforce', url: 'https://mariforce.com/' },
  { slug: 'mirasphere-site', url: 'https://mirasphere.digital/' },
]

/* Tried in order; the first visible match is clicked once. Deliberately does
   not include "Reject" variants — declining is the privacy-respecting choice
   for a person browsing, but a rejection banner sometimes leaves the page in a
   degraded state, and this is a screenshot of a design, not a browsing
   session. */
const CONSENT_BUTTONS = [
  '#onetrust-accept-btn-handler',
  '.cky-btn-accept',
  '#cookie-law-info-bar a#cookie_action_close_header',
  'button:has-text("Accept all")',
  'button:has-text("Accept All")',
  'button:has-text("Accept")',
  'a:has-text("Accept")',
  'button:has-text("I agree")',
  'button:has-text("Got it")',
  'button:has-text("Allow all")',
]

const VIEWPORTS = [
  { kind: 'desktop', viewport: { width: 1440, height: 900 }, scale: 2, mobile: false },
  { kind: 'mobile', viewport: { width: 390, height: 844 }, scale: 3, mobile: true },
]

mkdirSync(OUT_DIR, { recursive: true })

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const targets = only.length > 0 ? TARGETS.filter((t) => only.includes(t.slug)) : TARGETS

const browser = await chromium.launch()
const report = []

for (const target of targets) {
  for (const { kind, viewport, scale, mobile } of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport,
      deviceScaleFactor: scale,
      isMobile: mobile,
      hasTouch: mobile,
      /* Reduced motion off on purpose: some of these sites lead with a
         slider, and the honest screenshot is the one a visitor sees. */
    })
    const page = await ctx.newPage()
    const record = { slug: target.slug, kind, url: target.url }

    try {
      const response = await page.goto(target.url, {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      })
      record.status = response?.status() ?? 0
      record.finalUrl = page.url()
      await page.waitForTimeout(2500)

      for (const selector of CONSENT_BUTTONS) {
        const button = page.locator(selector).first()
        if ((await button.count()) > 0 && (await button.isVisible().catch(() => false))) {
          await button.click({ timeout: 2000 }).catch(() => {})
          record.dismissedConsent = selector
          await page.waitForTimeout(600)
          break
        }
      }

      /* Walk down the page so lazy images request, then return to the top.
         Without this the hero is fine and everything below it is a grey box. */
      await page.evaluate(async () => {
        const step = 700
        for (let y = 0; y < 3200; y += step) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 250))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(1600)

      record.title = (await page.title()).slice(0, 90)
      record.path = `${OUT_DIR}/${target.slug}-${kind}.png`
      await page.screenshot({ path: record.path })
      console.log(`✓ ${target.slug.padEnd(22)} ${kind.padEnd(8)} ${record.status}  ${record.title.slice(0, 46)}`)
    } catch (error) {
      record.error = String(error).slice(0, 160)
      console.log(`✗ ${target.slug.padEnd(22)} ${kind.padEnd(8)} ${record.error.slice(0, 60)}`)
    }

    report.push(record)
    await ctx.close()
  }
}

writeFileSync(`${OUT_DIR}/report.json`, `${JSON.stringify(report, null, 2)}\n`)
await browser.close()

const ok = report.filter((r) => r.path).length
console.log(`\ncapture-live: ${ok}/${report.length} captured — see ${OUT_DIR}/report.json`)
if (ok < report.length) {
  console.log('Anything missing is reported rather than substituted. Check report.json.')
}
