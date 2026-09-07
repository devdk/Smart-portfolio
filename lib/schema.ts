import { z } from 'zod'

/* ==========================================================================
   THE HONESTY GATE

   Spec §48 says "never invent achievements, client names, metrics...".
   That is written as a good intention. This file makes it structural:
   content that violates it fails validation at build time.

   Two deliberate design decisions, both of which fix bugs that a naive
   schema would have:

   1. There is NO 'estimate' source. An estimate is an invented number with
      a label on it — exactly what §48 forbids.

   2. There is NO separate `verified: boolean`. A flag independent of
      `source` allows { source: 'client-confirmed', verified: false } to
      render labelled "self-measured" — the honesty gate producing a false
      attribution. Presentation is DERIVED from `source` instead.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Placeholder-tolerant URL.

   Division of labour between the two gates:
     - this schema validates SHAPE, and runs on every build
     - scripts/check-content.ts validates COMPLETENESS, and is what blocks
       a deploy

   Without this, an unfilled `[PROJECT URL]` would crash the dev server
   rather than producing the actionable placeholder report, and the pressure
   would be to weaken the schema. Bracketed placeholders are allowed through
   here precisely so check:content can report them properly.
   -------------------------------------------------------------------------- */
const PLACEHOLDER_RE = /^\[[A-Z0-9 ',.—/&-]+\]$/

export const urlOrPlaceholder = z
  .string()
  .refine((v) => PLACEHOLDER_RE.test(v) || z.string().url().safeParse(v).success, {
    message:
      'Must be a valid URL, or a bracketed all-caps placeholder pending real content.',
  })

export function isPlaceholder(value: string | undefined): boolean {
  return typeof value === 'string' && PLACEHOLDER_RE.test(value)
}

export const MetricSource = z.enum([
  'pagespeed', // Lighthouse / PageSpeed Insights, screenshot on file
  'analytics', // GA / Plausible / Shopify analytics
  'client-confirmed', // the client stated it in writing
  'self-measured', // your own measurement — renders muted and labelled
])
export type MetricSource = z.infer<typeof MetricSource>

/** Which sources may render as an unqualified claim. */
export const CLAIMABLE_SOURCES: MetricSource[] = [
  'pagespeed',
  'analytics',
  'client-confirmed',
]

export const metricSchema = z.object({
  label: z.string().min(1),
  before: z.string().optional(),
  after: z.string().min(1),
  source: MetricSource,
  /** ISO date. A metric with no capture date is not a metric. */
  capturedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'capturedAt must be YYYY-MM-DD'),
  note: z.string().optional(),
})
export type Metric = z.infer<typeof metricSchema>

/* ==========================================================================
   CORE WEB VITALS

   This is the strongest kind of evidence a portfolio can carry, for one
   reason: anyone can reproduce it. A visitor who doubts "improved conversions
   by 40%" has no way to check. A visitor who doubts an LCP of 1.4s pastes the
   URL into PageSpeed Insights and finds out in ten seconds. So the page prints
   the URL that was measured and invites the check.

   That property only survives if three things travel with every number:

   1. THE URL. A vitals block without the exact URL measured is unverifiable,
      which makes it decoration. Required, no placeholder allowed.

   2. THE DATASET. Field data (CrUX) is real users over the trailing 28 days
      at the 75th percentile. Lab data is one synthetic run on Google's
      hardware. They are not comparable and a good site can look bad in lab or
      good in lab and bad in field. Labelling them identically is the most
      common quiet lie in performance reporting.

   3. THE DATE. Scores decay. A client installs a chat widget and the LCP the
      page claims stops being true. The date is what turns a stale number from
      a lie into a dated measurement.

   The current Core Web Vitals are LCP, INP and CLS — INP replaced FID in
   March 2024. FCP, TTFB and TBT are diagnostics, not Core Web Vitals, and are
   rendered in a separate row so the page never implies otherwise.
   ========================================================================== */

export const vitalsDataset = z.enum([
  /** CrUX — real users, trailing 28 days, 75th percentile. */
  'field',
  /** Lighthouse — one synthetic run, throttled. */
  'lab',
])
export type VitalsDataset = z.infer<typeof vitalsDataset>

export const vitalsSchema = z
  .object({
    /** The exact URL measured. Not the site, the page. */
    url: z.string().url(),
    dataset: vitalsDataset,
    device: z.enum(['mobile', 'desktop']),
    capturedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'capturedAt must be YYYY-MM-DD'),

    /** Which side of the work this measurement describes. */
    phase: z.enum(['before', 'after']).default('after'),

    /* Core Web Vitals. LCP in seconds, INP in milliseconds, CLS unitless. */
    lcp: z.number().positive(),
    inp: z.number().positive().optional(),
    cls: z.number().min(0),

    /* Diagnostics. Rendered separately and never labelled a Core Web Vital. */
    fcp: z.number().positive().optional(),
    tbt: z.number().min(0).optional(),
    ttfb: z.number().positive().optional(),

    note: z.string().optional(),
  })
  .refine((v) => !(v.dataset === 'lab' && v.inp !== undefined), {
    message:
      'Lighthouse cannot measure INP — it needs real interactions, which a lab run does not have. Record TBT instead, which is the lab proxy, or mark this measurement as field data.',
    path: ['inp'],
  })
  .refine((v) => !(v.dataset === 'field' && v.tbt !== undefined), {
    message:
      'TBT is a lab-only metric. Field data reports INP for interactivity, not TBT.',
    path: ['tbt'],
  })
