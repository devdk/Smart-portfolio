import { INVENTORY, PROJECT_GROUP } from '@/content/inventory'
import { hasProjectPage, projects } from '@/lib/content'
import { EvidenceRows, type Cell, type Row } from '@/components/interactive/EvidenceRows'

/* ==========================================================================
   EVIDENCE — the server half

   Joins the CV's counts (content/inventory.ts) to the real projects
   (content/projects.ts) and hands the interactive rows exactly the fields the
   picture needs. Prose, architecture and metrics stay on the server; the
   island receives eleven small objects.
   ========================================================================== */

export function Evidence() {
  const rows: Row[] = INVENTORY.map((group) => {
    const named: Cell[] = projects
      .filter((project) => PROJECT_GROUP[project.slug] === group.id)
      /* Newest first within a row, so the eye lands on current work. */
      .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
      .map((project) => ({
        slug: project.slug,
        title: project.title,
        /* Exactly one of these exists — the schema refuses both and neither —
           so an anonymised client shows its descriptor rather than a blank. */
        client: project.client ?? project.clientDescriptor ?? 'Undisclosed client',
        year: project.year,
        ...(project.clientIndustry ? { sector: project.clientIndustry } : {}),
        ...(hasProjectPage(project) ? { href: `/work/${project.slug}` } : {}),
      }))

    return {
      id: group.id,
      label: group.label,
      count: group.count,
      approximate: group.approximate,
      note: group.note,
      named,
    }
  })

  return <EvidenceRows rows={rows} />
}
