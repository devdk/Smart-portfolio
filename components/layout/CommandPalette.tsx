'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SearchEntry } from '@/lib/content'
import { cx } from '@/components/primitives'

/* ==========================================================================
   COMMAND PALETTE  (spec §9)

   This does more work than its size suggests. It replaces two other systems:

   1. The audience router (§12). Rather than gating the site behind a modal
      asking "what brings you here?", anyone can type what they came for.

   2. The AI assistant (§27), for V1. Fuzzy search over every project,
      decision, incident, technology and page answers most of the questions
      an assistant would — at zero hallucination risk and zero running cost.
      The assistant can arrive in V3 once there is content worth grounding.

   Accessibility is the point of a palette, not a bonus:
     - role="dialog" + aria-modal, labelled
     - focus moves in on open and is restored on close
     - focus is trapped while open
     - combobox/listbox semantics with aria-activedescendant
     - Escape closes, arrows navigate, Enter selects, Home/End jump
     - the trigger is a real button, so it works without the shortcut

   This is one of the three permitted surface-4 (backdrop-filter) elements.
   ========================================================================== */

/* --- Matching ------------------------------------------------------------
   Two different strategies, deliberately.

   TITLES get true fuzzy subsequence matching, because that is where typo
   tolerance and initialism matching are worth having ("cs" -> "case study").

   KEYWORD BLOBS get substring matching only. An earlier version ran the same
   subsequence match over keywords, and because those blobs are long — a
   whole incident symptom and cause concatenated — almost any short query
   found its letters scattered somewhere inside. Typing "shop" surfaced an
   unrelated performance incident. Subsequence matching does not survive long
   haystacks, so keywords are matched as substrings, with a bonus when the
   hit lands on a word boundary.

   Small and predictable, and it avoids shipping a search library for a few
   hundred entries.                                                        */

function subsequenceScore(needle: string, haystack: string): number {
  if (!needle) return 1
  // Subsequence matching degrades badly past short strings; titles only.
  if (haystack.length > 80) return 0

  let score = 0
  let cursor = 0
  let streak = 0

  for (const char of needle) {
    let found = -1
    for (let i = cursor; i < haystack.length; i++) {
      if (haystack[i] === char) {
        found = i
        break
      }
    }
    if (found === -1) return 0

    const atBoundary =
      found === 0 || haystack[found - 1] === ' ' || haystack[found - 1] === '-'
    streak = found === cursor ? streak + 1 : 0
    score += 1 + streak * 2 + (atBoundary ? 2.5 : 0)
    cursor = found + 1
  }

  // Normalise so a short title beats a long one on the same query.
  return score / Math.sqrt(haystack.length)
}

function substringScore(needle: string, haystack: string): number {
  if (!needle) return 1
  const at = haystack.indexOf(needle)
  if (at === -1) return 0

  const atBoundary = at === 0 || haystack[at - 1] === ' ' || haystack[at - 1] === '-'
  // Longer matched fragments are stronger signals; word starts stronger still.
  return needle.length * (atBoundary ? 1.4 : 0.8)
}

const ACTIONS: SearchEntry[] = [
  {
    id: 'action-contact',
    title: 'Start a project',
    subtitle: 'Tell me what you are trying to build',
    group: 'Actions',
    href: '/contact',
    keywords: 'start project hire contact quote brief build with me',
  },
  {
    id: 'action-cv',
    title: 'Download résumé',
    subtitle: 'PDF',
    group: 'Actions',
    href: '/cv',
    keywords: 'resume cv download recruiter hiring pdf',
  },
]

const GROUP_ORDER: SearchEntry['group'][] = [
  'Actions',
  'Projects',
  'Thinking',
  'Technologies',
  'Pages',
]

