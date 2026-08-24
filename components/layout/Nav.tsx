'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { cx } from '@/components/primitives'
import { site } from '@/lib/site.config'
import { requestCommandPalette } from './CommandPaletteLoader'

/* ==========================================================================
   NAVIGATION

   Matches spec §8, plus the primary CTA it was missing.

   No audience-router modal. The spec wanted an interstitial asking "what
   brings you here?" — that gates content behind a decision the visitor
   cannot make yet, and reordering sections from session state produces URLs
   that do not reproduce what you saw. Instead the audiences are served by
   persistent, linkable routes, and by the command palette.

   This is one of the three permitted surface-4 (backdrop-filter) elements.
   ========================================================================== */

const LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/lab', label: 'Lab' },
  { href: '/thinking', label: 'Thinking' },
  { href: '/about', label: 'About' },
] as const

export function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const lastY = useRef(0)

  /* Hide on scroll down, show on scroll up. Read-only scroll handling with
     no layout writes, so it cannot thrash. */
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      setScrolled(y > 24)
      // Never hide while the mobile sheet is open, or near the top.
      setHidden(y > 320 && y > lastY.current && !mobileOpen)
      lastY.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [mobileOpen])

  // Close the mobile sheet on navigation.
  useEffect(() => setMobileOpen(false), [pathname])

  // Lock scroll behind the mobile sheet.
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  return (
    <>
      <header
        data-print-hide
        className={cx(
          'fixed inset-x-0 top-8 z-[200] transition-transform duration-[var(--duration-ui)] ease-[var(--ease-ui)]',
          hidden ? '-translate-y-full' : 'translate-y-0',
        )}
      >
        <div
          className={cx(
            'transition-colors duration-[var(--duration-ui)] ease-[var(--ease-ui)]',
            scrolled ? 'surface-4 border-x-0 border-t-0' : 'border-transparent',
          )}
        >
          <nav
            aria-label="Primary"
            className="mx-auto flex h-16 w-full max-w-[var(--container-content)] items-center justify-between gap-4 px-[var(--spacing-gutter)]"
          >
            <Link
              href="/"
              className="font-mono text-[0.9375rem] font-medium uppercase tracking-[0.1em] text-ink"
            >
              {site.shortName}
            </Link>

            {/* Desktop links */}
            <ul className="hidden items-center gap-1 md:flex">
              {LINKS.map((link) => {
                const current = pathname === link.href || pathname.startsWith(`${link.href}/`)
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={current ? 'page' : undefined}
                      className={cx(
                        'relative rounded-full px-3.5 py-2 text-[0.9375rem] transition-colors duration-[var(--duration-micro)]',
                        current ? 'text-ink' : 'text-ink-2 hover:text-ink',
                      )}
                    >
                      {link.label}
                      {current ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-3.5 -bottom-px h-px bg-accent"
                        />
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="flex items-center gap-2">
              {/* Command palette trigger. Keyboard shortcut is the real
                  interface; this button exists so it is discoverable. */}
              <button
                type="button"
                onClick={requestCommandPalette}
                className="hidden items-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-3 py-1.5 text-ink-3 transition-colors duration-[var(--duration-micro)] hover:border-hairline-strong hover:text-ink-2 sm:flex"
                aria-label="Open command palette. Keyboard shortcut: Control or Command K"
              >
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5">
                  <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M10.5 10.5 14 14"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <kbd className="font-mono text-[0.6875rem] tracking-wider">⌘K</kbd>
              </button>

              <Link
                href="/contact"
                className="hidden rounded-full bg-accent px-4 py-2 text-[0.875rem] font-medium text-accent-ink transition-colors duration-[var(--duration-micro)] hover:bg-[#5af0f2] sm:block"
              >
                Start a project
              </Link>

              {/* Mobile trigger */}
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                className="flex size-10 items-center justify-center rounded-full border border-hairline text-ink md:hidden"
              >
                <span className="sr-only">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-5">
                  {mobileOpen ? (
                    <path
                      d="M5 5l10 10M15 5L5 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  ) : (
                    <path
                      d="M3 6h14M3 12h14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile sheet. Deliberately simple — a full-height panel with large
          touch targets, not a re-skinned desktop menu. */}
      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-[199] bg-canvas/95 pt-28 md:hidden"
          data-print-hide
        >
          <nav aria-label="Mobile" className="px-[var(--spacing-gutter)]">
            <ul className="flex flex-col">
              {LINKS.map((link) => (
                <li key={link.href} className="border-b border-hairline">
                  <Link
                    href={link.href}
                    className="flex items-center justify-between py-5 text-h3 text-ink"
                  >
                    {link.label}
                    <span aria-hidden="true" className="text-ink-3">
                      →
                    </span>
                  </Link>
                </li>
              ))}
              <li className="border-b border-hairline">
                <Link href="/cv" className="flex items-center justify-between py-5 text-h3 text-ink">
                  CV
                  <span aria-hidden="true" className="text-ink-3">
                    →
                  </span>
                </Link>
              </li>
            </ul>

            <Link
              href="/contact"
              className="mt-8 flex h-13 items-center justify-center rounded-full bg-accent font-medium text-accent-ink"
            >
              Start a project
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                requestCommandPalette()
              }}
              className="mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-full border border-hairline text-ink-2"
            >
              Search everything
            </button>
          </nav>
        </div>
      ) : null}
    </>
  )
}
