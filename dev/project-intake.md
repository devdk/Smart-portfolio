# Project intake — 8 new projects

Talk through this. Skip anything you don't know and say so — a gap I know about
becomes a bracketed placeholder that blocks deploy until it's filled, which is
the system working. A gap I *guess* at becomes a lie with your name on it.

**The split I'd suggest** — you said 3 Shopify, 3 WordPress, 2 custom:

| # | What | Tier | Gets |
|---|------|------|------|
| 1 | Custom build A | Supporting | Its own page |
| 2 | Custom build B | Supporting | Its own page |
| 3 | Shopify — the best one | Supporting | Its own page |
| 4 | WordPress — the best one | Supporting | Its own page |
| 5 | Shopify | Archive | A list entry, linked to the live site |
| 6 | Shopify | Archive | A list entry, linked to the live site |
| 7 | WordPress | Archive | A list entry, linked to the live site |
| 8 | WordPress | Archive | A list entry, linked to the live site |

Reorder freely — pick for *coverage* (different industries, different problems),
not for which you're proudest of.

---

## Ask me once, not eight times

1. **WordPress:** Elementor, or something else? WooCommerce on any of them?
   Did you do the hosting and DNS too, or just the build?
2. **Shopify:** which theme did you usually start from — Dawn, a paid theme,
   or custom Liquid? Any apps you consistently reached for?
3. **The two custom builds:** what stack, and why that stack over the obvious
   alternative? (This is the one answer that becomes a decision-log entry.)
4. **Naming:** which of the eight clients can I name outright? Everything else
   becomes "a Canadian supplement brand" style descriptor.

---

## Per project — the archive four (#5–8)

Ten seconds each, spoken:

1. Client name **or** industry descriptor
2. What the site is, one sentence
3. Year
4. Live URL — or dead / rebuilt / NDA
5. What changed for them, one sentence

Example of a complete answer: *"A dental practice in Surrey, brochure site with
online booking, 2023, still live at example.co.uk, they stopped taking bookings
over the phone."*

---

## Per project — the supporting four (#1–4)

Same five as above, plus the two that carry the page:

6. **Why did they come to you?** The thing that was actually broken or costing
   them. Not "they needed a website."
7. **What did you do about it, and what was the call you'd defend?** One
   decision with a trade-off in it. *"I used a page builder because they had to
   edit it themselves after I left"* is a real answer.

Optional, and worth a lot if you have it:

8. Anything break in production? What was the symptom, what was the cause?
9. Any number you can *prove* — load time, conversion, hours saved — and where
   the proof is (screenshot, email, analytics). No proof, no number.

---

## What I do with it

Every technology on a project page has to carry a reason for existing — the
schema won't compile without one. I'll draft those reasons from your answers
and show them to you to correct. I won't invent a rationale you didn't give me
and ship it under your name.

Anything you can't answer becomes `[BRACKETED PLACEHOLDER]`, which shows up on
the page in muted grey and fails `npm run check:content` until it's real. You
can't accidentally deploy a half-finished project.

## After the answers land

- `npm run build:lab` — the chat corpus is derived from the projects and goes
  stale silently otherwise
- `npm run verify` — typecheck, placeholder gate, retrieval probes, build
- The evidence wall on the home page grows from 4 real links to 8