export function CommandPalette({
  entries,
  openSignal = 0,
}: {
  entries: SearchEntry[]
  /* Incremented by the loader on every open request. Because the loader
     mounts this component lazily, an event dispatched at request time would
     arrive before this component existed — so intent is passed as a prop
     instead of over the event bus. */
  openSignal?: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const [easterEgg, setEasterEgg] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)

  const all = useMemo(() => [...ACTIONS, ...entries], [entries])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()

    const scored = all
      .map((entry) => ({
        entry,
        score: Math.max(
          subsequenceScore(needle, entry.title.toLowerCase()) * 2,
          substringScore(needle, entry.keywords),
        ),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)

    const limited = needle ? scored.slice(0, 12) : scored.slice(0, 14)

    // Group, preserving relevance order within each group.
    const groups = new Map<SearchEntry['group'], SearchEntry[]>()
    for (const { entry } of limited) {
      groups.set(entry.group, [...(groups.get(entry.group) ?? []), entry])
    }

    const ordered: { group: SearchEntry['group']; items: SearchEntry[] }[] = []
    for (const group of GROUP_ORDER) {
      const items = groups.get(group)
      if (items?.length) ordered.push({ group, items })
    }
    return ordered
  }, [all, query])

  const flat = useMemo(() => results.flatMap((g) => g.items), [results])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setIndex(0)
    setEasterEgg(null)
    restoreFocusTo.current?.focus()
  }, [])

  const openPalette = useCallback(() => {
    restoreFocusTo.current = document.activeElement as HTMLElement | null
    setOpen(true)
  }, [])

  /* Global shortcut. Cmd/Ctrl+K, plus "/" when not already typing. */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      if (isShortcut) {
        event.preventDefault()
        setOpen((wasOpen) => {
          if (wasOpen) return false
          restoreFocusTo.current = document.activeElement as HTMLElement | null
          return true
        })
        return
      }

      if (event.key === '/' && !typing && !open) {
        event.preventDefault()
        openPalette()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('command-palette:request', openPalette)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('command-palette:request', openPalette)
    }
  }, [open, openPalette])

  /* Open whenever the loader signals a new request, including the very first
     one that caused this component to mount. */
  useEffect(() => {
    if (openSignal > 0) openPalette()
  }, [openSignal, openPalette])

  // Focus the input on open, and lock background scroll.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const raf = requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      document.body.style.overflow = previous
      cancelAnimationFrame(raf)
    }
  }, [open])

  // Reset the highlighted row whenever the result set changes.
  useEffect(() => setIndex(0), [query])

  // Keep the active row in view without smooth-scrolling the whole panel.
  useEffect(() => {
    if (!open) return
    const active = listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [index, open])

  const select = useCallback(
    (entry: SearchEntry) => {
      close()
      router.push(entry.href)
    },
    [close, router],
  )

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'ArrowDown':
        event.preventDefault()
        setIndex((i) => (flat.length ? (i + 1) % flat.length : 0))
        break
      case 'ArrowUp':
        event.preventDefault()
        setIndex((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0))
        break
      case 'Home':
        event.preventDefault()
        setIndex(0)
        break
      case 'End':
        event.preventDefault()
        setIndex(Math.max(0, flat.length - 1))
        break
      case 'Enter': {
        event.preventDefault()
        // Easter egg (one of exactly two on the site). Discovered, not advertised.
        if (query.trim().toLowerCase() === 'sudo hire dheeraj') {
          setEasterEgg('Permission granted.')
          setQuery('')
          return
        }
        const chosen = flat[index]
        if (chosen) select(chosen)
        break
      }
      case 'Tab': {
        // Focus trap: the input and the close button are the only tab stops.
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'input, button:not([disabled])',
        )
        if (!focusables?.length) return
        const first = focusables[0]!
        const last = focusables[focusables.length - 1]!
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
        break
      }
    }
  }

  if (!open) return null

  let cursor = -1

  return (
    <div
      className="fixed inset-0 z-[400] flex items-start justify-center p-4 pt-[12vh] sm:pt-[16vh]"
      data-print-hide
    >
      {/* Scrim. A plain click target, and it is not the only way out — Escape
          works, and there is a labelled close button. */}
      <button
        type="button"
        aria-label="Close command palette"
        onClick={close}
        className="absolute inset-0 cursor-default bg-canvas/88"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="palette-label"
        className="surface-4 relative w-full max-w-xl overflow-hidden rounded-[var(--radius-lg)] shadow-[0_32px_80px_-24px_rgb(0_0_0/0.85)]"
      >
        <h2 id="palette-label" className="sr-only">
          Search this portfolio
        </h2>

        <div className="flex items-center gap-3 border-b border-hairline px-4">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4 text-ink-3">
            <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search projects, decisions, technologies…"
            className="h-14 flex-1 bg-transparent text-[1.0625rem] text-ink outline-none placeholder:text-ink-3"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-autocomplete="list"
            aria-activedescendant={flat[index] ? `palette-option-${flat[index].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />

          <button
            type="button"
            onClick={close}
            className="rounded border border-hairline px-2 py-1 font-mono text-[0.6875rem] text-ink-3 transition-colors hover:text-ink-2"
          >
            ESC
          </button>
        </div>

        <div ref={listRef} className="max-h-[min(24rem,50vh)] overflow-y-auto overscroll-contain">
          {easterEgg ? (
            <p className="px-4 py-6 font-mono text-[0.9375rem] text-accent">{easterEgg}</p>
          ) : null}

          {flat.length === 0 ? (
            <p className="px-4 py-8 text-center text-[0.9375rem] text-ink-3">
              Nothing matches “{query}”.
            </p>
          ) : (
            <div id="palette-list" role="listbox" aria-label="Search results">
              {results.map(({ group, items }) => (
                <div key={group} className="py-1.5">
                  <div className="px-4 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-3">
                    {group}
                  </div>
                  {items.map((entry) => {
                    cursor += 1
                    const isActive = cursor === index
                    const rowIndex = cursor
                    return (
                      <div
                        key={entry.id}
                        id={`palette-option-${entry.id}`}
                        role="option"
                        aria-selected={isActive}
                        data-active={isActive}
                        onClick={() => select(entry)}
                        onMouseMove={() => setIndex(rowIndex)}
                        className={cx(
                          'mx-1.5 flex cursor-pointer items-center justify-between gap-4 rounded-[var(--radius-sm)] px-2.5 py-2.5',
                          isActive ? 'bg-accent/[0.12]' : 'bg-transparent',
                        )}
                      >
                        <span className="min-w-0">
                          <span
                            className={cx(
                              'block truncate text-[0.9375rem]',
                              isActive ? 'text-ink' : 'text-ink-2',
                            )}
                          >
                            {entry.title}
                          </span>
                          <span className="block truncate text-[0.8125rem] text-ink-3">
                            {entry.subtitle}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={cx(
                            'shrink-0 font-mono text-[0.75rem]',
                            isActive ? 'text-accent' : 'text-transparent',
                          )}
                        >
                          ↵
                        </span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-hairline px-4 py-2.5 font-mono text-[0.6875rem] text-ink-3">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  )
}
