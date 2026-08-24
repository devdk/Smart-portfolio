# Running this on Windows

You are in `C:\dev\portfolio`. Node 20.9 or newer is required — check with `node -v`.

## Start it

```powershell
cd C:\dev\portfolio
npm install
npm run dev
```

Then open http://localhost:3000.

`npm install` takes a couple of minutes on a cold cache. It installs 65 packages; there are no native builds, so it should not need build tools.

## Test it

```powershell
npm run verify
```

That runs three things in order and stops at the first failure:

1. `typecheck` — TypeScript, strict, `noUncheckedIndexedAccess` on
2. `check:content` — **this will fail, on purpose.** It reports 84 unfilled `[PLACEHOLDER]` fields. That is the gate that stops placeholder prose reaching production.
3. `build` — the production build

To see the placeholder list without failing:

```powershell
npx tsx scripts/check-content.ts --warn
```

To run everything except the content gate:

```powershell
npm run typecheck
npm run build
```

## The deeper checks

These need Chromium and a running production server:

```powershell
npx playwright install chromium    # once, ~120 MB
npm run build
node scripts/verify.mjs            # starts a server, runs budget + accessibility, tears down
```

`verify.mjs` reports:

- **JS budget** — app code measured against the framework floor
- **Accessibility** — axe, WCAG 2.1 A and AA, across all nine routes
- **Keyboard paths** — command palette, process tablist, skip link

Screenshots and a print-rendered PDF of `/cv`:

```powershell
npm run shots                      # writes to shots\
```

Expected result on a clean checkout: axe clean on all nine routes, app code ~4 KB above floor, reduced-motion assertion reporting 0 transparent elements.

## What to click

- `⌘K` / `Ctrl+K` — command palette. Try typing `shop`, `react`, `mongo`, or `sudo hire dheeraj`.
- `/` also opens it.
- `/work` — the filters are URL-driven, so `?tech=React` is shareable.
- `/work/chlothzy` — the ten-part case study. Note the architecture section's "what breaks first" per node, and the honest empty state where metrics will go.
- `/thinking` — the decision log. The `dropping-gsap` and `typed-data-vs-mdx` entries are fully written with real content; the rest are structured placeholders.
- `/cv` — press Ctrl+P to see the print stylesheet.
- Resize to 390px wide, and turn on reduced motion in Windows settings (Settings → Accessibility → Visual effects → Animation effects off) to check both paths.

## Known-empty by design

- `/lab` says "not open yet" and is `noindex`. It is a V2 section; a nav link to a 404 is worse than an honest placeholder.
- Metrics render an empty state rather than a number. Nothing is invented.
- The contact form posts to `/api/contact`, which validates and rate-limits, then logs instead of delivering until you set `CONTACT_WEBHOOK_URL`. Submitting it locally returns success and logs server-side — that is the intended behaviour, not a bug.

## If something fails

- **`npm install` fails on a corporate proxy** — set `npm config set registry` or use `npm ci --no-audit`.
- **Port 3000 in use** — `$env:PORT=3001; npm run dev`.
- **`tsx` not found** — it is a devDependency; make sure `npm install` completed rather than being interrupted.
- **`playwright install` blocked** — skip it. The a11y and budget scripts need it; `typecheck` and `build` do not.

See `README.md` for architecture, the content-filling workflow, and the list of deliberate departures from the original brief.
