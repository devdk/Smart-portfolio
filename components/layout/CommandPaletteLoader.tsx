'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { SearchEntry } from '@/lib/content'

/* ==========================================================================
   COMMAND PALETTE LOADER

   The palette is one of the best things about the site and one of the least
   used on a first visit. Shipping it in the initial bundle means every
   visitor pays for a feature most of them never open.

   So this holds the keyboard shortcut, dynamically imports the palette the
   first time it is needed, and warms the chunk during idle time so the first
   ⌘K still feels instant.

   ── A RACE THIS ORIGINALLY GOT WRONG ──────────────────────────────────────

   The first version set `loaded` and then dispatched a window event that the
   palette was supposed to hear and open itself. That cannot work: the dynamic
   import resolves asynchronously, so the event fired before the palette had
   mounted and registered its listener. The event went nowhere and ⌘K silently
   did nothing — caught by the keyboard test, not by the type checker.

   The fix is to stop using an event to cross an async boundary. `openOnMount`
   is passed as a prop, so the intent to open travels with the component and
   cannot arrive before it.
   ========================================================================== */

const CommandPalette = dynamic(
  () => import('./CommandPalette').then((mod) => ({ default: mod.CommandPalette })),
  { ssr: false },
)

const REQUEST_EVENT = 'command-palette:request'

/** Called by the nav button and the mobile sheet. */
export function requestCommandPalette(): void {
  window.dispatchEvent(new CustomEvent(REQUEST_EVENT))
}

export function CommandPaletteLoader({ entries }: { entries: SearchEntry[] }) {
  const [mounted, setMounted] = useState(false)
  /* Incremented on every open request. Passed to the palette as a key-like
     signal so a request that arrives while the palette is closed but already
     mounted still reopens it. */
  const [openSignal, setOpenSignal] = useState(0)

  const requestOpen = useCallback(() => {
    setMounted(true)
    setOpenSignal((n) => n + 1)
  }, [])

  /* Warm the chunk once the browser is idle: fetch the module without
     rendering it, so it is in memory before anyone reaches for ⌘K but never
     on the critical path. requestIdleCallback is absent in Safari, hence the
     timeout fallback. */
  useEffect(() => {
    if (mounted) return

    const warm = () => {
      void import('./CommandPalette')
    }

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (typeof w.requestIdleCallback === 'function') {
      const handle = w.requestIdleCallback(warm, { timeout: 3000 })
      return () => w.cancelIdleCallback?.(handle)
    }
    const timer = window.setTimeout(warm, 2000)
    return () => window.clearTimeout(timer)
  }, [mounted])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const shortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      // Once mounted, the palette owns its own keyboard handling.
      if (mounted) return

      if (shortcut || (event.key === '/' && !typing)) {
        event.preventDefault()
        requestOpen()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener(REQUEST_EVENT, requestOpen)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener(REQUEST_EVENT, requestOpen)
    }
  }, [mounted, requestOpen])

  if (!mounted) return null
  return <CommandPalette entries={entries} openSignal={openSignal} />
}
