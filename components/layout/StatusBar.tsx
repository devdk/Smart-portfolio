'use client'

import { useEffect, useRef, useState } from 'react'
import { site } from '@/lib/site.config'
import { useChapter } from './ChapterNarrative'
import { CHAPTERS } from '@/lib/chapters'

/* ==========================================================================
   STATUS BAR — the signature chrome

   A fixed 32px mono strip above the nav:

     dheeraj@web ~ /work            [ ●●○○○○○ ]  shipped        14:52 IST

   Three jobs:
     1. It frames the whole site as an instrument panel rather than a
        marketing page — which is the positioning, stated in the chrome.
     2. It is the chapter index. The dots show where you are in the argument
        and which chapters remain, so the page reads as having a shape.
     3. It carries the live clock, which is a small honest signal that a
        person in a real timezone maintains this.

   Cost control: the scroll-progress line is a scaleX transform on a
   pre-sized element, and the clock ticks once a minute aligned to the minute
   boundary rather than once a second.
   ========================================================================== */

export function StatusBar() {
  const chapter = useChapter()
  const progressRef = useRef<HTMLDivElement>(null)
  const [time, setTime] = useState<string | null>(null)

  /* Scroll progress. rAF-driven so a fast scroll cannot queue up work. */
  useEffect(() => {
    const bar = progressRef.current
    if (!bar) return

    let raf = 0
    let queued = false

    function update() {
      queued = false
      const max = document.documentElement.scrollHeight - window.innerHeight
      const value = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0
      bar!.style.transform = `scaleX(${value.toFixed(4)})`
    }

    function onScroll() {
      if (queued) return
      queued = true
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  /* Clock. Mount-only (a server-rendered time is wrong the instant it
     arrives), aligned to the minute so it does not tick 60x more than the
     display resolution needs. */
  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: site.timezone,
      }).format(new Date())

    setTime(format())
    let interval: ReturnType<typeof setInterval>
    const timeout = setTimeout(
      () => {
        setTime(format())
        interval = setInterval(() => setTime(format()), 60_000)
      },
      60_000 - (Date.now() % 60_000),
    )
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  const activeIndex = CHAPTERS.findIndex((c) => c.id === chapter.id)

  return (
    <div
      data-print-hide
      className="fixed inset-x-0 top-0 z-[210] h-8 border-b border-hairline bg-canvas/90 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-8 max-w-[var(--container-content)] items-center justify-between gap-4 px-[var(--spacing-gutter)] font-mono text-[0.6875rem] text-ink-3">
        {/* Left: the prompt. Reads as a shell, sets the instrument framing. */}
        <span className="flex items-center gap-1.5 truncate">
          <span className="text-ink-2">dheeraj@web</span>
          <span aria-hidden="true">~</span>
          <span className="text-accent transition-colors">{chapter.label}</span>
        </span>

        {/* Centre: chapter index. Decorative — the nav and headings carry the
            real navigation, so this is aria-hidden rather than duplicating it
            as a second landmark for screen readers. */}
        <span aria-hidden="true" className="hidden items-center gap-1.5 sm:flex">
          {CHAPTERS.map((c, i) => (
            <span
              key={c.id}
              className="size-1.5 rounded-full transition-colors duration-[var(--duration-ui)]"
              style={{
                background:
                  i === activeIndex
                    ? 'var(--chapter-accent)'
                    : i < activeIndex
                      ? 'var(--chapter-dim)'
                      : 'rgb(244 246 247 / 0.14)',
              }}
            />
          ))}
        </span>

        {/* Right: live local time. */}
        <span className="tabular-nums">
          {time ? `${time} ${site.timezoneLabel}` : ' '}
        </span>
      </div>

      {/* Scroll progress. scaleX on a pre-sized element — never width. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px overflow-hidden"
      >
        <div
          ref={progressRef}
          className="h-px w-full origin-left will-change-transform"
          style={{ transform: 'scaleX(0)', background: 'var(--chapter-accent)' }}
        />
      </div>
    </div>
  )
}
