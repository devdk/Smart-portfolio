import type { ReactNode } from 'react'
import { cx } from '@/components/primitives'

/* ==========================================================================
   LAB CAPTION

   Every instrument opens with one line saying what it demonstrates, in the
   same voice and the same mono face the rest of the site uses for evidence.

   This is not the `Meta` primitive because Meta is uppercase, and uppercasing
   "temperature and top-p" turns a sentence into a label — it stops reading as
   a claim about what you are looking at. Overriding Meta's `uppercase` with a
   `normal-case` utility would also be a bet on which of two same-specificity
   Tailwind classes the generated stylesheet happens to emit last, which is not
   a bet worth taking for a text-transform.
   ========================================================================== */

export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cx(
        'mb-5 max-w-2xl font-mono text-meta leading-relaxed tracking-[0.02em] text-ink-3',
        className,
      )}
    >
      {children}
    </p>
  )
}
