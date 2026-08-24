/* ==========================================================================
   FEATURED IMAGES

   Turns the raw captures from scripts/capture-live.mjs into the images the
   site actually ships, and writes a typed manifest so next/image knows their
   dimensions without touching the filesystem at request time.

     node scripts/capture-live.mjs      (on a machine with real internet)
     node scripts/build-featured.mjs    (anywhere)

   Output per project:
     public/shots/<slug>-card.avif   ~1200x750, the grid and card image
     public/shots/<slug>-card.webp   the fallback
     content/featured.ts             slug -> { width, height, blurDataURL }

   ── WHY COMPOSITE AT ALL, RATHER THAN SHIPPING THE RAW SCREENSHOT ──────────

   A bare screenshot in a card looks like a bug report. Framing it as a
   browser window does two honest things at once: it says "this is a website,
   live, at this domain" — the domain is printed in the frame, so the image
   carries its own citation — and it lets the card be a consistent aspect
   ratio regardless of how tall the underlying page is.

   ── WHY THERE IS NO TEXT ON THE CARD IMAGE ────────────────────────────────

   The card already has the project title next to it in real, selectable,
   translatable text. Burning the title into the image would duplicate it,
   make it unreadable at small sizes, and put content in a place no screen
   reader or search engine can read. Text belongs in the DOM.

   ── WHY NO ROTATION, NO PERSPECTIVE, NO GLOSSY REFLECTION ─────────────────

   Those tricks make a screenshot harder to actually look at, which is
   backwards: the screenshot IS the evidence. The frame's whole job is to get
   out of its way.

   ── ABSENCE IS HANDLED, NOT FILLED ────────────────────────────────────────

   Three projects have no public UI to photograph — a lead engine, a CLI ad
   extractor and a render pipeline. They get NO featured image, and the card
   falls back to its generated signature. Mocking up a fake dashboard for them
   would be the single most dishonest thing this codebase could do: an invented
   screenshot of software that does not look like that.
   ========================================================================== */

import { chromium } from 'playwright'
import sharp from 'sharp'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const RAW = 'public/shots/raw'
const OUT = 'public/shots'
const MANIFEST = 'content/featured.ts'

const CARD_W = 1200
const CARD_H = 750
const SCALE = 2

/* Hue per category, from lib/chapters.ts. Category rather than per-project on
   purpose: it makes the work grid readable by TYPE at a glance — every Shopify
   build is pink, every WordPress build green — which is information the grid
   was not carrying before. */
const CATEGORY_HUE = {
  webapp: { accent: '#a78bfa', dim: '#4c3a8f' },
  automation: { accent: '#f0883e', dim: '#7a4520' },
  ai: { accent: '#59c2ff', dim: '#1f5a80' },
  shopify: { accent: '#e879b4', dim: '#7d3a5e' },
  wordpress: { accent: '#3fb950', dim: '#1f6f34' },
  ecommerce: { accent: '#e879b4', dim: '#7d3a5e' },
  website: { accent: '#00e2e4', dim: '#0b6f70' },
}

function dataUri(path, mime) {
  return `data:${mime};base64,${readFileSync(path).toString('base64')}`
}

const MONO = dataUri('node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.woff2', 'font/woff2')

