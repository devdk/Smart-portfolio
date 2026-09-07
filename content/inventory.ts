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
    note: 'WordPress, WooCommerce, Shopify and Bootstrap — Canada, the US, the UK.',
  },
  {
    id: 'agency',
    label: 'Agency collaborations',
    count: 12,
    approximate: true,
    note: 'Alongside designers and project managers, on their timelines.',
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
    note: 'Data model to deployment to support, as the only developer on each.',
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

/* --------------------------------------------------------------------------
   WHICH GROUP EACH NAMED PROJECT SITS IN

   The evidence rows draw one cell per project in each group, so every named
   project needs a row to stand in. This is the assignment, and it is
   editorial rather than derivable — which is why it lives here beside the
   counts rather than being inferred from a field.

   ── THE OVERLAP, HANDLED HONESTLY ─────────────────────────────────────────

   The CRM and the lead engine are BOTH agency-delivered work and
   systems-built-end-to-end. The CV counts them under both headings, which is
   exactly why no total is ever printed.

   They are placed once, in `products`, because that is the more specific and
   more interesting claim: "delivered through an agency" describes how the work
   arrived, "built end to end as the only developer" describes what it was.
   The agency row's own count is the CV's figure and already includes them —
   the unnamed cells in that row absorb the difference.

   A project missing from this map still renders; it simply has no cell of its
   own, which is the correct behaviour for archive work.
   -------------------------------------------------------------------------- */

export type GroupId = 'freelance' | 'agency' | 'products'

export const PROJECT_GROUP: Record<string, GroupId> = {
  /* Independent — the one project on the site not done at Mirasphere. */
  'allure-dental': 'freelance',

  /* Agency delivery, for a client of Mirasphere's or for Mirasphere itself. */
  'chefs-and-homes': 'agency',
  zyvren: 'agency',
  'women-wellness-first': 'agency',
  mariforce: 'agency',
  'swann-bookkeeping': 'agency',
  'mirasphere-site': 'agency',

  /* Built end to end, sole developer, data model to deployment. */
  crm: 'products',
  leadhouse: 'products',
  'ads-analyser': 'products',
  studio: 'products',
}