export type Vitals = z.infer<typeof vitalsSchema>

/* --------------------------------------------------------------------------
   Thresholds, straight from web.dev. Ratings are DERIVED from the value on
   every render and never stored alongside it — the same rule as
   metricPresentation() below, and for the same reason: a stored rating can
   drift out of agreement with the number it describes, and then the page is
   arguing with itself.
   -------------------------------------------------------------------------- */

export type VitalRating = 'good' | 'needs-improvement' | 'poor'

/** [good ceiling, needs-improvement ceiling]. Above the second value is poor. */
export const VITAL_THRESHOLDS = {
  lcp: [2.5, 4.0], // seconds
  inp: [200, 500], // milliseconds
  cls: [0.1, 0.25], // unitless
  fcp: [1.8, 3.0], // seconds — diagnostic
  tbt: [200, 600], // milliseconds — diagnostic
  ttfb: [0.8, 1.8], // seconds — diagnostic
} as const

export type VitalKey = keyof typeof VITAL_THRESHOLDS

export function rateVital(key: VitalKey, value: number): VitalRating {
  const [good, needs] = VITAL_THRESHOLDS[key]
  if (value <= good) return 'good'
  if (value <= needs) return 'needs-improvement'
  return 'poor'
}

export function formatVital(key: VitalKey, value: number): string {
  if (key === 'cls') return value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  if (key === 'inp' || key === 'tbt') return `${Math.round(value)} ms`
  return `${value.toFixed(2).replace(/0$/, '')} s`
}

export const techCategory = z.enum([
  'framework',
  'language',
  'runtime',
  'commerce',
  'cms',
  'database',
  'infrastructure',
  'tooling',
  'ai',
])

export const stackItemSchema = z.object({
  name: z.string().min(1),
  category: techCategory,
  /** REQUIRED. You cannot list a technology without saying why you chose it.
      This single field turns a skills list into an argument, replaces the
      spec's §21 Skills section, and seeds the Decision Log for free. */
  why: z.string().min(10, 'stack[].why must be a real reason, not a placeholder'),
})
export type StackItem = z.infer<typeof stackItemSchema>

export const architectureNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  tech: z.string(),
  purpose: z.string(),
  /** Why this, and not the obvious alternative. */
  rationale: z.string(),
  /** What breaks here first, and under what conditions.
      This is the honest replacement for spec §16 "Break This Project" —
      engineering thinking in prose rather than a fake failure simulator. */
  failureMode: z.string().optional(),
})

export const architectureSchema = z.object({
  nodes: z.array(architectureNodeSchema).min(2),
  edges: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      label: z.string().optional(),
    }),
  ),
})

