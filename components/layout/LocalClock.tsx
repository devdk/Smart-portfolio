'use client'

import { useEffect, useState } from 'react'
import { site } from '@/lib/site.config'

/**
 * Live local clock (spec §32).
 *
 * Renders nothing until mounted, deliberately: a server-rendered time would
 * be wrong the moment it reached the client and would cause a hydration
 * mismatch. `suppressHydrationWarning` would hide the warning without fixing
 * the bug. A reserved-height placeholder avoids any layout shift, keeping
 * this off the CLS budget.
 */
export function LocalClock() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    function update() {
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: site.timezone,
        }).format(new Date()),
      )
    }
    update()
    // Align to the next minute boundary, then tick each minute — rather than
    // polling every second for a display that only shows minutes.
    const msToNextMinute = 60_000 - (Date.now() % 60_000)
    let interval: ReturnType<typeof setInterval>
    const timeout = setTimeout(() => {
      update()
      interval = setInterval(update, 60_000)
    }, msToNextMinute)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  return (
    <p className="font-mono text-[0.9375rem] tabular-nums text-ink">
      {/* Non-breaking space reserves the line box before the clock mounts. */}
      {time ? `${time} ${site.timezoneLabel}` : ' '}
    </p>
  )
}
