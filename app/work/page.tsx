import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import type { Project } from '@/lib/schema'
import {
  archiveProjects,
  flagshipProjects,
  supportingProjects,
  getAllCategories,
  getAllTechnologies,
  CATEGORY_LABELS,
} from '@/lib/content'
import {
  ButtonLink,
  Container,
  EmptyState,
  Meta,
  Pill,
  Section,
  SectionHeading,
  cx,
} from '@/components/primitives'
import { ProjectCard } from '@/components/sections/ProjectCard'
import { WorkMap } from '@/components/sections/WorkMap'

/* ==========================================================================
   WORK INDEX

   The filters here are the deliberate replacement for the spec's §20
   force-directed "technology graph". They answer the only question that graph
   could actually answer — "show me everything that uses Shopify" — as links,
   at zero runtime cost, with no canvas, no physics and no keyboard trap.

   State lives entirely in the URL (?tech=React&category=ecommerce), which is
   the point: a filtered view is linkable, shareable, crawlable and
   reproducible. A useState filter would have looked identical and lost all
   four properties. The command palette already deep-links to /work?tech=<name>,
   so that parameter name is load-bearing — do not rename it.
   ========================================================================== */

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Every project, filterable by technology and by category. Three flagship case studies with the architecture, the decisions and the results behind them.',
  alternates: { canonical: '/work' },
}

type WorkView = 'list' | 'map'
type WorkSearchParams = { tech?: string; category?: string; view?: string }

/** Builds a /work URL from filter state. Empty values drop out of the query
    entirely, so the unfiltered URL is a clean `/work` rather than
    `/work?tech=&category=` — one canonical URL per view. */
function filterHref({ tech, category }: WorkSearchParams): string {
  const params = new URLSearchParams()
  if (tech) params.set('tech', tech)
  if (category) params.set('category', category)
  const query = params.toString()
  return query ? `/work?${query}` : '/work'
}

/** A filter chip. A link, never a button: the target is a real addressable
    URL. Selecting the active chip clears that one dimension and preserves the
    other, so the two filters compose without needing a reset first. */
function FilterLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      {...(active ? { 'aria-current': 'true' as const } : {})}
      className="inline-flex rounded-full transition-opacity duration-[var(--duration-micro)] ease-[var(--ease-micro)] hover:opacity-75"
    >
      <Pill active={active}>
        {children}
        {/* aria-current on a link is announced inconsistently, so the state
            and the consequence of activating it are also stated in text. */}
        {active ? <span className="sr-only"> (active filter — select to clear)</span> : null}
      </Pill>
    </Link>
  )
}

/** One tier of the listing. Renders nothing when the active filter empties it:
    a heading over an empty grid is noise, and the page-level empty state
    already covers "nothing matched at all". */
