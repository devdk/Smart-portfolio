import { ImageResponse } from 'next/og'
import { site } from '@/lib/site.config'

/* ==========================================================================
   ROOT OG IMAGE  (spec §45)

   One image for the whole site in V1; per-route images are a V2 item.

   Built with next/og rather than a static PNG so it stays in sync with
   site.config — the name and role cannot drift out of date.

   NOTE ON VERSIONS: Next 16.3.0 shipped a regression where an image-optimizer
   change blocked libvips' SVG decoder, so dynamic ImageResponse returned zero
   bytes when `sharp` was installed. This project pins 16.3.1, which fixes it.
   Do not downgrade.

   No external fonts are fetched: a network fetch at image-generation time is
   a failure mode for a decorative asset, so this uses the runtime's default
   sans and leans on scale and colour for the design instead.
   ========================================================================== */

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${site.name} — ${site.role}`

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#08090A',
          padding: '72px',
          position: 'relative',
        }}
      >
        {/* Ambient accent wash, mirroring the site's background system. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(900px 500px at 50% -10%, rgba(0,226,228,0.16), transparent 60%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '9999px',
              background: '#00E2E4',
            }}
          />
          <div
            style={{
              color: '#8A9299',
              fontSize: '24px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {site.name}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              color: '#F4F6F7',
              fontSize: '104px',
              fontWeight: 600,
              letterSpacing: '-0.035em',
              lineHeight: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {site.heroLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid rgba(244,246,247,0.12)',
            paddingTop: '28px',
          }}
        >
          <div style={{ color: '#A6ADB4', fontSize: '28px', maxWidth: '760px' }}>
            {site.heroSupport}
          </div>
          <div
            style={{
              color: '#00E2E4',
              fontSize: '22px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {site.role}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
