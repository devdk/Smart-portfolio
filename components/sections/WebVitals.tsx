import {
  VITAL_THRESHOLDS,
  formatVital,
  rateVital,
  type VitalKey,
  type VitalRating,
  type Vitals,
} from '@/lib/schema'
import { Meta, cx } from '@/components/primitives'

/* ==========================================================================
   CORE WEB VITALS

   The one section on this site whose claims a visitor can check themselves.
   Everything here is built around protecting that property.

   ── WHY A TABLE, AND NOT A ROW OF BIG NUMBERS ─────────────────────────────

   This is genuinely tabular data: metrics down one axis, before and after
   across the other. A grid of styled cards would look more like a dashboard
   and would lose the row and column relationships that make a screen reader
   able to say "LCP, after: 1.4 seconds, good". Real <th scope> markup gets
   that for free.

   ── WHY EVERY RATING IS ALSO A WORD ───────────────────────────────────────

   Green, amber and red carry the rating at a glance. They are never the only
   thing carrying it: each cell prints "Good", "Needs improvement" or "Poor"
   in text. Colour alone would be a WCAG 1.4.1 failure, and it would also fail
   the plainer test of being printed or screenshotted in greyscale, which is
   what happens to a performance report in practice.

   ── WHY THE DIAGNOSTICS ARE FENCED OFF ────────────────────────────────────

   FCP, TBT and TTFB are not Core Web Vitals — they are diagnostics that help
   explain the three that are. Printing all six under one heading is a small
   dishonesty that a technical reader spots immediately, and it costs more
   credibility than the extra numbers buy.

   Zero JavaScript. Server component, static markup, no client island.
   ========================================================================== */

/** The label pair for each metric: the acronym everyone uses, and the words
    behind it for everyone who does not. */
const VITAL_LABELS: Record<VitalKey, { short: string; long: string }> = {
  lcp: { short: 'LCP', long: 'Largest Contentful Paint' },
  inp: { short: 'INP', long: 'Interaction to Next Paint' },
  cls: { short: 'CLS', long: 'Cumulative Layout Shift' },
  fcp: { short: 'FCP', long: 'First Contentful Paint' },
  tbt: { short: 'TBT', long: 'Total Blocking Time' },
  ttfb: { short: 'TTFB', long: 'Time to First Byte' },
}

const RATING_LABELS: Record<VitalRating, string> = {
  good: 'Good',
  'needs-improvement': 'Needs improvement',
  poor: 'Poor',
}

/* Contrast against --color-canvas (#08090A), computed rather than eyeballed:
   positive 11.44:1, warning 11.94:1, negative 7.40:1. All AAA for normal text
   except negative, which is AAA for large and comfortably AA here. */
const RATING_COLOR: Record<VitalRating, string> = {
  good: 'text-[var(--color-positive)]',
  'needs-improvement': 'text-[var(--color-warning)]',
  poor: 'text-[var(--color-negative)]',
}

const DATASET_COPY = {
  field: {
    label: 'Field data',
    detail:
      'Real users over the trailing 28 days, at the 75th percentile — the same data Google uses for ranking.',
  },
  lab: {
    label: 'Lab run',
    detail:
      'One synthetic run on throttled hardware. Repeatable and useful for diagnosis, but it is not what real users experienced.',
  },
} as const

/** One value cell. Rating derived on render, never stored. */
function Value({ metric, value }: { metric: VitalKey; value: number | undefined }) {
  if (value === undefined) {
    return <span className="text-ink-3">—</span>
  }
  const rating = rateVital(metric, value)
  return (
    <span className="flex flex-col gap-0.5">
      <span className={cx('font-mono text-[1.0625rem]', RATING_COLOR[rating])}>
        {formatVital(metric, value)}
      </span>
      <span className="text-[0.75rem] text-ink-3">{RATING_LABELS[rating]}</span>
    </span>
  )
}

/** The threshold line for one metric, stated as text rather than drawn. A
    reader checking a number wants to know what "good" means, and the numbers
    are short enough that a legend beats a chart. */
function Thresholds({ metric }: { metric: VitalKey }) {
  const [good, needs] = VITAL_THRESHOLDS[metric]
  return (
    <span className="text-[0.75rem] leading-relaxed text-ink-3">
      good ≤ {formatVital(metric, good)} · poor &gt; {formatVital(metric, needs)}
    </span>
  )
}