function Tier({
  index,
  id,
  title,
  lead,
  projects,
  band = false,
  size = 'md',
  leadCard = false,
  columns = 2,
}: {
  index: string
  id: string
  title: string
  lead: string
  projects: Project[]
  band?: boolean
  size?: 'lg' | 'md' | 'sm'
  leadCard?: boolean
  columns?: 2 | 3
}) {
  if (projects.length === 0) return null

  return (
    <Section band={band} aria-labelledby={id}>
      <Container>
        <SectionHeading index={index} id={id} title={title} lead={lead} className="mb-8 md:mb-10" />
        <div
          className={cx(
            'grid gap-4',
            columns === 3 ? 'sm:grid-cols-2 md:grid-cols-3' : 'md:grid-cols-2',
          )}
        >
          {projects.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              /* The double-width lead card comes from position in the filtered
                 data, not from a hardcoded slot, so a filter can never leave a
                 hole in the grid. */
              size={leadCard && i === 0 && projects.length > 1 ? 'lg' : size}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}

/* --- The request-dependent half of the page -------------------------------
   Split out and wrapped in Suspense by the default export: reading
   searchParams is request-time data, and with cacheComponents enabled that
   has to sit under a boundary so the static shell (h1, intro) can still
   prerender.
   -------------------------------------------------------------------------- */

/** List or Map. Two real links, not a button with state — the same rule the
    filters follow, so a view is shareable, bookmarkable and crawlable. */
function ViewToggle({ view, tech, category }: { view: WorkView } & WorkSearchParams) {
  const base = (next: WorkView) => {
    const params = new URLSearchParams()
    if (tech) params.set('tech', tech)
    if (category) params.set('category', category)
    if (next === 'map') params.set('view', 'map')
    const query = params.toString()
    return query ? `/work?${query}` : '/work'
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-hairline p-1">
      {(['list', 'map'] as const).map((option) => (
        <Link
          key={option}
          href={base(option)}
          {...(view === option ? { 'aria-current': 'true' as const } : {})}
          className={cx(
            'rounded-full px-3.5 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.08em] transition-colors duration-[var(--duration-micro)]',
            view === option
              ? 'bg-accent text-[var(--color-accent-ink)]'
              : 'text-ink-3 hover:text-ink',
          )}
        >
          {option === 'list' ? 'List' : 'Map'}
          {view === option ? <span className="sr-only"> (current view)</span> : null}
        </Link>
      ))}
    </div>
  )
}

async function FilteredWork({ searchParams }: { searchParams: Promise<WorkSearchParams> }) {
  const { tech, category, view: rawView } = await searchParams
  const view: WorkView = rawView === 'map' ? 'map' : 'list'

  const technologies = getAllTechnologies()
  const categories = getAllCategories()

  /* An unrecognised value is honoured rather than silently dropped. The URL
     said "filter by this", so the page filters by it and shows an honest empty
     state; ignoring the parameter would render a full listing that contradicts
     its own URL. */
  const activeTech = tech?.trim() ? tech.trim() : undefined
  const activeCategory = category?.trim() ? category.trim() : undefined
  const hasFilter = Boolean(activeTech || activeCategory)

  function matches(project: Project): boolean {
    if (activeTech && !project.stack.some((item) => item.name === activeTech)) return false
    if (activeCategory && project.category !== activeCategory) return false
    return true
  }

  /* The filter applies across all three tiers; tiering is presentation, not a
     second filter. */
  const flagship = flagshipProjects.filter(matches)
  const supporting = supportingProjects.filter(matches)
  const archive = archiveProjects.filter(matches)
  const total = flagship.length + supporting.length + archive.length
  const matchingSlugs = [...flagship, ...supporting, ...archive].map((p) => p.slug)

  /* A known category gets its published label; an arbitrary query value is
     echoed back verbatim rather than mapped to something we never claimed.
     The check is against CATEGORY_LABELS rather than the derived list, so a
     real-but-currently-unused category still reads properly. */
  const isKnownCategory = (value: string): value is Project['category'] =>
    Object.hasOwn(CATEGORY_LABELS, value)
  const activeLabels = [
    activeTech,
    activeCategory && isKnownCategory(activeCategory)
      ? CATEGORY_LABELS[activeCategory]
      : activeCategory,
  ].filter((value): value is string => Boolean(value))

  return (
    <>
      <Section band aria-labelledby="filters-heading">
        <Container>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 id="filters-heading">
              <Meta>Filter</Meta>
            </h2>
            {/* The filters apply to BOTH views, which is the point of making
                the map a view rather than a page: "show me the Shopify work,
                as a map" is one URL. */}
            <ViewToggle view={view} tech={activeTech} category={activeCategory} />
          </div>

          <div className="flex flex-col gap-7">
            <div>
              <h3 className="mb-3">
                <Meta>Technology</Meta>
              </h3>
              <ul className="flex flex-wrap gap-2">
                {technologies.map(({ name, count }) => {
                  const active = name === activeTech
                  return (
                    <li key={name}>
                      <FilterLink
                        href={filterHref({
                          tech: active ? undefined : name,
                          category: activeCategory,
                        })}
                        active={active}
                      >
                        {name}
                        <span className="ml-2 text-ink-3">{count}</span>
                      </FilterLink>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div>
              <h3 className="mb-3">
                <Meta>Category</Meta>
              </h3>
              <ul className="flex flex-wrap gap-2">
                {categories.map(({ value, count }) => {
                  const active = value === activeCategory
                  return (
                    <li key={value}>
                      <FilterLink
                        href={filterHref({
                          tech: activeTech,
                          category: active ? undefined : value,
                        })}
                        active={active}
                      >
                        {CATEGORY_LABELS[value]}
                        <span className="ml-2 text-ink-3">{count}</span>
                      </FilterLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Polite live region so a filtered navigation announces its result
              instead of silently swapping the grid underneath. */}
          <div
            aria-live="polite"
            className="mt-9 flex flex-wrap items-center gap-4 border-t border-hairline pt-6"
          >
            <Meta as="p">
              {total} project{total === 1 ? '' : 's'}
              {activeLabels.length > 0 ? ` · ${activeLabels.join(' · ')}` : ' · unfiltered'}
            </Meta>
            {hasFilter ? (
              <ButtonLink href="/work" variant="ghost" size="sm">
                Clear filters
              </ButtonLink>
            ) : null}
          </div>

          {total === 0 ? (
            <div className="mt-8">
              <EmptyState>
                Nothing matches {activeLabels.join(' and ') || 'this filter'}. The filters are
                generated from what has actually shipped, so a combination with no work behind it
                returns nothing rather than the nearest thing.{' '}
                <Link
                  href="/work"
                  className="text-accent underline decoration-1 underline-offset-[3px] transition-opacity duration-[var(--duration-micro)] hover:opacity-75"
                >
                  Clear the filters
                </Link>{' '}
                to see everything.
              </EmptyState>
            </div>
          ) : null}
        </Container>
      </Section>

      {view === 'map' ? (
        <Section aria-labelledby="map-heading">
          <Container>
            <SectionHeading
              index="Map"
              id="map-heading"
              title="The same work, and how it connects."
              lead="Click any node to follow it. Clients, employers, technologies, decisions and the failures attached to each project — including the one client who came back, which no single project page says."
              className="mb-8 md:mb-10"
            />
            <WorkMap projects={matchingSlugs} />
          </Container>
        </Section>
      ) : (
        <>
      <Tier
        index="01 — Flagship"
        id="tier-flagship"
        title="Full case studies."
        lead="Context, architecture, the decisions behind it and what I would change. Long enough to judge the thinking rather than only the outcome."
        projects={flagship}
        leadCard
      />
      <Tier
        index="02 — Supporting"
        id="tier-supporting"
        title="One-screen summaries."
        lead="Smaller engagements, documented to the depth they deserve rather than padded out to case-study length."
        projects={supporting}
        band
      />
      <Tier
        index="03 — Archive"
        id="tier-archive"
        title="Earlier work."
        lead="Kept for completeness, listed rather than argued for."
        projects={archive}
        size="sm"
        columns={3}
      />
        </>
      )}
    </>
  )
}



export default function WorkPage({ searchParams }: { searchParams: Promise<WorkSearchParams> }) {
  return (
    <>
      <Section>
        <Container>
          <Meta className="mb-6 block">Work</Meta>
          <h1 className="text-h1 max-w-3xl font-medium text-ink">
            Every project, and the reasoning behind each one.
          </h1>
          <p className="text-body-lg mt-6 max-w-2xl text-ink-2">
            Filter by technology or by category. Each filtered view is a real URL, so it can be
            shared, bookmarked and linked to — the useful half of a technology graph, without the
            canvas.
          </p>
        </Container>
      </Section>

      <Suspense
        fallback={
          <Section band>
            <Container>
              <Meta as="p">Loading projects…</Meta>
            </Container>
          </Section>
        }
      >
        <FilteredWork searchParams={searchParams} />
      </Suspense>
    </>
  )
}
