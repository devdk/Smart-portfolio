/* ==========================================================================
   INVENTORY — the shape of the whole body of work

   The hero's job is a brief about Dheeraj plus a sense of RANGE. That range
   is the genuinely unusual thing: most developers can show one end of the
   ladder, and he has both — WordPress brochure sites at one end, a practice
   CRM a UK firm runs its business on at the other.

   ── EVERY NUMBER HERE IS FROM THE CV, NOT SUMMED BY ME ────────────────────

   The CV states "16+ freelance projects", "12+ agency collaborations",
   "7+ end-to-end projects at Mirasphere" and "3 dashboards at Virtuoso".
   Those groups plainly overlap — the Mirasphere work IS agency work — so the
   wall NEVER prints a total. It shows the groups the CV names, each with the
   CV's own figure, and lets the visitor do their own arithmetic.

   Inventing "35 projects" by adding these up would be exactly the kind of
   quiet dishonesty the rest of this codebase is built to prevent.
   ========================================================================== */

export type InventoryGroup = {
  id: string
  /** How the CV describes this body of work. */
  label: string
  /** The CV's own figure, verbatim. */
  count: number
  /** Rendered after the count. Keeps "16+" honest rather than "16". */
  approximate: boolean
  /** One line of real detail. */
  note: string
}

/* FLAGSHIPS used to live here as a hardcoded list of four, duplicating what
   content/projects.ts already knows. The evidence wall now derives its linked
   tiles from the real project list via lib/content, so this constant was a
   second source of truth for the same fact — and the kind that goes stale
   silently, because nothing fails when it does. Deleted rather than updated.
   See components/interactive/EvidenceWall.tsx. */


export const INVENTORY: InventoryGroup[] = [
  {
    id: 'freelance',
    label: 'Freelance client projects',
    count: 16,
    approximate: true,
    note: 'WordPress, WooCommerce, Shopify and Bootstrap, for clients in Canada, the US and the UK.',
  },
  {
    id: 'agency',
    label: 'Agency collaborations',
    count: 12,
    approximate: true,
    note: 'Delivered alongside designers and project managers, on their timelines.',
  },
  {
    /* Was "Products of my own", which stopped being true once the attribution
       was pinned down: the CRM was built at Mirasphere Digital for Fordham,
       the lead engine for Swann, and the video pipeline in-house at Mirasphere.
       "Of my own" would have been claiming ownership of client and employer
       work — a small false claim sitting directly above four links that
       disprove it. The strength was never the ownership; it was the scope. */
    id: 'products',
    label: 'Systems built end to end',
    count: 4,
    approximate: false,
    note: 'From data model to deployment to support, as the only developer on each. These have full case studies.',
  },
]

/* --------------------------------------------------------------------------
   THE RANGE PAIRS

   Each pair is one true thing from the humble end of the work and one true
   thing from the demanding end. The juxtaposition IS the argument, and it
   only works because both halves are real.

   `to` deliberately never names a client — the CRM's client is anonymised
   everywhere else on the site, so it is anonymised here too.
   -------------------------------------------------------------------------- */

export type RangePair = { from: string; to: string }

/* The halves are deliberately kept close in length. Because all five
   sentences share one grid cell, the block reserves the height of the
   LONGEST — so an unusually wordy pair would leave a dead gap under the
   heading on every other pair. Trimming the copy was the right fix; padding
   the layout around a stray long sentence would have been the wrong one. */
export const RANGE_PAIRS: RangePair[] = [
  {
    from: 'WordPress brochure sites',
    to: 'a CRM an accounting firm runs on',
  },
  {
    from: 'Elementor page templates',
    to: 'a tokeniser trained from scratch',
  },
  {
    from: 'a Shopify product page',
    to: 'a parser for five million records',
  },
  {
    from: 'DNS for twenty client sites',
    to: '197 endpoints in production',
  },
  {
    from: 'a WooCommerce checkout',
    to: 'a video pipeline that renders in minutes',
  },
]
