/* ==========================================================================
   CHAPTERS — the hue system

   The site is one continuous argument, and each chapter owns a colour. As a
   chapter crosses the viewport centre, the ENTIRE interface interpolates to
   its hue: beam, status bar, CTAs, borders, glows, chart marks, the particle
   swarm in the hero.

   Why this is the highest-leverage move available: it costs about 2 KB of CSS
   and one IntersectionObserver, and it animates the whole page rather than
   one element. Nothing else in the budget changes the *feel* this much.

   Cyan is home. It owns the opening and the close, so it reads as Dheeraj's
   colour, and the chapters in between are lit differently — the visitor moves
   through rooms rather than scrolling a single flat page.

   The morph is only possible because the colour custom properties are
   registered with @property in theme.css. An unregistered custom property is
   an untyped string to the browser, so it SNAPS between values. Registering
   it with `syntax: '<color>'` makes it animatable. That one detail is the
   difference between this feeling designed and feeling broken.
   ========================================================================== */

export type Chapter = {
  id: string
  /** Mono label shown in the status bar. */
  label: string
  /** Primary accent. Must clear 4.5:1 on --color-canvas for use as text. */
  accent: string
  /** Lighter variant for hover and large display type. */
  bright: string
  /** Dim variant for borders and tracks. Decorative only. */
  dim: string
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'identity',
    label: 'identity',
    accent: '#00e2e4',
    bright: '#5af0f2',
    dim: '#0b6f70',
  },
  {
    id: 'craft',
    label: 'craft',
    accent: '#59c2ff',
    bright: '#8fd6ff',
    dim: '#1f5a80',
  },
  {
    id: 'work',
    label: 'shipped',
    accent: '#f0883e',
    bright: '#ffa657',
    dim: '#7a4520',
  },
  {
    id: 'thinking',
    label: 'thinking',
    accent: '#3fb950',
    bright: '#7ee787',
    dim: '#1f6f34',
  },
  {
    id: 'machine',
    label: 'the machine',
    accent: '#a78bfa',
    bright: '#c4b5fd',
    dim: '#4c3a8f',
  },
  {
    id: 'process',
    label: 'process',
    accent: '#e879b4',
    bright: '#ff9bce',
    dim: '#7d3a5e',
  },
  {
    id: 'contact',
    label: 'what next',
    accent: '#00e2e4',
    bright: '#5af0f2',
    dim: '#0b6f70',
  },
]

export const CHAPTER_BY_ID: Record<string, Chapter> = Object.fromEntries(
  CHAPTERS.map((c) => [c.id, c]),
)

export const DEFAULT_CHAPTER = CHAPTERS[0]!

/** Routes that are not the scrolling homepage still get a stable hue. */
export const ROUTE_CHAPTER: Record<string, string> = {
  '/work': 'work',
  '/thinking': 'thinking',
  '/lab': 'machine',
  '/about': 'craft',
  '/cv': 'craft',
  '/contact': 'contact',
}

export function chapterForRoute(pathname: string): Chapter {
  if (pathname === '/') return DEFAULT_CHAPTER
  const key = Object.keys(ROUTE_CHAPTER).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
  return CHAPTER_BY_ID[(key && ROUTE_CHAPTER[key]) || 'identity'] ?? DEFAULT_CHAPTER
}