function VitalsTable({ device, runs }: { device: 'mobile' | 'desktop'; runs: Vitals[] }) {
  /* Before then after: the improvement reads left to right, the way the work
     happened. */
  const ordered = [...runs].sort((a, b) => (a.phase === 'before' ? -1 : b.phase === 'before' ? 1 : 0))

  /* Which interactivity metric this table can show. Field data reports INP;
     a lab run cannot measure it and reports TBT instead. Mixing them in one
     row would compare two different things under one label, so the row is
     chosen from what the runs actually contain. */
  const hasInp = ordered.some((r) => r.inp !== undefined)
  const hasTbt = ordered.some((r) => r.tbt !== undefined)

  const coreRows: VitalKey[] = ['lcp', ...(hasInp ? (['inp'] as const) : []), 'cls']
  const diagnosticRows: VitalKey[] = [
    ...(ordered.some((r) => r.fcp !== undefined) ? (['fcp'] as const) : []),
    ...(hasTbt ? (['tbt'] as const) : []),
    ...(ordered.some((r) => r.ttfb !== undefined) ? (['ttfb'] as const) : []),
  ]

  return (
    <div className="surface-1 rounded-[var(--radius-lg)] p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Meta>{device}</Meta>
        <span className="text-[0.75rem] text-ink-3">
          {ordered.length > 1 ? `${ordered.length} runs` : DATASET_COPY[ordered[0]!.dataset].label}
        </span>
      </div>

      {/* Wide content scrolls inside its own container rather than pushing the
          page sideways. */}
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[26rem] border-collapse text-left">
          <caption className="sr-only">
            Core Web Vitals on {device}
            {ordered.map((r) => `, ${r.phase} — ${DATASET_COPY[r.dataset].label}, ${r.capturedAt}`)}
          </caption>

          <thead>
            <tr className="border-b border-hairline-strong">
              <th scope="col" className="pb-3 pr-4 align-bottom">
                <Meta>Metric</Meta>
              </th>
              {ordered.map((run) => (
                <th key={`${run.phase}-${run.capturedAt}`} scope="col" className="pb-3 pr-4 align-bottom">
                  <span className="flex flex-col gap-0.5">
                    <Meta>{run.phase}</Meta>
                    <span className="text-[0.75rem] font-normal normal-case tracking-normal text-ink-3">
                      {DATASET_COPY[run.dataset].label} · {run.capturedAt}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {coreRows.map((metric) => (
              <tr key={metric} className="border-b border-hairline">
                <th scope="row" className="py-4 pr-4 align-top font-normal">
                  <span className="flex flex-col gap-0.5">
                    <span className="font-mono text-[0.8125rem] text-ink">
                      {VITAL_LABELS[metric].short}
                    </span>
                    <span className="text-[0.8125rem] text-ink-2">{VITAL_LABELS[metric].long}</span>
                    <Thresholds metric={metric} />
                  </span>
                </th>
                {ordered.map((run) => (
                  <td key={`${run.phase}-${metric}`} className="py-4 pr-4 align-top">
                    <Value metric={metric} value={run[metric]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          {diagnosticRows.length > 0 ? (
            <tbody>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={ordered.length + 1}
                  className="pb-3 pt-6 text-left font-normal"
                >
                  <Meta className="text-ink-3">Diagnostics — not Core Web Vitals</Meta>
                </th>
              </tr>
              {diagnosticRows.map((metric) => (
                <tr key={metric} className="border-t border-hairline">
                  <th scope="row" className="py-4 pr-4 align-top font-normal">
                    <span className="flex flex-col gap-0.5">
                      <span className="font-mono text-[0.8125rem] text-ink-2">
                        {VITAL_LABELS[metric].short}
                      </span>
                      <span className="text-[0.8125rem] text-ink-3">
                        {VITAL_LABELS[metric].long}
                      </span>
                    </span>
                  </th>
                  {ordered.map((run) => (
                    <td key={`${run.phase}-${metric}`} className="py-4 pr-4 align-top">
                      <Value metric={metric} value={run[metric]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : null}
        </table>
      </div>
    </div>
  )
}

export function WebVitals({ vitals }: { vitals: Vitals[] }) {
  if (vitals.length === 0) return null

  const devices: ('mobile' | 'desktop')[] = ['mobile', 'desktop']
  const groups = devices
    .map((device) => ({ device, runs: vitals.filter((v) => v.device === device) }))
    .filter((group) => group.runs.length > 0)

  /* Every distinct URL measured, so the invitation to re-run this points at
     the exact page rather than the domain. */
  const urls = [...new Set(vitals.map((v) => v.url))]
  const datasets = [...new Set(vitals.map((v) => v.dataset))]
  const notes = [...new Set(vitals.map((v) => v.note).filter((n): n is string => Boolean(n)))]

  return (
    <div className="flex flex-col gap-5">
      {/* items-start so each card sizes to its own content. Without it the
          desktop table stretches to match a taller mobile table and trails a
          block of empty panel. */}
      <div className="grid items-start gap-5 lg:grid-cols-2">
        {groups.map((group) => (
          <VitalsTable key={group.device} device={group.device} runs={group.runs} />
        ))}
      </div>

      {/* What the dataset means. Printed rather than assumed, because the
          difference between a field score and a lab score is the difference
          between "your users experienced this" and "a robot did". */}
      <div className="flex flex-col gap-2">
        {datasets.map((dataset) => (
          <p key={dataset} className="text-[0.8125rem] leading-relaxed text-ink-3">
            <span className="text-ink-2">{DATASET_COPY[dataset].label}:</span>{' '}
            {DATASET_COPY[dataset].detail}
          </p>
        ))}
      </div>

      {notes.map((note) => (
        <p key={note} className="text-[0.8125rem] leading-relaxed text-ink-2">
          {note}
        </p>
      ))}

      {/* THE POINT OF THE WHOLE SECTION. Any visitor can reproduce these
          numbers in about ten seconds, and is told exactly where to do it.
          A claim that invites checking is worth more than a claim that does
          not — and if the client has since changed the site and the numbers no
          longer hold, a reader finding that out is the correct outcome. That
          is why the capture dates above are not decoration. */}
      <p className="text-[0.8125rem] leading-relaxed text-ink-3">
        Measured with{' '}
        <a
          href="https://pagespeed.web.dev/"
          rel="noopener noreferrer"
          className="text-accent underline decoration-hairline-strong underline-offset-2 transition-colors duration-[var(--duration-micro)] hover:decoration-current"
        >
          PageSpeed Insights
        </a>
        {urls.length === 1 ? ' on ' : ' on the pages '}
        {urls.map((url, i) => (
          <span key={url}>
            {i > 0 ? ', ' : null}
            <a
              href={url}
              rel="noopener noreferrer"
              className="break-all text-ink-2 underline decoration-hairline-strong underline-offset-2 transition-colors duration-[var(--duration-micro)] hover:text-ink"
            >
              {url.replace(/^https?:\/\//, '')}
            </a>
          </span>
        ))}
        . Run it yourself — the numbers above are dated because scores move when
        a site changes.
      </p>
    </div>
  )
}
