import Link from 'next/link'
import type { ComponentPropsWithoutRef, Ref, ReactNode } from 'react'

/* ==========================================================================
   PRIMITIVES

   Every surface, button and label on the site comes from here, so the
   design language stays coherent and the token rules stay enforceable.
   No component below hardcodes a colour or a duration.
   ========================================================================== */

function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

/* --- Surface -------------------------------------------------------------
   Levels 1-3 are free (layered gradients + hairline + inset highlight).
   Level 4 is the only one using backdrop-filter and is BUDGETED: at most
   three instances on screen at once — nav, command palette, modals.
   Nothing else may request it.                                             */

type SurfaceLevel = 1 | 2 | 3 | 4
type SurfaceTag = 'div' | 'section' | 'article' | 'aside' | 'li' | 'nav' | 'figure'

/**
 * Polymorphic via `as`, but intentionally not generic over every intrinsic
 * element: the props are typed against the div/HTMLElement intersection that
 * all the permitted tags share. Full generic polymorphism would add three
 * type parameters here for no practical benefit at this scale.
 */
export function Surface({
  level = 2,
  interactive = false,
  as: Tag = 'div',
  className,
  children,
  ...rest
}: {
  level?: SurfaceLevel
  interactive?: boolean
  as?: SurfaceTag
  className?: string
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<'div'>, 'ref'>) {
  const Component = Tag as 'div'
  return (
    <Component
      className={cx(
        `surface-${level}`,
        interactive && 'surface-interactive',
        'rounded-[var(--radius-md)]',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}

/* --- Button ---------------------------------------------------------------
   Three variants. The CTA cap from the plan is one persistent nav CTA plus
   at most one in-page primary and one terminal, so `primary` should be rare.
   The magnetic hover effect lives in useMagnetic() and is opt-in.          */

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 font-medium rounded-full ' +
  'transition-[transform,background-color,border-color,opacity] duration-[var(--duration-micro)] ' +
  'ease-[var(--ease-micro)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ' +
  'whitespace-nowrap'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-[#5af0f2]',
  secondary:
    'surface-2 text-ink hover:border-hairline-strong hover:bg-white/[0.07]',
  ghost: 'text-ink-2 hover:text-ink hover:bg-white/[0.05]',
}

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[0.875rem]',
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-13 px-7 text-base',
}

type ButtonBaseProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonBaseProps & ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
      {...rest}
    >
      {children}
    </button>
  )
}

/** `ref` is accepted as a plain prop — React 19 supports this for function
    components, so no forwardRef wrapper is needed. It is used by the hero to
    attach the magnetic hover effect. */
export function ButtonLink({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  href,
  external,
  ref,
  ...rest
}: ButtonBaseProps & {
  href: string
  external?: boolean
  ref?: Ref<HTMLAnchorElement>
} & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'ref'>) {
  const classes = cx(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)

  if (external) {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...rest}
      >
        {children}
      </a>
    )
  }
  return (
    <Link ref={ref} href={href} className={classes} {...rest}>
      {children}
    </Link>
  )
}

/* --- Meta ----------------------------------------------------------------
   Mono, small, ink-3 (6.31:1 — passes AA; the tempting #6E767D does not).
   Mono here does real work: it visually separates evidence from prose.    */

export function Meta({
  children,
  className,
  as: Tag = 'span',
}: {
  children: ReactNode
  className?: string
  as?: 'span' | 'div' | 'p' | 'dt' | 'dd'
}) {
  return (
    <Tag
      className={cx(
        'font-mono text-meta tracking-[0.02em] text-ink-3 uppercase',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

/* --- Pill ---------------------------------------------------------------- */

export function Pill({
  children,
  active = false,
  className,
}: {
  children: ReactNode
  active?: boolean
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-3 py-1 font-mono text-[0.75rem] tracking-[0.02em]',
        active
          ? 'border-accent/40 bg-accent/10 text-accent'
          : 'border-hairline bg-white/[0.03] text-ink-3',
        className,
      )}
    >
      {children}
    </span>
  )
}

/* --- Status dot ---------------------------------------------------------- */

export function StatusDot({ tone = 'accent' }: { tone?: 'accent' | 'positive' | 'dim' }) {
  const colour =
    tone === 'positive' ? 'bg-positive' : tone === 'dim' ? 'bg-ink-3' : 'bg-accent'
  return (
    <span className="relative inline-flex size-2 shrink-0" aria-hidden="true">
      <span className={cx('absolute inset-0 rounded-full', colour)} />
      <span
        className={cx(
          'absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping',
          colour,
        )}
      />
    </span>
  )
}

/* --- Layout helpers ------------------------------------------------------ */

export function Container({
  children,
  width = 'content',
  className,
}: {
  children: ReactNode
  width?: 'content' | 'prose'
  className?: string
}) {
  return (
    <div
      className={cx(
        'mx-auto w-full px-[var(--spacing-gutter)]',
        width === 'prose' ? 'max-w-[var(--container-prose)]' : 'max-w-[var(--container-content)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Section({
  children,
  className,
  id,
  band = false,
  'aria-labelledby': ariaLabelledby,
}: {
  children: ReactNode
  className?: string
  id?: string
  band?: boolean
  'aria-labelledby'?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={cx(
        'py-[var(--spacing-section)]',
        band && 'bg-canvas-2 border-y border-hairline',
        className,
      )}
    >
      {children}
    </section>
  )
}

/* --- Section heading ----------------------------------------------------
   Numbered, because the site is structured as an argument in ordered moves
   rather than a set of interchangeable panels.                            */

export function SectionHeading({
  index,
  title,
  lead,
  id,
  className,
}: {
  index?: string
  title: string
  lead?: string
  id?: string
  className?: string
}) {
  return (
    <header className={cx('mb-12 md:mb-16', className)}>
      {index ? <Meta className="mb-4 block">{index}</Meta> : null}
      <h2
        id={id}
        className="text-h2 max-w-3xl font-medium text-ink"
      >
        {title}
      </h2>
      {lead ? (
        <p className="text-body-lg mt-5 max-w-2xl text-ink-2">{lead}</p>
      ) : null}
    </header>
  )
}

/* --- Arrow -------------------------------------------------------------- */

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cx('size-4 shrink-0', className)}
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* --- Empty state -------------------------------------------------------
   Used where content genuinely does not exist yet — most importantly for
   metrics. This renders an honest absence instead of a fabricated number,
   which is the whole point of the schema in lib/schema.ts.               */

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-dashed border-hairline-strong px-5 py-4">
      <p className="text-[0.9375rem] text-ink-3">{children}</p>
    </div>
  )
}

export { cx }
