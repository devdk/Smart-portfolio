'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CHAPTERS, CHAPTER_BY_ID, chapterForRoute, type Chapter } from '@/lib/chapters'

/* ==========================================================================
   CHAPTER NARRATIVE

   Watches which chapter owns the viewport centre and writes its hue onto
   <html>. Because the three colour properties are registered with @property
   in theme.css, the browser interpolates them — one assignment re-tints the
   entire interface over 900ms.

   Design notes:

   - `rootMargin: -45% 0px -45% 0px` collapses the intersection area to a
     narrow band across the middle of the viewport, so a chapter activates
     when it is genuinely the thing being read, not when its first pixel
     appears. Without this, tall sections would fight over the accent.

   - Sections are ordered, so when several are in the band at once we take the
     LAST one to enter going down and the FIRST going up. A plain "most
     recently intersected wins" rule produces flicker at boundaries.

   - On routes other than the homepage there is no scroll narrative; the route
     gets one stable hue from chapterForRoute.

   - It also publishes the active chapter to any component that wants it
     (the status bar, the hero particles) via a subscribe function, avoiding a
     context provider for what is one string.
   ========================================================================== */

type Listener = (chapter: Chapter) => void
const listeners = new Set<Listener>()
let current: Chapter = CHAPTERS[0]!

export function subscribeToChapter(listener: Listener): () => void {
  listeners.add(listener)
  listener(current)
  return () => listeners.delete(listener)
}

function setChapter(chapter: Chapter): void {
  if (chapter.id === current.id) return
  current = chapter

  const root = document.documentElement
  root.style.setProperty('--chapter-accent', chapter.accent)
  root.style.setProperty('--chapter-bright', chapter.bright)
  root.style.setProperty('--chapter-dim', chapter.dim)
  root.dataset.chapter = chapter.id

  for (const listener of listeners) listener(chapter)
}

export function ChapterNarrative() {
  const pathname = usePathname()

  useEffect(() => {
    // Non-homepage routes: one stable hue, no observer.
    if (pathname !== '/') {
      setChapter(chapterForRoute(pathname))
      return
    }

    const sections = CHAPTERS.map((chapter) => ({
      chapter,
      el: document.getElementById(`chapter-${chapter.id}`),
    })).filter((entry): entry is { chapter: Chapter; el: HTMLElement } => Boolean(entry.el))

    if (!sections.length) {
      setChapter(CHAPTERS[0]!)
      return
    }

    const visible = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id.replace('chapter-', '')
          if (entry.isIntersecting) visible.add(id)
          else visible.delete(id)
        }

        /* Resolve ties by document order rather than by event order, so a
           fast scroll cannot leave the page on the wrong hue. */
        const winner = CHAPTERS.filter((c) => visible.has(c.id)).at(-1)
        if (winner) setChapter(winner)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    for (const { el } of sections) observer.observe(el)
    return () => observer.disconnect()
  }, [pathname])

  return null
}

/** Read the active chapter reactively. Used by the status bar. */
export function useChapter(): Chapter {
  const [chapter, setChapterState] = useState<Chapter>(current)
  useEffect(() => subscribeToChapter(setChapterState), [])
  return chapter
}

export { CHAPTER_BY_ID }
