'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { attachMagnetic } from '@/lib/reveal'

/**
 * Wraps a single element to give it the magnetic hover effect.
 *
 * Exists so the hero can stay a server component: the effect needs a DOM
 * reference, and nothing else about the hero does. `display: contents` means
 * this wrapper adds no box of its own and cannot disturb the layout.
 */
export function MagneticCta({ children, strength }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const target = ref.current?.firstElementChild
    if (!(target instanceof HTMLElement)) return
    return attachMagnetic(target, strength ?? 0.18)
  }, [strength])

  return (
    <span ref={ref} style={{ display: 'contents' }}>
      {children}
    </span>
  )
}
