/* ==========================================================================
   BACKGROUND

   The spec proposed six layers (gradient, grid, noise, ambient glow,
   interactive accent glow, technical lines). We ship THREE, because the same
   document demands excellent Core Web Vitals and six stacked composited
   layers is not free.

   All three are static, server-rendered, and cost nothing at runtime:
     1. deep radial gradient
     2. technical grid, masked so it fades rather than tiling to the edge
     3. noise, as an inline SVG turbulence tile (no network request)

   The interactive cursor glow is a separate single element in Cursor.tsx,
   translated on pointermove. No particle system.
   ========================================================================== */

export function Background() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* 1 — ambient depth. Two offset radials, warm-free, very low alpha. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(80rem 50rem at 50% -10%, rgb(0 226 228 / 0.07), transparent 60%),' +
            'radial-gradient(60rem 40rem at 85% 15%, rgb(0 226 228 / 0.035), transparent 55%),' +
            'radial-gradient(70rem 60rem at 10% 90%, rgb(255 255 255 / 0.025), transparent 60%)',
        }}
      />

      {/* 2 — technical grid, radially masked so it never reads as wallpaper. */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(244 246 247 / 0.045) 1px, transparent 1px),' +
            'linear-gradient(to bottom, rgb(244 246 247 / 0.045) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 120% 80% at 50% 0%, black 20%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 120% 80% at 50% 0%, black 20%, transparent 75%)',
        }}
      />

      {/* 3 — noise. Inline SVG data URI: no request, no layout cost.
             Kept very low opacity; it exists to kill gradient banding. */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
