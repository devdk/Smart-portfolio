'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cx } from '@/components/primitives'

/* ==========================================================================
   EVIDENCE ROWS — a unit chart of the whole body of work

   ── WHAT THIS REPLACED, AND WHY ───────────────────────────────────────────

   A 32-tile grid where each tile carried a 3×3 pattern derived from a hash of
   the project slug. Two things were wrong with it, and they were both fatal:

   1. The patterns looked like dice, dominoes or braille — a visual that asks
      to be decoded and has nothing to decode. Meaningless decoration is worse
      than none, because it spends the visitor's attention and returns
      nothing.

   2. Thirty-two was an arbitrary number, so twenty-one tiles were filler.
      Eleven filled cells out of thirty-two does not read as "prolific", it
      reads as thirty-four per cent complete. A progress bar.

   Here, every cell is one real project and every row is full.

   ── WHY THREE ROWS AND NOT ONE GRID ──────────────────────────────────────

   Because the counts cannot be added together. The CV says "16+ freelance
   projects", "12+ agency collaborations" and names four systems built end to
   end — and those groups OVERLAP, because the agency work and the systems are
   partly the same projects seen from different angles. Summing them would
   invent a number, which is the one thing this codebase is built to refuse.

   Three separate rows state each of the CV's own figures and imply no total.
   And the row LENGTHS carry the information: you see 16 against 12 against 4
   as lengths before reading a word, and the shortest row is the most
   impressive one — which is the whole argument of the site in one shape.

   ── WHY NAMED CELLS ARE SQUARES AND UNNAMED ONES ARE DOTS ────────────────

   The first version of this made named projects solid and unnamed ones a
   near-black tint of the row colour. That looked right in the abstract and
   was wrong on the screen: the freelance row has one named project out of
   sixteen, so it rendered as a single grey square followed by fifteen almost
   invisible ones. Which is the SAME failure as the 32-tile grid — a mostly
   empty row reads as incompleteness, not as volume.

   So the distinction moved off tone and onto SHAPE. Every cell in a row now
   carries the row's colour at full presence; a cell you can open is a square,
   a cell that stays anonymous is a dot. The row is visibly full either way,
   the difference is legible without colour vision (WCAG 1.4.1), and one
   legend line explains it once instead of a sentence per row.

   An unnamed cell is not a placeholder waiting to be filled; it is a real
   project whose client has not agreed to be listed. Inventing a logo wall
   would have been the alternative.
   ========================================================================== */

export type Cell = {
  slug: string
  title: string
  /** Client name, or the anonymised descriptor. */
  client: string
  year: number
  sector?: string
  href?: string
}

export type Row = {
  id: string
  label: string
  count: number
  approximate: boolean
  note: string
  named: Cell[]
}

/* One accent family at three intensities rather than three unrelated hues.
   The rows are three views of one career, not three categories of thing — and
   the brightest row being the shortest is the point.

   `dim` is the palette's own --color-accent-dim, which is a real token with a
   measured value, not an alpha guess. Everything here is a fill on canvas
   rather than text, so 1.4.3 does not apply; the interactive cells clear
   1.4.11's 3:1 against canvas at these values. */
const ROW_TONE: Record<string, { named: string; dot: string; num: string }> = {
  freelance: { named: 'bg-accent/50', dot: 'bg-accent-dim', num: 'text-ink-2' },
  agency: { named: 'bg-accent/75', dot: 'bg-accent-dim', num: 'text-accent' },
  products: { named: 'bg-accent-bright', dot: 'bg-accent-dim', num: 'text-accent-bright' },
}

/* 21px minimum with a 4px gap is not a taste decision. WCAG 2.2's Target
   Size (Minimum) is met here through its SPACING exception: a 24px circle
   centred on each cell must not intersect its neighbour's, which needs a
   24px pitch. 21 + 4 = 25. Smaller cells fit sixteen on one line at 390px
   and fail the criterion; these wrap to two lines instead, which still reads
   as "more" beside a row of twelve. */
const CELL = 'size-[clamp(21px,4.4vw,22px)]'

