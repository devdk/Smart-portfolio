'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initReveals } from '@/lib/reveal'

/**
 * Wires up scroll reveals once per route.
 *
 * Previously this imported GSAP + ScrollTrigger, which put 43.5 KB gzip into
 * the first-load bundle of every route to do fade-up-on-scroll. It now uses
 * an IntersectionObserver and CSS keyframes for the same result at about
 * 1 KB. See lib/reveal.ts for the full reasoning.
 *
 * Re-runs on navigation because a new route brings new elements to observe.
 */
export function MotionProvider() {
  const pathname = usePathname()

  useEffect(() => {
    // One frame's delay so the new route's DOM is committed before we
    // measure intersections.
    const raf = requestAnimationFrame(() => initReveals())
    return () => cancelAnimationFrame(raf)
  }, [pathname])

  return null
}
