import { projects as rawProjects } from '@/content/projects'
import { decisions as rawDecisions, incidents as rawIncidents, principles } from '@/content/thinking'
import {
  projectSchema,
  decisionSchema,
  incidentSchema,
  principleSchema,
  type Project,
  type Decision,
  type Incident,
  type Principle,
} from '@/lib/schema'

/* ==========================================================================
   CONTENT ACCESS

   Everything is validated once, at module load, so a schema violation is a
   build failure rather than a runtime surprise on one route.
   ========================================================================== */

function validate<T>(
  items: unknown[],
  schema: { safeParse: (v: unknown) => { success: boolean; data?: unknown; error?: unknown } },
  kind: string,
): T[] {
  return items.map((item, i) => {
    const result = schema.safeParse(item)
    if (!result.success) {
      const id =
        (item as { slug?: string; id?: string })?.slug ??
        (item as { id?: string })?.id ??
        `index ${i}`
      throw new Error(
        `Invalid ${kind} "${id}":\n${JSON.stringify(result.error, null, 2)}`,
      )
    }
    return result.data as T
  })
}

export const projects = validate<Project>(rawProjects, projectSchema, 'project')
export const decisions = validate<Decision>(rawDecisions, decisionSchema, 'decision')
export const incidents = validate<Incident>(rawIncidents, incidentSchema, 'incident')
export const allPrinciples = validate<Principle>(principles, principleSchema, 'principle')

/* --- Projects ------------------------------------------------------------ */

export const flagshipProjects = projects
  .filter((p) => p.tier === 'flagship')
  .sort((a, b) => a.order - b.order)

export const supportingProjects = projects
  .filter((p) => p.tier === 'supporting')
  .sort((a, b) => a.order - b.order)

export const archiveProjects = projects.filter((p) => p.tier === 'archive')

export const featuredProjects = projects
  .filter((p) => p.featured)
  .sort((a, b) => a.order - b.order)

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

/* --- Which projects get a page of their own -------------------------------

   Flagships get the full ten-part case study. Supporting projects get a page
   too, but a short one — the parts they actually have, and no numbered gaps
   where the missing ones would be (see presentParts in lib/schema.ts).

   Archive entries deliberately get NO page. They are a list, and a generated
   page for a project with two sentences in it is a thin page that dilutes
   every good page around it. Their card links to the live site instead, which
   is the only thing an archive entry has that a visitor might want.
   -------------------------------------------------------------------------- */

/** True when this project has a route at /work/<slug>. */
export function hasProjectPage(project: Project): boolean {
  return project.tier === 'flagship' || project.tier === 'supporting'
}

/** Every slug with a page — the complete set of valid params for the route. */
export function getCaseStudySlugs(): string[] {
  return projects.filter(hasProjectPage).map((p) => p.slug)
}

/* --- Cross-linking -------------------------------------------------------
   This is the genuinely useful half of the spec's "technology graph" (§20),
   shipped as filters and links rather than as a physics simulation.        */

export function getAllTechnologies(): { name: string; count: number; projects: string[] }[] {
  const map = new Map<string, string[]>()
  for (const project of projects) {
    for (const item of project.stack) {
      const existing = map.get(item.name) ?? []
      existing.push(project.slug)
      map.set(item.name, existing)
    }
  }
  return [...map.entries()]
    .map(([name, slugs]) => ({ name, count: slugs.length, projects: slugs }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export function getAllCategories(): { value: Project['category']; count: number }[] {
  const map = new Map<Project['category'], number>()
  for (const p of projects) map.set(p.category, (map.get(p.category) ?? 0) + 1)
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
}

export function getDecision(id: string): Decision | undefined {
  return decisions.find((d) => d.id === id)
}

export function getIncident(id: string): Incident | undefined {
  return incidents.find((i) => i.id === id)
}

export function getDecisionsForProject(slug: string): Decision[] {
  return decisions.filter((d) => d.projects.includes(slug))
}

export function getIncidentsForProject(slug: string): Incident[] {
  return incidents.filter((i) => i.projects.includes(slug))
}

/* --- Command palette search index ---------------------------------------
   Built at module scope so it is computed once and shipped as data. This is
   what lets ⌘K answer most of the questions an AI assistant would, at zero
   risk and zero running cost.                                              */

export type SearchEntry = {
  id: string
  title: string
  subtitle: string
  group: 'Projects' | 'Thinking' | 'Pages' | 'Technologies' | 'Actions'
  href: string
  keywords: string
}

export const CATEGORY_LABELS: Record<Project['category'], string> = {
  ecommerce: 'E-commerce',
  webapp: 'Web application',
  website: 'Website',
  shopify: 'Shopify',
  wordpress: 'WordPress',
  ai: 'AI',
  automation: 'Automation',
}

export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = []

  for (const p of projects) {
    const hasPage = hasProjectPage(p)
    entries.push({
      id: `project-${p.slug}`,
      title: p.title,
      subtitle: `${CATEGORY_LABELS[p.category]}${p.tier === 'flagship' ? ' · Case study' : ''}`,
      group: 'Projects',
      href: hasPage ? `/work/${p.slug}` : '/work',
      keywords: [
        p.title,
        p.tagline,
        CATEGORY_LABELS[p.category],
        p.role,
        ...p.stack.map((s) => s.name),
      ]
        .join(' ')
        .toLowerCase(),
    })
  }

  for (const d of decisions) {
    entries.push({
      id: `decision-${d.id}`,
      title: d.question,
      subtitle: `Decision · chose ${d.chose}`,
      group: 'Thinking',
      href: `/thinking#${d.id}`,
      keywords: [d.question, d.chose, ...d.options.map((o) => o.name)].join(' ').toLowerCase(),
    })
  }

  for (const i of incidents) {
    entries.push({
      id: `incident-${i.id}`,
      title: i.title,
      subtitle: 'Failure archive',
      group: 'Thinking',
      href: `/thinking#${i.id}`,
      keywords: [i.title, i.symptom, i.cause].join(' ').toLowerCase(),
    })
  }

  for (const tech of getAllTechnologies()) {
    entries.push({
      id: `tech-${tech.name}`,
      title: tech.name,
      subtitle: `${tech.count} project${tech.count === 1 ? '' : 's'}`,
      group: 'Technologies',
      href: `/work?tech=${encodeURIComponent(tech.name)}`,
      keywords: tech.name.toLowerCase(),
    })
  }

  const pages: [string, string, string][] = [
    ['Work', 'All projects and case studies', '/work'],
    ['Thinking', 'Decision log, failure archive, principles', '/thinking'],
    ['About', 'Background and timeline', '/about'],
    ['CV', 'Experience, skills, education, résumé download', '/cv'],
    ['Contact', 'Start a project', '/contact'],
  ]
  for (const [title, subtitle, href] of pages) {
    entries.push({
      id: `page-${href}`,
      title,
      subtitle,
      group: 'Pages',
      href,
      keywords: `${title} ${subtitle}`.toLowerCase(),
    })
  }

  return entries
}