/** Host only — the frame is a citation, and a long path would not fit or help. */
function displayHost(url) {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

function composite({ desktop, mobile, hue, url }) {
  const hasMobile = Boolean(mobile)
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: 'GM'; src: url('${MONO}') format('woff2'); font-weight: 400 }
  * { margin: 0; padding: 0; box-sizing: border-box }
  html, body { width: ${CARD_W}px; height: ${CARD_H}px; overflow: hidden }
  body {
    position: relative; background: #08090a;
    font-family: 'GM', ui-monospace, monospace;
  }
  /* The accent wash. Two radials rather than a linear gradient so the light
     reads as coming from behind the window rather than across it. */
  .wash {
    position: absolute; inset: 0;
    background:
      radial-gradient(72% 58% at 76% 6%, ${hue.accent}40 0%, transparent 64%),
      radial-gradient(64% 54% at 4% 100%, ${hue.dim}4d 0%, transparent 66%);
  }
  /* The same hairline grid the site uses, so the image belongs to the page. */
  .grid {
    position: absolute; inset: 0; opacity: .5;
    background-image:
      linear-gradient(to right, rgb(244 246 247 / .04) 1px, transparent 1px),
      linear-gradient(to bottom, rgb(244 246 247 / .04) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .window {
    position: absolute; left: 158px; top: 64px; width: 986px; height: 624px;
    border-radius: 14px; overflow: hidden;
    background: #0b0d0f;
    border: 1px solid rgb(244 246 247 / .12);
    box-shadow: 0 40px 90px -30px rgb(0 0 0 / .9), 0 0 0 1px rgb(0 0 0 / .4);
  }
  .bar {
    height: 34px; display: flex; align-items: center; gap: 8px; padding: 0 12px;
    background: #101315; border-bottom: 1px solid rgb(244 246 247 / .09);
  }
  .dot { width: 9px; height: 9px; border-radius: 50%; background: rgb(244 246 247 / .16) }
  .host {
    margin-left: 10px; padding: 3px 12px; border-radius: 999px;
    background: rgb(244 246 247 / .05); color: #8a9299;
    font-size: 11.5px; letter-spacing: .04em;
  }
  .shot { display: block; width: 100%; height: calc(100% - 34px); object-fit: cover; object-position: top center }
  .phone {
    position: absolute; left: 50px; bottom: 46px; width: 180px; height: 380px;
    border-radius: 22px; overflow: hidden; background: #0b0d0f;
    border: 1px solid rgb(244 246 247 / .16);
    box-shadow: 0 30px 60px -18px rgb(0 0 0 / .95);
  }
  .phone img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center }
  /* A single accent hairline along the bottom, tying the image to the
     chapter hue without putting a label on it. */
  .rule { position: absolute; left: 0; right: 0; bottom: 0; height: 3px;
    background: linear-gradient(90deg, transparent, ${hue.accent}, transparent) }
  </style></head><body>
  <div class="wash"></div><div class="grid"></div>
  <div class="window">
    <div class="bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i>
      <span class="host">${displayHost(url)}</span></div>
    <img class="shot" src="${desktop}">
  </div>
  ${hasMobile ? `<div class="phone"><img src="${mobile}"></div>` : ''}
  <div class="rule"></div>
  </body></html>`
}

/* --- Which projects to build, read from the real content ------------------ */
const { projects } = await import('../lib/content.ts').catch(() => ({ projects: null })) ?? {}

let list = projects
if (!list) {
  /* lib/content.ts is TypeScript; when this script is run by plain node the
     import above fails. Fall back to parsing the slugs and categories out of
     the source, which is enough for this job and avoids requiring tsx. */
  const src = readFileSync('content/projects.ts', 'utf8')
  list = [...src.matchAll(/slug:\s*'([a-z0-9-]+)'[\s\S]*?category:\s*'([a-z]+)'[\s\S]*?(?:url:\s*'([^']+)')?/g)].map(
    (m) => ({ slug: m[1], category: m[2], url: m[3] }),
  )
  /* The url capture above is unreliable across entries, so read urls by slug. */
  for (const project of list) {
    const block = src.slice(src.indexOf(`slug: '${project.slug}'`))
    const urlMatch = block.slice(0, 1200).match(/\n    url:\s*'([^']+)'/)
    project.url = urlMatch?.[1]
  }
}

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM ?? undefined,
})
const page = await browser.newPage({
  viewport: { width: CARD_W, height: CARD_H },
  deviceScaleFactor: SCALE,
})

const manifest = []
const skipped = []

for (const project of list) {
  const desktopPath = `${RAW}/${project.slug}-desktop.png`
  const mobilePath = `${RAW}/${project.slug}-mobile.png`

  if (!existsSync(desktopPath)) {
    skipped.push(project.slug)
    continue
  }

  const hue = CATEGORY_HUE[project.category] ?? CATEGORY_HUE.website
  const html = composite({
    desktop: dataUri(desktopPath, 'image/png'),
    mobile: existsSync(mobilePath) ? dataUri(mobilePath, 'image/png') : null,
    hue,
    url: project.url ?? '',
  })

  await page.setContent(html, { waitUntil: 'load' })
  await page.waitForTimeout(350)
  const png = await page.screenshot({ type: 'png' })

  await sharp(png).avif({ quality: 58, effort: 6 }).toFile(`${OUT}/${project.slug}-card.avif`)
  await sharp(png).webp({ quality: 82 }).toFile(`${OUT}/${project.slug}-card.webp`)

  /* A 16px blur, inlined as the placeholder. Costs ~400 bytes in the HTML and
     removes the grey-box flash on a slow connection — which is the whole
     reason a placeholder exists. */
  const blur = await sharp(png).resize(16).webp({ quality: 40 }).toBuffer()

  manifest.push({
    slug: project.slug,
    width: CARD_W * SCALE,
    height: CARD_H * SCALE,
    blurDataURL: `data:image/webp;base64,${blur.toString('base64')}`,
  })
  console.log(`✓ ${project.slug.padEnd(22)} card.avif + card.webp`)
}

await browser.close()

const body = `/* GENERATED by scripts/build-featured.mjs — do not edit by hand.

   Dimensions travel with the images so next/image can reserve the right box
   before anything downloads. Without them every card would reflow on load,
   which is a cumulative layout shift on the busiest page of the site.

   A project absent from this map has NO featured image, and the card falls
   back to its generated signature. That is the correct behaviour for the
   projects with no public UI to photograph — see the header of the build
   script for why a mocked-up screenshot is not an option.
*/

export type Featured = {
  width: number
  height: number
  /** Inlined 16px blur, shown while the real image downloads. */
  blurDataURL: string
}

export const FEATURED: Record<string, Featured> = {
${manifest
  .map(
    (m) =>
      `  '${m.slug}': {\n    width: ${m.width},\n    height: ${m.height},\n    blurDataURL:\n      '${m.blurDataURL}',\n  },`,
  )
  .join('\n')}
}

export function featuredFor(slug: string): Featured | undefined {
  return FEATURED[slug]
}
`

writeFileSync(MANIFEST, body)
console.log(`\nbuild-featured: ${manifest.length} images, manifest -> ${MANIFEST}`)
if (skipped.length > 0) {
  console.log(`no capture (correctly left without an image): ${skipped.join(', ')}`)
}
