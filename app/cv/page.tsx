import type { Metadata } from 'next'
import Link from 'next/link'

import { site } from '@/lib/site.config'
import { hasProjectPage, projects } from '@/lib/content'
import { isPlaceholder, type Project } from '@/lib/schema'
import { ButtonLink, Container, Meta, Pill, cx } from '@/components/primitives'

/* ==========================================================================
   /cv — A DOCUMENT, NOT AN EXPERIENCE

   Everything else on this site is built to be read. This page is built to be
   SKIMMED, by someone who has forty of these open and ninety seconds in
   total. Consequences, all deliberate:

   - No <Section>. Its --spacing-section rhythm (4.5-9rem) is correct for the
     marketing pages and wrong here: it would push experience below the fold
     on screen and cost a whole sheet of paper. Sections here are plain
     elements separated by a hairline and a fixed 2rem of air.
   - Prose measure, not content measure. A CV is a column of text.
   - Nothing depends on hover, focus or JS. The only interactive element that
     carries unique information is the PDF link, and it is marked
     data-print-hide because "Download PDF" is meaningless on paper.
   - Secondary prose gets `print:text-ink`. theme.css's print block only
     remaps --color-canvas and --color-ink, so ink-2 would stay light grey on
     white paper. Metadata stays ink-3, where grey is appropriate.
   ========================================================================== */

export const metadata: Metadata = {
  title: 'CV',
  description: `${site.name} — ${site.role}. Experience, skills, selected projects and education, in one page. Print or download as PDF.`,
}

/* Order for the compact project list: the ones with case studies first, then
   supporting work, then the archive. Within a tier, the editorial `order`
   field wins — the same ordering the work page uses. */
const TIER_RANK: Record<Project['tier'], number> = {
  flagship: 0,
  supporting: 1,
  archive: 2,
}

