import Link from 'next/link'
import type { Project } from '@/lib/schema'
import { CATEGORY_LABELS } from '@/lib/content'
import { Arrow, Meta, Pill, cx } from '@/components/primitives'
import { isPlaceholder } from '@/lib/schema'
import { FeaturedImage, hasFeaturedImage } from '@/components/sections/FeaturedImage'

/* ==========================================================================
   PROJECT CARD  (spec §13)

   "Do NOT create standard project cards. Each project should feel like a
   mini product." Two things do that work here without a screenshot:

   1. The card leads with the PROBLEM, not the technology. That is what a
      founder is scanning for, and it is what distinguishes this from a
      list of repos.

   2. A generated visual signature per project — a deterministic pattern
      derived from the slug — so cards look distinct before any real imagery
      exists, and never look like a broken image placeholder.

   Sizes support the asymmetric layout the spec asked for ("mix large cards,
   horizontal cards, full-width, compact — avoid a monotonous grid").
   ========================================================================== */

/** Deterministic hash so a project's visual signature is stable across
    builds and never depends on array order. */
function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function Signature({ slug, dense = false }: { slug: string; dense?: boolean }) {
  const seed = hash(slug)
  const rows = dense ? 4 : 6
  const cols = dense ? 8 : 12

  return (
    <svg
      viewBox={`0 0 ${cols * 10} ${rows * 10}`}
      className="h-full w-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      {Array.from({ length: rows * cols }).map((_, i) => {
        const bit = (seed >> i % 31) & 1
        const alt = (seed >> ((i * 7) % 29)) & 3
        if (!bit) return null
        const x = (i % cols) * 10
        const y = Math.floor(i / cols) * 10
        return (
          <rect
            key={i}
            x={x + 2}
            y={y + 2}
            width={6}
            height={6}
            rx={alt === 0 ? 3 : 1}
            fill="#00E2E4"
            opacity={0.06 + (alt / 3) * 0.16}
          />
        )
      })}
    </svg>
  )
}

/* --------------------------------------------------------------------------
   WHERE A CARD GOES

   Three cases, and the third one used to be a bug: every non-flagship card
   linked to '/work', which — on the /work page, where these cards live — is a
   link to the page you are already on. It looked like a link, took the
   keyboard focus of a link, and went nowhere.

   So the destination is now derived from what the project actually has:

     page      flagship or supporting — a real route at /work/<slug>
     external  archive with a live URL — the only thing worth clicking
     none      archive with no live site — rendered as a plain card, not a
               link, because there is genuinely nowhere to go
   -------------------------------------------------------------------------- */
type CardTarget =
  | { kind: 'page'; href: string }
  | { kind: 'external'; href: string }
  | { kind: 'none' }

function cardTarget(project: Project): CardTarget {
  if (project.tier === 'flagship' || project.tier === 'supporting') {
    return { kind: 'page', href: `/work/${project.slug}` }
  }
  if (project.url && !isPlaceholder(project.url)) {
    return { kind: 'external', href: project.url }
  }
  return { kind: 'none' }
}

export function ProjectCard({
  project,
  size = 'md',
}: {
  project: Project
  size?: 'lg' | 'md' | 'sm'
}) {
  const isCaseStudy = project.tier === 'flagship'
  const target = cardTarget(project)
  const titleUnfilled = isPlaceholder(project.title)

  const shellClass = cx(
    'group surface-2 relative flex flex-col overflow-hidden rounded-[var(--radius-lg)]',
    target.kind !== 'none' && 'surface-interactive',
    size === 'lg' && 'md:col-span-2',
  )

  const body = (
    <>
      {/* The band: a real screenshot where one exists, the generated signature
          where it does not. The signature is not a placeholder waiting to be
          replaced — for a lead engine or a CLI tool it is the honest answer,
          because there is no interface to photograph. */}
      <div
        className={cx(
          'relative overflow-hidden border-b border-hairline bg-canvas-2',
          size === 'lg' ? 'h-44 sm:h-56' : size === 'sm' ? 'h-24' : 'h-36',
        )}
      >
        {hasFeaturedImage(project.slug) ? (
          <FeaturedImage
            slug={project.slug}
            /* Describes the screenshot, not the project — the title is already
               in the heading below, and repeating it here would make a screen
               reader say it twice. */
            alt={`Screenshot of the live ${project.title} site`}
            sizes={size === 'lg' ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
            className="absolute inset-0 size-full transition-transform duration-[var(--duration-slow)] ease-[var(--ease-ui)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 opacity-70 transition-opacity duration-[var(--duration-ui)] group-hover:opacity-100">
            <Signature slug={project.slug} dense={size === 'sm'} />
          </div>
        )}
        {/* Vignette, lighter over a photograph than over a sparse generated
            mark: at the original strength it read as a dirty screenshot rather
            than as depth. */}
        <div
          className="absolute inset-0"
          style={{
            background: hasFeaturedImage(project.slug)
              ? 'linear-gradient(to top, rgb(8 9 10 / 0.55) 0%, rgb(8 9 10 / 0.12) 45%, transparent 100%)'
              : 'radial-gradient(120% 100% at 50% 0%, transparent 30%, rgb(8 9 10 / 0.85) 100%)',
          }}
        />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Meta className="normal-case tracking-[0.08em]">
            {String(project.order).padStart(2, '0')}
          </Meta>
          {project.status === 'nda' ? <Pill>Under NDA</Pill> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Meta className="mb-2 block">{CATEGORY_LABELS[project.category]}</Meta>
            <h3
              className={cx(
                'font-medium text-ink',
                size === 'lg' ? 'text-h3' : 'text-[1.125rem]',
                titleUnfilled && 'text-ink-3',
              )}
            >
              {project.title}
            </h3>
          </div>
          {/* No arrow on a card that is not a link. The arrow is an
              affordance, and drawing one on something unclickable is a
              promise the card cannot keep. */}
          {target.kind === 'none' ? null : (
            <span className="mt-1 shrink-0 text-ink-3 transition-colors duration-[var(--duration-micro)] group-hover:text-accent">
              <Arrow />
            </span>
          )}
        </div>

        <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-2">
          {project.tagline}
        </p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.stack.slice(0, size === 'sm' ? 2 : 4).map((item) => (
            <Pill key={item.name}>{item.name}</Pill>
          ))}
          {project.stack.length > (size === 'sm' ? 2 : 4) ? (
            <Pill>+{project.stack.length - (size === 'sm' ? 2 : 4)}</Pill>
          ) : null}
        </div>
      </div>
    </>
  )

  if (target.kind === 'page') {
    return (
      <Link
        href={target.href}
        data-reveal
        data-cursor={isCaseStudy ? 'VIEW' : undefined}
        className={shellClass}
      >
        {body}
      </Link>
    )
  }

  if (target.kind === 'external') {
    return (
      <a
        href={target.href}
        rel="noopener noreferrer"
        data-reveal
        className={shellClass}
        /* Named for what it is. "Archived project" alone would not tell a
           screen-reader user that this leaves the site for the live build. */
        aria-label={`${project.title} — visit the live site`}
      >
        {body}
      </a>
    )
  }

  return (
    <div data-reveal className={shellClass}>
      {body}
    </div>
  )
}
