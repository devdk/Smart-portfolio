import Link from 'next/link'
import { INVENTORY } from '@/content/inventory'
import { hasProjectPage, projects } from '@/lib/content'
import { Meta } from '@/components/primitives'

/* ==========================================================================
   EVIDENCE WALL

   Thirty-two tiles. Every project with a page of its own is a real link; the
   rest stand for the client and agency work the CV counts. They assemble on
   load in a diagonal sweep.

   The linked count is DERIVED, not a constant. It was a hardcoded list of four
   flagships, which meant every project added afterwards left the wall claiming
   less than the site could prove — a hardcoded number on a growing site is a
   number that is wrong by default. Add a project with a page and it becomes a
   link here on the next build.

   The point is pre-verbal: you register the QUANTITY before you read a word.
   That is the "pinch of surprise" the hero was missing — breadth, felt
   rather than claimed.

   ── WHY THE UNNAMED TILES ARE HONEST ──────────────────────────────────────

   The remainder carry no name, because naming them would mean either inventing
   client names or publishing ones there is no permission to publish. So they
   are deliberately anonymous marks, and the caption states exactly what they
   represent using the CV's own figures. An anonymous tile that says "one of 16
   freelance projects" is honest; a fabricated client logo would not be.

   No total is printed. The CV's groups overlap (Mirasphere work is agency
   work), so summing them would invent a number. See content/inventory.ts.

   ── SERVER COMPONENT ──────────────────────────────────────────────────────

   Zero JavaScript. The assembly is a CSS animation keyed off an index custom
   property, and the hover states are CSS. Nothing here needs a runtime.

   ── ACCESSIBILITY ─────────────────────────────────────────────────────────

   The named tiles are real links with real text. The anonymous ones are
   aria-hidden decoration — they carry no information that the caption does not
   state in prose, so exposing two dozen indistinguishable list items to a
   screen reader would be noise, not content.
   ========================================================================== */

/** Deterministic hash so a tile's mark is stable across builds. */
function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** A tiny 3x3 glyph, seeded from the tile's key. Distinct without meaning. */
function Mark({ seed, bright }: { seed: string; bright?: boolean }) {
  const n = hash(seed)
  return (
    <svg viewBox="0 0 30 30" aria-hidden="true" className="size-full">
      {Array.from({ length: 9 }).map((_, i) => {
        if (!((n >> i) & 1)) return null
        const x = (i % 3) * 10
        const y = Math.floor(i / 3) * 10
        const round = ((n >> (i + 9)) & 1) === 1
        return (
          <rect
            key={i}
            x={x + 2.5}
            y={y + 2.5}
            width={5}
            height={5}
            rx={round ? 2.5 : 0.5}
            fill="currentColor"
            opacity={bright ? 0.9 : 0.34}
          />
        )
      })}
    </svg>
  )
}

/** The wall is always 32 tiles: two full rows of 16 on a wide viewport. Named
    tiles take as many of those as there are projects with pages, and the
    anonymous ones fill the rest — so the grid never gains a ragged final row
    as projects are added. */
const TOTAL_TILES = 32

export function EvidenceWall() {
  const linked = projects
    .filter(hasProjectPage)
    .slice(0, TOTAL_TILES)
    .sort((a, b) => a.order - b.order)
  const unnamedCount = Math.max(0, TOTAL_TILES - linked.length)

  return (
    <div>
      <ul
        className="grid grid-cols-8 gap-1.5 sm:grid-cols-12 sm:gap-2 lg:grid-cols-16"
        // The list itself is a real list; the decorative members below are
        // individually aria-hidden.
        aria-label="Selected products"
      >
        {/* Everything with a page. Real links, accent-coloured, first. */}
        {linked.map((project, i) => (
          <li key={project.slug} className="contents">
            <Link
              href={`/work/${project.slug}`}
              data-tile
              data-cursor="VIEW"
              style={{ '--tile-index': i } as React.CSSProperties}
              className="group relative flex aspect-square items-center justify-center rounded-[var(--radius-xs)] border border-accent/40 bg-accent/[0.09] p-1.5 text-accent transition-[transform,background-color] duration-[var(--duration-micro)] ease-[var(--ease-micro)] hover:-translate-y-0.5 hover:bg-accent/[0.16]"
            >
              <Mark seed={project.slug} bright />
              <span className="sr-only">
                {project.title} — {project.tagline}{' '}
                {project.tier === 'flagship' ? 'Read the case study.' : 'Read about it.'}
              </span>
              {/* Hover label. Pointer-events off so it never blocks the link. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-[var(--radius-xs)] border border-hairline-strong bg-canvas px-2 py-1 font-mono text-[0.6875rem] text-ink opacity-0 transition-opacity duration-[var(--duration-micro)] group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {project.title}
              </span>
            </Link>
          </li>
        ))}

        {/* The client and agency work. Anonymous by necessity, not laziness. */}
        {Array.from({ length: unnamedCount }).map((_, i) => (
          <li key={`tile-${i}`} aria-hidden="true" className="contents">
            <span
              data-tile
              style={{ '--tile-index': i + linked.length } as React.CSSProperties}
              className="flex aspect-square items-center justify-center rounded-[var(--radius-xs)] border border-hairline bg-white/[0.02] p-1.5 text-ink-3"
            >
              <Mark seed={`client-${i}`} />
            </span>
          </li>
        ))}
      </ul>

      {/* The caption carries every fact the anonymous tiles stand for. */}
      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
        {INVENTORY.map((group) => (
          <div key={group.id} className="max-w-[15rem]">
            <dt className="flex items-baseline gap-1.5">
              <span className="font-mono text-[1.0625rem] tabular-nums text-ink">
                {group.count}
                {group.approximate ? '+' : ''}
              </span>
              <Meta className="normal-case tracking-normal">{group.label}</Meta>
            </dt>
            <dd className="mt-1 text-[0.8125rem] leading-relaxed text-ink-3">
              {group.note}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