export const projectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    tagline: z.string().min(1).max(120),

    category: z.enum([
      'ecommerce',
      'webapp',
      'website',
      'shopify',
      'wordpress',
      'ai',
      'automation',
    ]),
    status: z.enum(['live', 'archived', 'nda', 'in-progress']),
    tier: z.enum(['flagship', 'supporting', 'archive']),

    role: z.string().min(1),
    year: z.number().int().min(2015).max(2100),
    duration: z.string().optional(),

    /** Name the client, OR describe them. Never both, never neither.
        Enforced by the refinement below. */
    client: z.string().optional(),
    clientDescriptor: z.string().optional(),

    /* ── TWO FIELDS THAT EXIST FOR THE KNOWLEDGE GRAPH ──────────────────────

       Both of these facts were already true and already on the site — but only
       inside prose. "Built at Mirasphere Digital" lived in the `role` string
       and in a context paragraph; "an accounting firm" lived in a sentence.

       Prose is unqueryable. A graph asked "which clients did he work with at
       Mirasphere?" or "what has he built for accounting firms?" has to either
       read them out of a typed field or infer them by matching strings against
       paragraphs — and an inferred edge on a page about named real clients is
       exactly the kind of claim this codebase refuses to make.

       So these are declarations, not derivations. Nothing here is new
       information; it is information moved from a place that could not be
       traversed to one that can. */

    /** The organisation the work was done at, when it was not independent.
        Absent means freelance or independent. */
    employer: z.string().optional(),

    /** The client's sector, in the plainest word that is true. Lets the graph
        answer "what has he built for X-type businesses" without guessing. */
    clientIndustry: z.string().optional(),

    url: urlOrPlaceholder.optional(),
    repo: urlOrPlaceholder.optional(),

    stack: z.array(stackItemSchema).min(1),

    /* ── THE DEPTH LADDER ───────────────────────────────────────────────────
       Originally all ten case-study parts (spec §14) were required of every
       project. That is the right bar for a flagship and the wrong one for a
       five-week Shopify build: a brochure site has no architecture worth
       diagramming and no eight-week constraint story, so demanding those
       fields does not produce depth — it produces padding, and padding is
       just a slower kind of dishonesty.

       So depth is now required in proportion to the claim being made, and
       enforced by tier in the refinement at the bottom of this object:

         archive     context, outcome, stack            (an honest list entry)
         supporting  + problem, approach                (a one-screen summary)
         flagship    + constraints, implementation,      (the full ten parts)
                       challenges, solution, reflection
                       and at least 3 documented stack choices

       Note what did NOT move. `reflection` stays mandatory for anything
       claiming flagship status — it is the part everyone skips and the part
       that carries the most signal. And every optional array below still
       carries .min(1), so a field may be absent but never present-and-empty:
       an empty `challenges: []` renders as a heading over nothing, which
       promises depth the page does not have.
       ------------------------------------------------------------------ */
    context: z.string().min(1), // 01 — every tier
    problem: z.string().min(1).optional(), // 02 — supporting and up
    constraints: z.array(z.string()).min(1).optional(), // 03 — flagship
    approach: z.string().min(1).optional(), // 04 — supporting and up
    architecture: architectureSchema.optional(), // 05 — always optional
    implementation: z.string().min(1).optional(), // 06 — flagship
    challenges: z.array(z.string()).min(1).optional(), // 07 — flagship
    solution: z.string().min(1).optional(), // 08 — flagship
    metrics: z.array(metricSchema).default([]), // 09 — may be empty; never invented
    reflection: z.string().min(1).optional(), // 10 — flagship

    /* Core Web Vitals. Available at every tier, and the reason a supporting
       project can still be worth a page: for a Shopify or WordPress build the
       performance work IS the substance, and it is the one claim on the site a
       visitor can verify without taking anyone's word for it. */
    vitals: z.array(vitalsSchema).default([]),

    outcome: z.string().min(1), // every tier

    decisions: z.array(z.string()).default([]),
    incidents: z.array(z.string()).default([]),

    featured: z.boolean().default(false),
    order: z.number().int().default(99),
  })
  .refine((p) => Boolean(p.client) !== Boolean(p.clientDescriptor), {
    message:
      'Provide exactly one of `client` (named, with written permission) or `clientDescriptor` (anonymised).',
    path: ['client'],
  })
  .superRefine((p, ctx) => {
    /* One measurement per phase per device. Two "after" runs on mobile is
       either a mistake or a choice about which number to show, and the second
       reading of that is the dangerous one. */
    const seen = new Set<string>()
    for (const [i, v] of p.vitals.entries()) {
      const key = `${v.phase}-${v.device}`
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['vitals', i],
          message: `Duplicate ${v.phase} measurement on ${v.device}. Keep one run per phase per device — picking the flattering one of two is how performance reporting goes wrong.`,
        })
      }
      seen.add(key)
    }

    /* A "before" with no "after" is a complaint about the old site rather than
       evidence of work done. */
    const phases = new Set(p.vitals.map((v) => v.phase))
    if (phases.has('before') && !phases.has('after')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['vitals'],
        message:
          'There is a "before" measurement with no "after". Either add the result, or drop the before — on its own it describes the site you inherited, not the work.',
      })
    }

    /* The depth ladder, enforced. A project may sit at any tier, but it has
       to earn the tier it claims — you cannot label something a flagship and
       then skip the parts that make a flagship worth reading.

       This runs in the direction that matters: it never asks a small project
       for depth it does not have, and it never lets a big claim ship thin. */

    const SUPPORTING_AND_UP = ['problem', 'approach'] as const
    const FLAGSHIP_ONLY = [
      'constraints',
      'implementation',
      'challenges',
      'solution',
      'reflection',
    ] as const

    const require = (field: string, why: string) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: `\`${field}\` is required at tier "${p.tier}". ${why}`,
      })
    }

    if (p.tier === 'supporting' || p.tier === 'flagship') {
      for (const field of SUPPORTING_AND_UP) {
        if (!p[field]) {
          require(
            field,
            'A one-screen summary still has to say what was wrong and what you did about it — without those two it is a screenshot with a caption.',
          )
        }
      }
    }

    if (p.tier === 'flagship') {
      for (const field of FLAGSHIP_ONLY) {
        if (!p[field]) {
          require(
            field,
            'Flagship means the full case study. Drop the tier to "supporting" rather than shipping a flagship with holes in it.',
          )
        }
      }
      if (p.stack.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['stack'],
          message: 'A flagship project should document at least 3 stack choices.',
        })
      }
    }
  })