export function EvidenceRows({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<Cell | null>(null)
  const [activeRow, setActiveRow] = useState<string | null>(null)

  return (
    <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,32rem)_minmax(0,22rem)] lg:items-start">
      <div>
        <div className="flex flex-col gap-7">
          {rows.map((row) => {
            const tone = ROW_TONE[row.id] ?? ROW_TONE.freelance!
            const anonymous = Math.max(0, row.count - row.named.length)
            const dimmed = activeRow !== null && activeRow !== row.id

            return (
              <div
                key={row.id}
                className={cx(
                  'grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4',
                  'transition-opacity duration-[var(--duration-ui)] ease-[var(--ease-ui)]',
                  dimmed ? 'opacity-60' : 'opacity-100',
                )}
                onPointerEnter={() => setActiveRow(row.id)}
                onPointerLeave={() => setActiveRow(null)}
              >
                {/* The count, right-aligned in its own column so 16 / 12 / 4
                    stack as a descending ladder rather than three loose
                    numbers at three different x-positions. */}
                <span
                  className={cx(
                    'pt-px text-right font-mono text-[1.75rem] leading-none tabular-nums',
                    tone.num,
                  )}
                >
                  {row.count}
                  {row.approximate ? <span className="text-[1rem]">+</span> : null}
                </span>

                <div className="min-w-0">
                  <p className="mb-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.09em] text-ink-3">
                    {row.label}
                  </p>

                  {/* A row is a real list, so it is marked up as one. Named
                      cells are buttons; anonymous ones are decorative marks
                      whose count is already stated by the number beside them. */}
                  <ul className="flex flex-wrap items-center gap-1">
                    {row.named.map((cell) => {
                      const isSelected = selected?.slug === cell.slug
                      return (
                        <li key={cell.slug}>
                          <button
                            type="button"
                            onClick={() => setSelected(isSelected ? null : cell)}
                            aria-pressed={isSelected}
                            aria-label={`${cell.title} — ${cell.client}, ${cell.year}`}
                            className={cx(
                              'block rounded-[3px]',
                              CELL,
                              tone.named,
                              'transition-transform duration-[var(--duration-micro)] ease-[var(--ease-micro)]',
                              'hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
                              isSelected &&
                                'scale-110 ring-2 ring-[var(--color-accent-bright)] ring-offset-2 ring-offset-[var(--color-canvas)]',
                            )}
                          />
                        </li>
                      )
                    })}

                    {Array.from({ length: anonymous }).map((_, i) => (
                      <li
                        key={`anon-${row.id}-${i}`}
                        aria-hidden="true"
                        className={cx('grid place-items-center', CELL)}
                      >
                        <span className={cx('block size-[38%] rounded-full', tone.dot)} />
                      </li>
                    ))}
                  </ul>

                  <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-3">{row.note}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* The legend, once, instead of an anonymity sentence per row. And the
            arithmetic objection answered where someone who has it will look,
            without printing a paragraph at everyone who does not. */}
        <p className="mt-7 text-[0.8125rem] leading-relaxed text-ink-3">
          Squares are written up on this site. Dots are real projects whose clients have not
          agreed to be named.
        </p>
        <details className="group mt-2">
          <summary className="cursor-pointer text-[0.8125rem] text-ink-3 underline decoration-hairline-strong underline-offset-2 transition-colors hover:text-ink-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
            Why there is no total
          </summary>
          <p className="mt-2 max-w-prose text-[0.8125rem] leading-relaxed text-ink-3">
            The three figures come from the CV, and its groups overlap — the systems built end to
            end were also delivered through the agency. Adding the rows would produce a number
            that describes nothing, so the rows are shown separately and the arithmetic is left to
            you.
          </p>
        </details>
      </div>

      {/* The detail panel. Present at all times on wide screens, which is what
          turns the rows into something you operate rather than something you
          read: the right-hand column stops being dead space, and selecting a
          cell changes what is already there instead of pushing the page down. */}
      <div
        aria-live="polite"
        className={cx(
          'surface-2 rounded-[var(--radius-md)] border border-hairline px-5 py-5',
          'lg:sticky lg:top-24 lg:min-h-[13rem]',
          /* On a narrow screen the resting panel is chrome sitting under a
             legend that already says what the squares do. It appears when
             there is something to show. On wide screens it stays, because the
             space it occupies would otherwise be empty. */
          selected ? 'block' : 'hidden lg:block',
        )}
      >
        {selected ? (
          <>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.09em] text-ink-3">
              {selected.year}
              {selected.sector ? ` · ${selected.sector}` : ''}
            </p>
            <p className="mt-3 text-[1.0625rem] font-medium leading-snug text-ink">
              {selected.title}
            </p>
            <p className="mt-1 text-[0.875rem] text-ink-2">{selected.client}</p>
            <div className="mt-5 flex items-center gap-4">
              {selected.href ? (
                <Link
                  href={selected.href}
                  className="text-[0.875rem] text-accent underline decoration-hairline-strong underline-offset-2 transition-colors hover:decoration-current"
                >
                  Read the case study
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="ml-auto text-[0.8125rem] text-ink-3 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                Clear
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.09em] text-ink-3">
              Pick a project
            </p>
            <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-ink-2">
              Every square is one project with a write-up behind it — the problem, the decisions
              and what it cost. Click any of them and it opens here.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
