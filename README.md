# Dheeraj Kumar — Portfolio

A portfolio built as a product, not a presentation. Next.js 16.3, React 19, TypeScript, Tailwind v4.

**Status: V2. Real content, four signature scenes, all gates green.**

Four real projects with verified figures, a chapter-hue system that re-tints the whole interface as you scroll, a particle-name hero, a scroll-driven architecture assembly, three live AI instruments, and a retrieval chat that quotes rather than generates. Seven placeholders remain, all genuine unknowns Dheeraj must confirm — see [What is still open](#what-is-still-open).

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run verify       # typecheck + placeholder gate + retrieval gate + production build
npm run verify:live  # the above, plus budget + accessibility against a live server
```

Node 20.9+ required.

---

## What is here

| Route | What it is |
|---|---|
| `/` | The argument, in five moves. Section order is fixed for every visitor. |
| `/work` | All projects. Filters by technology and category, driven by the URL. |
| `/work/[slug]` | Full ten-part case study, flagship projects only. |
| `/thinking` | **Decision log, failure archive, principles.** The differentiator. |
| `/cv` | A recruiter document. Static, print-styled, 60-second scan. |
| `/about` | Story and timeline. |
| `/contact` | The Build-With-Me qualifier, then direct routes. |
| `/lab` | **Three live instruments** — BPE tokeniser, PCA embedding map, softmax sampling. Real computation, indexed. |
| `/api/contact` | Validated, rate-limited, honeypotted form handler. |

Plus `sitemap.xml`, `robots.txt`, a generated OG image, `not-found`, and an error boundary.

`⌘K` (or `/`) opens the command palette, which searches every project, decision, incident, technology and page.

---

## What is still open

Content is real and ported. Seven placeholders remain and every one is a fact only Dheeraj can supply:

| Where | What | Why it is not filled |
|---|---|---|
| `site.links.github` | GitHub profile URL | The CV lists location, email, LinkedIn, website and phone — no GitHub. Guessing it from a repo link would be inventing a fact. |
| `cv.logistics` ×6 | Work preference, regions, visa, notice period, salary stance, preferred roles | The source CV marks every one `[TODO: confirm]`. These decide how a recruiter reads the whole page, so they are the highest-value thing to fill. |

`cv.logistics` is not yet rendered on `/cv` — it needs one block on that page once the values are real. A comment in the config says so.

Everything editable lives in three files:

```
lib/site.config.ts     name, positioning, contact, capabilities, process, about, CV
content/projects.ts     projects and case studies
content/thinking.ts     decisions, incidents, principles
```

Unfilled content is wrapped in `[SQUARE BRACKETS]`. The build refuses to ship it:

```bash
npm run check:content           # fails the build if any placeholder remains
tsx scripts/check-content.ts --warn   # lists them without failing, for drafting
```

### Suggested order

1. **The seven placeholders above.** Ten minutes, and `npm run check:content` goes green.
2. **Capture real performance baselines.** Every metric currently carries `source: 'self-measured'` because the source material had counts but no named measurement tool or capture date. Run PageSpeed Insights on the live URLs, screenshot with the date visible, and upgrade those metrics to `source: 'pagespeed'` — the UI renders them differently, at full strength rather than muted.
3. **Regenerate the retrieval corpus after any content edit:** `npm run build:lab`. It is derived from `site.config` and `projects.ts`, so it goes stale silently otherwise.

### The honesty rules, and why they are in the type system

Content validates against Zod at build time (`lib/schema.ts`). Some rules are load-bearing:

- **`metrics` may be empty, and empty renders an honest empty state.** It never renders a zero or an approximation.
- **Every metric needs a `source` and a `capturedAt`.** There is no `estimate` source, because an estimate is an invented number with a label on it. Presentation is *derived* from `source` — a self-measured number renders muted and labelled, and that cannot drift out of sync because there is no separate `verified` flag to disagree with it.
- **Every technology needs a `why`.** You cannot list a stack without saying why you chose it. This replaces the usual skills section, and it is where most of your decision log comes from for free.
- **`constraints` and `reflection` are required.** They are the two case-study fields everyone skips and the two that carry the most signal.
- **Exactly one of `client` or `clientDescriptor`.** Name them with written permission, or anonymise them. Never neither.

If a rule is in your way, the content is probably the thing to change.

---

## Verification

```bash
npm run typecheck        # tsc --noEmit
npm run check:content    # placeholder gate
npm run check:retrieval  # 14 probe questions through lib/retrieval — 8 must answer, 6 must refuse
npm run build            # production build
npm run check:budget     # JS budget (needs a running server)
npm run shots            # screenshots + print PDF into shots/
node scripts/a11y.mjs    # axe WCAG 2.1 A/AA + keyboard paths
node scripts/verify.mjs  # starts a server, runs budget + a11y, tears down
```

Current state: **zero WCAG A/AA violations across all nine routes.** Keyboard paths verified for the command palette, both tablists, the architecture step rail and the skip link.

`check:retrieval` is the unusual one and the most important. The chat's entire claim is that it does not make things up, so fourteen probe questions run on every build — eight the corpus must answer and six it must refuse. If a refusal starts answering, or an answer starts refusing, the build fails. A feature that promises honesty needs a test that enforces it.

### The performance budget

`check:budget` measures **app code above the framework floor**, not an absolute number, because the absolute number is dominated by something nobody controls:

```
185 KB   Next 16.3 + React 19 App Router runtime (measured: bare layout, zero client components)
208 KB   the home page — particle hero, Lab, retrieval chat, qualifier
 22 KB   ← everything this project wrote
```

The budget allows 25 KB above floor; the worst route uses 22.2 KB. Four of the nine routes still ship *no* page-specific client JavaScript at all.

An absolute budget dominated by a framework constant fails on day one and then gets ignored, which is worse than having no budget.

---

## The signature scenes

The doctrine, taken from the earlier scaffold's design spec and the single most useful rule in it:

> Background-layer animation is dead — it blurred content and read as wallpaper. **Animation is the content, in the foreground, one bespoke scene per section, and it never renders under text.**

Four scenes earn their place by saying something, not decorating.

**1. The chapter hue system.** Each section owns a colour; as it crosses the viewport centre the entire interface interpolates to it — beam, status bar, CTAs, borders, the particle swarm, the chart marks. Cyan opens and closes, so it reads as the brand, and the chapters between are lit differently.

This works because three colour custom properties are registered with `@property` in `theme.css`. An *unregistered* custom property is an untyped string to the browser, so changing it snaps; declaring `syntax: '<color>'` makes it animatable. That one detail is the difference between designed and broken. `--color-accent` then resolves through it, so every `text-accent` / `bg-accent` utility in the codebase morphs for free — nothing had to be rewritten to opt in.

All six chapter hues were contrast-checked by computation, not by eye. The lowest is 7.32:1, so accent clears AAA for small text in every chapter. The pink was lightened from `#db61a2` to `#e879b4` because the original measured 5.92:1 — AA, but it broke the AAA guarantee the rest of the palette makes.

**2. The particle name.** Nine thousand particles arrive from outside the frame, settle into the letterforms of DHEERAJ, scatter under the cursor, and dissolve as you scroll away. Canvas 2D with flat `Float32Array`s — no allocation in the hot loop — rather than three.js, which is ~150 KB gzipped before a line of application code. Target positions are **sampled from the real rendered glyphs** via an offscreen canvas, so the letterforms match the site's typography at any width and stay correct if the typeface changes. A real `<h1>` is always in the DOM; the canvas is aria-hidden decoration over it.

**3. The architecture assembly.** On a case study, scroll pins the diagram and drives it through build states: nodes materialise, edges draw themselves, data pulses travel the connections, and each node's *"what breaks first"* appears beside it. Pinned with `position: sticky`, not a JS pin. The complete diagram plus every node's full detail is always in an `<ol>` — nothing is hidden behind the scroll gesture, and mobile and reduced-motion get the finished state with no animation at all.

**4. The Lab and the chat.** Three instruments running real arithmetic on this site's own content: a byte-pair tokeniser **trained here** (300 merges over 10,444 characters), a PCA projection of real 384-dimensional bge-small embeddings implemented from scratch by power iteration, and softmax sampling with live temperature and top-p. Then a retrieval chat that answers by quoting real sentences with citations, and refuses when the corpus does not contain the answer.

Each instrument states what is *not* real. The embedding map says plainly that your typed query is placed lexically rather than embedded, because embedding it in the browser would mean a model download. Being precise about which half is semantic is more interesting than the illusion would have been.

---

## Architecture notes

**Server-first.** The hero, the flow diagram, every case study, `/thinking` and `/cv` are server components. Client code is confined to things that genuinely need a runtime: the nav, the cursor, the process tablist, the qualifier, the palette.

**No animation library.** GSAP was specified in the plan, installed, wired up, and then removed after measurement: it cost 43.5 KB gzip on every route to do fade-up-on-scroll. `IntersectionObserver` plus CSS keyframes does the same job in about 1 KB, and moved the hero to the server as a side effect. The full reasoning is in the decision log on `/thinking` — the site documents its own decisions, including the ones that went against the plan. GSAP earns its place back for the V2 pinned transition, as a dynamic import scoped to that component.

**Motion rules** (`styles/theme.css`, `lib/reveal.ts`):

- Animate **only** `transform` and `opacity`. `filter` and `backdrop-filter` are the same cost class and both scale with radius × area, so blur radius is never animated.
- Elements awaiting a reveal are pre-hidden **only** under `html.js` *and* `prefers-reduced-motion: no-preference`. A script failure, a crawler, or a reduced-motion preference all get fully visible content. There is also a 1.2s failsafe that reveals anything already in the viewport.
- Reduced motion gets complete, correct, instant content — not a degraded version. Asserted in `scripts/shots.mjs`.

**Four surface levels, one blur budget.** Levels 1–3 read as glass through layered gradients, a hairline and an inset highlight — no `backdrop-filter`, effectively free. Level 4 is the only one that blurs and is capped at three concurrent instances: nav, palette, modals.

**Native scroll only.** No smooth-scroll hijacking. No route-transition curtain — Next 16.3's Instant Navigations are the point, and an artificial delay fights them.

**Contrast is computed, not eyeballed.** Every ratio in the token block was calculated. There is deliberately no fourth, dimmer text token: the obvious candidate measures 4.32:1 and fails AA. Opacity is not an escape hatch either — dimming `ink-3` to 70% lands at ~4.4:1 and fails the same check.

---

## Deployment

Vercel. Set these environment variables:

| Variable | Purpose |
|---|---|
| `CONTACT_WEBHOOK_URL` | Where form submissions go (Resend, Formspark, Zapier…). Without it the form succeeds and logs, so a preview never looks broken. |

`VERCEL_GIT_COMMIT_SHA` and `VERCEL_GIT_COMMIT_REF` are provided automatically and drive the footer build stamp.

**Pin `next@16.3.1` or later.** 16.3.0 has a regression that silently breaks dynamic OG image generation when `sharp` is installed.

Before going live: fill every placeholder, add `public/dheeraj-kumar-cv.pdf`, set the real domain in `site.config.ts`, and run `npm run verify:live`.

---

## V2, when V1 is genuinely finished

The Lab with real experiments · the interactive architecture diagram · `/system` · a real before/after performance comparison · View Transitions · per-route OG images · the remaining supporting case studies.

**V3:** the grounded AI assistant, with a hard "I don't have enough information to answer that" default.

**Never:** sound, matrix mode, cursor particle systems, smooth-scroll hijacking, fake metrics, proficiency percentages.

---

## Deliberate departures from the original brief

| Brief asked for | What was built | Why |
|---|---|---|
| Audience router modal (§12) | Persistent routes + command palette | An interstitial gates content behind a decision the visitor cannot yet make, and reordering from session state produces URLs that do not reproduce what they saw. |
| Recruiter Mode (§28) | `/cv` route | A recruiter wants a document, not a mode. Linkable, indexable, printable, a third of the code. |
| Developer Mode (§29) | Footer build stamp now, `/system` in V2 | Making staleness visible in public is what creates the pressure to fix it. |
| "Break This Project" (§16) | `failureMode` per architecture node | Simulating database failure client-side is theatre a senior engineer spots instantly. Prose about what breaks first is the same point, made honestly. |
| Technology graph (§20) | `/work` filters | A force-directed graph is less usable than a filterable list and far more expensive. The useful half — show me everything using Shopify — ships in V1. |
| AI assistant (§27) | Command palette search | Answers most of the same questions at zero hallucination risk and zero running cost. The assistant is V3. |
| Skills section (§21) | Required `stack[].why` per project | A rationale attached to real work beats a list, and never percentages. |
| GSAP everywhere (§33) | CSS + IntersectionObserver | Measured at 43.5 KB gzip per route for fade-up-on-scroll. Documented on `/thinking`. |
| Matrix easter egg (§51) | Removed | §3 of the same brief bans the black-background-green-text cliché. Two eggs remain: `sudo hire dheeraj` in the palette, and the logo. |
| Sound (§52) | Removed | Pure downside on a professional site; the brief already conceded it must work without it. |
| Hero at `8vw–12vw` (§6) | Bounded `clamp()` | Raw `vw` renders at 25.6px on a 320px phone and 413px on a 3440px ultrawide, and §7 asks for both. |
