'use client'

import { useEffect } from 'react'
import { Button, ButtonLink, Container, Meta, Section } from '@/components/primitives'

/* ==========================================================================
   ERROR BOUNDARY

   Recoverable by design: `reset()` re-renders the segment, which for a mostly
   static site usually clears a transient failure without a full reload.

   The error message itself is NOT shown to the visitor. On a portfolio a raw
   stack trace is both useless to them and unflattering; it goes to the
   console (and to whatever monitoring is wired up) instead.
   ========================================================================== */

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[boundary]', error)
  }, [error])

  return (
    <Section className="pt-32 sm:pt-40">
      <Container>
        <Meta className="mb-6 block">Something broke</Meta>
        <h1 className="text-h1 max-w-2xl font-medium text-ink">
          That did not work.
        </h1>
        <p className="text-body-lg mt-6 max-w-lg text-ink-2">
          An unexpected error stopped this page rendering. Trying again often fixes it; if it
          does not, the rest of the site is unaffected.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/" variant="ghost">
            Back to the start
          </ButtonLink>
        </div>
        {error.digest ? (
          <p className="mt-10 font-mono text-[0.75rem] text-ink-3">
            Reference {error.digest}
          </p>
        ) : null}
      </Container>
    </Section>
  )
}
