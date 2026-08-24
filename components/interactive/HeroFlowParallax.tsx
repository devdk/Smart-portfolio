'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * The only client-side part of the hero flow: a subtle cursor parallax.
 *
 * Kept as a thin wrapper so the SVG itself stays a server component. One
 * transform on one group, rAF-driven, pointer-fine only, and it never runs
 * under prefers-reduced-motion. The brief asked for nodes that "subtly react
 * to cursor movement" — anything beyond a few pixels reads as a gimmick, so
 * the displacement is capped at 22px horizontally and 12px vertically.
 */
export function HeroFlowParallax({ children }: { children: ReactNode }) {
  const groupRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const group = groupRef.current
    if (!group) return

    let raf = 0
    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0

    function onMove(event: PointerEvent) {
      const rect = group!.ownerSVGElement?.getBoundingClientRect()
      if (!rect || rect.width === 0) return
      targetX = ((event.clientX - (rect.left + rect.width / 2)) / rect.width) * 22
      targetY = ((event.clientY - (rect.top + rect.height / 2)) / rect.height) * 12
    }

    function tick() {
      x += (targetX - x) * 0.06
      y += (targetY - y) * 0.06
      group!.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <g ref={groupRef}>{children}</g>
}