export type Project = z.infer<typeof projectSchema>

/* The shape you WRITE in content/projects.ts, as opposed to the shape you read
   everywhere else. The difference is the fields with defaults — `metrics`,
   `vitals`, `decisions`, `incidents` — which are required on the way out and
   omittable on the way in. Typing the content file as the output shape forces
   every entry to spell out `vitals: []`, which is noise that teaches nothing;
   typing it as the input shape lets a project simply not have vitals. */
export type ProjectInput = z.input<typeof projectSchema>

/* --------------------------------------------------------------------------
   Which case-study parts a given project actually has.

   The case-study page used to hardcode parts 01 through 10. With the depth
   ladder that would print "03 Constraints" over an empty state on every
   supporting project — a numbered gap where the reader can see something is
   missing. Numbering is derived from what is present instead, so a flagship
   reads 01–10 and a supporting project reads 01–05, both without holes.
   -------------------------------------------------------------------------- */

export type CaseStudyPartKey =
  | 'context'
  | 'problem'
  | 'constraints'
  | 'approach'
  | 'architecture'
  | 'implementation'
  | 'challenges'
  | 'solution'
  | 'results'
  | 'performance'
  | 'reflection'

/** In spec §14 order. `results` is always present — `outcome` is required at
    every tier, and the metrics list under it is allowed to be empty. */
const PART_ORDER: readonly CaseStudyPartKey[] = [
  'context',
  'problem',
  'constraints',
  'approach',
  'architecture',
  'implementation',
  'challenges',
  'solution',
  'results',
  'performance',
  'reflection',
]

