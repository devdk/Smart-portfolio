import { ButtonLink, Container, Meta, Section } from '@/components/primitives'

/* Error copy per spec §50 — subtle and professional, not jokey. */
export default function NotFound() {
  return (
    <Section className="pt-32 sm:pt-40">
      <Container>
        <Meta className="mb-6 block">404</Meta>
        <h1 className="text-h1 max-w-2xl font-medium text-ink">
          You found a page that doesn&rsquo;t exist.
        </h1>
        <p className="text-body-lg mt-6 max-w-lg text-ink-2">
          Either it moved, or the link was wrong. Both are recoverable.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="primary">
            Back to the start
          </ButtonLink>
          <ButtonLink href="/work" variant="ghost">
            See the work
          </ButtonLink>
        </div>
        <p className="mt-10 font-mono text-[0.8125rem] text-ink-3">
          Or press <kbd className="text-ink-2">⌘K</kbd> to search everything.
        </p>
      </Container>
    </Section>
  )
}