const cvProjects = [...projects].sort(
  (a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || a.order - b.order,
)

/** Section wrapper. A hairline plus a fixed gap, and break-inside-avoid so a
    two-line block never straddles a page break. */
function Block({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="mt-10 break-inside-avoid border-t border-hairline pt-8">
      <h2 id={id} className="text-h3 mb-6 font-medium text-ink">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Prose that may still be an unfilled [PLACEHOLDER]: rendered verbatim, in
    ink-3, so an unfinished CV is visibly unfinished rather than plausible. */
function Value({ children, className }: { children: string; className?: string }) {
  return (
    <p
      className={cx(
        'leading-relaxed',
        isPlaceholder(children) ? 'text-ink-3' : 'text-ink-2 print:text-ink',
        className,
      )}
    >
      {children}
    </p>
  )
}

export default function CvPage() {
  /* Contact details are linked only when the underlying value is real. An
     unfilled placeholder must never be turned into `mailto:[YOUR EMAIL]` —
     a dead link is worse than plain text, and inventing one is not an option. */
  const emailLive = !isPlaceholder(site.email)
  const resumeLive = !isPlaceholder(site.links.resume)

  const profiles: { label: string; url: string }[] = [
    { label: 'GitHub', url: site.links.github },
    { label: 'LinkedIn', url: site.links.linkedin },
  ]

  return (
    <article className="pb-24 pt-32 sm:pt-40">
      <Container width="prose">
        {/* ---------- Header ---------- */}
        <header>
          <Meta className="mb-5 block" as="p">
            Curriculum vitae
          </Meta>
          <h1 className="text-h2 font-medium text-ink">{site.name}</h1>
          <p className="mt-3 text-body-lg text-ink-2 print:text-ink">
            {site.role}
            <span aria-hidden="true"> · </span>
            {site.location}
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem]">
            <li>
              {emailLive ? (
                <a href={`mailto:${site.email}`} className="text-accent print:text-ink">
                  {site.email}
                </a>
              ) : (
                <span className="text-ink-3">{site.email}</span>
              )}
            </li>
            {profiles.map((profile) => (
              <li key={profile.label}>
                {isPlaceholder(profile.url) ? (
                  <span className="text-ink-3">
                    {profile.label}: {profile.url}
                  </span>
                ) : (
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent print:text-ink"
                  >
                    {profile.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* `external` here is not about the origin — the PDF is served from
              this site — it is about rendering a plain <a target="_blank">
              instead of a <Link>. A router navigation to a static file has
              nothing to prefetch and nothing to render. */}
          {resumeLive ? (
            <p className="mt-8" data-print-hide>
              <ButtonLink href={site.links.resume} external size="sm" variant="secondary">
                Download PDF
              </ButtonLink>
            </p>
          ) : null}
        </header>

        {/* ---------- Summary ---------- */}
        <Block id="cv-summary" title="Summary">
          <Value className="text-body-lg">{site.cv.summary}</Value>
        </Block>

        {/* ---------- Experience ---------- */}
        <Block id="cv-experience" title="Experience">
          <div className="space-y-8">
            {site.cv.experience.map((job) => (
              <div key={`${job.role}-${job.org}-${job.period}`} className="break-inside-avoid">
                <h3
                  className={cx(
                    'text-[1.0625rem] font-medium',
                    isPlaceholder(job.role) ? 'text-ink-3' : 'text-ink',
                  )}
                >
                  {job.role}
                </h3>
                {/* Organisation and dates are the two things a recruiter's eye
                    lands on, so they get the mono treatment used for evidence
                    everywhere else on the site. */}
                <Meta as="p" className="mt-1.5 block normal-case tracking-[0.04em]">
                  {job.org}
                  <span aria-hidden="true"> · </span>
                  {job.period}
                </Meta>
                <ul className="mt-4 space-y-2">
                  {job.points.map((point) => (
                    <li key={point} className="flex gap-3 leading-relaxed">
                      <span aria-hidden="true" className="text-ink-3">
                        —
                      </span>
                      <span
                        className={isPlaceholder(point) ? 'text-ink-3' : 'text-ink-2 print:text-ink'}
                      >
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Block>

        {/* ---------- Skills ---------- */}
        <Block id="cv-skills" title="Skills">
          {/* Comma-separated text rather than pills: pills read as chrome in a
              document, and their low-opacity fill disappears in print while
              the text stays grey. Percentages and bars are out by policy —
              they quantify something nobody measured. */}
          <dl className="space-y-4">
            {site.cv.skillGroups.map((group) => (
              <div key={group.group} className="sm:grid sm:grid-cols-[9rem_1fr] sm:gap-6">
                <Meta as="dt" className="block">
                  {group.group}
                </Meta>
                <dd className="mt-1 leading-relaxed text-ink-2 sm:mt-0 print:text-ink">
                  {group.items.join(', ')}
                </dd>
              </div>
            ))}
          </dl>
        </Block>

        {/* ---------- Selected projects ---------- */}
        <Block id="cv-projects" title="Selected projects">
          <ul className="space-y-6">
            {cvProjects.map((project) => {
              /* Only projects with a page of their own are linked, so only those
                 get a link — pointing a recruiter at /work/<slug> for a page
                 that does not exist is worse than not linking at all. */
              const linked = hasProjectPage(project)
              const titleUnfilled = isPlaceholder(project.title)

              return (
                <li key={project.slug} className="break-inside-avoid">
                  <h3 className="text-[1rem] font-medium">
                    {linked ? (
                      <Link
                        href={`/work/${project.slug}`}
                        className={cx(titleUnfilled ? 'text-ink-3' : 'text-ink', 'underline decoration-hairline-strong underline-offset-4 hover:decoration-accent')}
                      >
                        {project.title}
                      </Link>
                    ) : (
                      <span className={titleUnfilled ? 'text-ink-3' : 'text-ink'}>
                        {project.title}
                      </span>
                    )}
                    {project.status === 'nda' ? (
                      <Pill className="ml-3 align-middle">Under NDA</Pill>
                    ) : null}
                  </h3>
                  <Value className="mt-1.5">{project.tagline}</Value>
                  <Meta as="p" className="mt-2 block normal-case tracking-[0.04em]">
                    {project.stack.map((item) => item.name).join(' · ')}
                  </Meta>
                </li>
              )
            })}
          </ul>
        </Block>

        {/* ---------- Education ---------- */}
        <Block id="cv-education" title="Education">
          <div className="space-y-5">
            {site.cv.education.map((entry) => (
              <div key={`${entry.qualification}-${entry.org}`} className="break-inside-avoid">
                <h3
                  className={cx(
                    'text-[1.0625rem] font-medium',
                    isPlaceholder(entry.qualification) ? 'text-ink-3' : 'text-ink',
                  )}
                >
                  {entry.qualification}
                </h3>
                <Meta as="p" className="mt-1.5 block normal-case tracking-[0.04em]">
                  {entry.org}
                  <span aria-hidden="true"> · </span>
                  {entry.period}
                </Meta>
              </div>
            ))}
          </div>
        </Block>
      </Container>
    </article>
  )
}