export function presentParts(project: Project): CaseStudyPartKey[] {
  return PART_ORDER.filter((key) => {
    /* Always present: `context` and `outcome` are required at every tier. */
    if (key === 'context' || key === 'results') return true

    /* Performance appears only when there is a real measurement behind it.
       A "Performance" heading over an empty state would be the worst possible
       version of this section: it advertises the discipline while proving
       nothing, on the one part of the page that was supposed to be checkable. */
    if (key === 'performance') return project.vitals.length > 0

    /* Architecture is the one part a FLAGSHIP shows even when it is missing.
       A project claiming flagship status with no diagram should say so — the
       empty state on the page explains that the system was not documented to
       node level and that a sketch drawn afterwards would describe the
       diagram rather than the system. That admission is worth printing.

       A supporting project makes no such claim, so an absent diagram is
       simply absent and the part does not appear at all. */
    if (key === 'architecture') return Boolean(project.architecture) || project.tier === 'flagship'

    const value = project[key]
    return Array.isArray(value) ? value.length > 0 : Boolean(value)
  })
}

/* --------------------------------------------------------------------------
   DECISION LOG — the single highest-signal section on the site.
   Decision -> Alternatives -> Reason -> Trade-off -> Outcome
   -------------------------------------------------------------------------- */

export const decisionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  question: z.string().min(1), // "Why React and not Vue?"
  context: z.string().min(1),
  options: z
    .array(
      z.object({
        name: z.string(),
        pros: z.array(z.string()),
        cons: z.array(z.string()),
      }),
    )
    .min(2, 'A decision with fewer than two options considered is not a decision.'),
  chose: z.string().min(1),
  because: z.string().min(1),
  /** What you gave up. A decision with no trade-off is a preference. */
  tradeoff: z.string().min(1),
  outcome: z.string().min(1),
  wouldRepeat: z.enum(['yes', 'no', 'qualified']),
  revisitedAt: z.string().optional(),
  projects: z.array(z.string()).default([]),
})
export type Decision = z.infer<typeof decisionSchema>

/* --------------------------------------------------------------------------
   FAILURE ARCHIVE — "Things I Broke". Confident and honest, never
   self-deprecating (spec §18).
   -------------------------------------------------------------------------- */

export const incidentSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1), // "The four second page"
  symptom: z.string().min(1),
  impact: z.string().min(1),
  cause: z.string().min(1),
  investigation: z.array(z.string()).min(1),
  fix: z.string().min(1),
  result: z
    .object({
      before: z.string(),
      after: z.string(),
      source: MetricSource,
      capturedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .optional(),
  lesson: z.string().min(1),
  projects: z.array(z.string()).default([]),
})
export type Incident = z.infer<typeof incidentSchema>

export const principleSchema = z.object({
  id: z.string(),
  statement: z.string().min(1),
  explanation: z.string().min(1),
  /** A principle with no evidence is a slogan. */
  evidence: z.string().min(1),
  projects: z.array(z.string()).default([]),
})
export type Principle = z.infer<typeof principleSchema>

export const experimentSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  question: z.string().min(1),
  hypothesis: z.string().min(1),
  build: z.string().min(1),
  result: z.string().min(1),
  learned: z.string().min(1),
  tech: z.array(z.string()).min(1),
  liveDemo: z.string().optional(),
  sourceUrl: urlOrPlaceholder.optional(),
})
export type Experiment = z.infer<typeof experimentSchema>

/* --------------------------------------------------------------------------
   Presentation helper. Derived from `source` — never stored, so it cannot
   drift out of sync with the truth.
   -------------------------------------------------------------------------- */

export function metricPresentation(metric: Metric): {
  claimable: boolean
  label: string
} {
  const claimable = CLAIMABLE_SOURCES.includes(metric.source)
  const label = {
    pagespeed: 'PageSpeed Insights',
    analytics: 'Analytics',
    'client-confirmed': 'Client confirmed',
    'self-measured': 'Self-measured',
  }[metric.source]
  return { claimable, label }
}
