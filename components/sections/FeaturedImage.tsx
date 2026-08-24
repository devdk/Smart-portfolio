import { featuredFor } from '@/content/featured'
import { cx } from '@/components/primitives'

/* ==========================================================================
   FEATURED IMAGE

   A real screenshot of a real live site, composed into a browser frame by
   scripts/build-featured.mjs. Renders nothing at all when there is no capture
   for the slug — see the fallback note at the bottom.

   ── WHY <picture> AND NOT next/image ──────────────────────────────────────

   next/image would route these through the image optimiser at request time.
   These files are already exactly the two formats and the one size the layout
   asks for, produced at build time by sharp, so the optimiser would be
   re-deriving an answer that is already on disk — and it pulls a client
   runtime onto every page that shows a card.

   A plain <picture> with an AVIF source and a WebP fallback is zero
   JavaScript, needs no optimiser, and works identically on a static export.
   The things next/image is genuinely good at — dimensions, lazy loading, a
   blur placeholder — are all available directly, and all three are used here.

   ── WHY THE DIMENSIONS ARE NOT OPTIONAL ───────────────────────────────────

   width and height are always set, from the generated manifest. Without them
   the browser cannot reserve the box, so every card on /work would jump as
   its image arrived — eleven cumulative layout shifts on the page a visitor
   is most likely to land on from a search result.

   ── WHY THE BLUR IS A BACKGROUND AND NOT AN IMAGE ─────────────────────────

   The 16px blur sits behind the real image as a CSS background on the
   wrapper, so it needs no second element, no opacity transition to
   orchestrate and no JavaScript to swap. The real image simply paints over it
   when it decodes.
   ========================================================================== */

export function FeaturedImage({
  slug,
  alt,
  priority = false,
  className,
  sizes = '(min-width: 768px) 50vw, 100vw',
}: {
  slug: string
  /** What the screenshot SHOWS. Never the project title on its own. */
  alt: string
  /** Set on the one image that is above the fold, and nowhere else. */
  priority?: boolean
  className?: string
  sizes?: string
}) {
  const featured = featuredFor(slug)

  /* No capture, no image. The caller draws its own fallback — for a project
     with no public UI (a lead engine, a CLI tool, a render pipeline) there is
     nothing to photograph, and a mocked-up interface would be an invented
     claim about what the software looks like. */
  if (!featured) return null

  return (
    <div
      className={cx('relative overflow-hidden bg-canvas-2', className)}
      style={{
        backgroundImage: `url("${featured.blurDataURL}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <picture>
        <source srcSet={`/shots/${slug}-card.avif`} type="image/avif" />
        <img
          src={`/shots/${slug}-card.webp`}
          alt={alt}
          width={featured.width}
          height={featured.height}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          // eslint-disable-next-line react/no-unknown-property
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          className="block size-full object-cover"
        />
      </picture>
    </div>
  )
}

/** True when a project has a real capture — so a caller can choose its layout
    before rendering, rather than discovering the absence mid-tree. */
export function hasFeaturedImage(slug: string): boolean {
  return featuredFor(slug) !== undefined
}
