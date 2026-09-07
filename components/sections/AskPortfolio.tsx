import Link from 'next/link'
import { Container, Meta, Section } from '@/components/primitives'
import { AskConsole } from '@/components/sections/AskConsole'
import { BM25_B, BM25_K1, CONFIDENCE_FLOOR, RETRIEVAL_STATS } from '@/lib/retrieval'

/* ==========================================================================
   ASK — the section around the island

   ── THE CLAIM THIS SECTION MAKES, AND WHY IT LEADS ────────────────────────

   "No model. No hallucination."

   Every portfolio chatbot shipped in the last two years is a wrapper around a
   hosted model, and every one of them will, given the right question,
   confidently invent a client name or a number. This one cannot: it scores the
   question against the site's own sentences and quotes one, or it declines.
   There is no generator in the page to invent with.

   That is rare, it is checkable, and — unusually for an engineering property —
   a non-technical visitor understands it immediately. So it is the headline
   rather than a footnote, and the mechanism that earns it is one click away
   rather than printed over the top of it.

   It is also a COMMITMENT. The day a language model is added to this feature,
   the claim stops being true and has to come down with it.

   ── WHY THE PIPELINE IS BEHIND A DISCLOSURE ───────────────────────────────

   `your question → tokenise → BM25 over N chunks → best sentences → cited
   answer` used to sit above the input, permanently. It is a good sentence and
   the right people love it — but it is a diagram, and a diagram in front of a
   question box tells most visitors this is a tool for somebody else. Behind
   "How this works" it reaches everyone who wants it and nobody who does not.

   That disclosure is also the Lab's door, which is the right place for it: the
   people who open a panel about BM25 are exactly the people who want to see a
   tokeniser and a vector projection.
   ========================================================================== */

export function AskPortfolio() {
  return (
    <Section band aria-labelledby="ask-heading">
      <Container>
        <div className="max-w-2xl">
          <Meta className="mb-5 block">Ask</Meta>
          <h2 id="ask-heading" className="text-h2 font-medium text-ink">
            No model. No hallucination.
          </h2>
          <p className="text-body-lg mt-5 text-ink-2">
            Ask anything about the work. It answers by quoting sentences already published on
            this site and showing you where each one came from — and when the answer isn&rsquo;t
            written down, it says so rather than composing something plausible.
          </p>
        </div>

        <div data-reveal className="mt-10 max-w-3xl">
          <AskConsole chunks={RETRIEVAL_STATS.chunks} floor={CONFIDENCE_FLOOR} />
        </div>

        {/* The mechanism, for the people who want it. The only mono type in
            this section lives in here. */}
        <details data-reveal className="mt-10 max-w-3xl">
          <summary className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-hairline px-4 py-2 text-[0.875rem] text-ink-2 transition-colors duration-[var(--duration-micro)] hover:border-hairline-strong hover:text-ink">
            How this works
          </summary>

          <div className="mt-5 flex flex-col gap-4 border-l-2 border-hairline pl-5">
            <p className="font-mono text-[0.8125rem] leading-relaxed text-ink-2">
              your question → tokenise → BM25 over {RETRIEVAL_STATS.chunks} passages → best
              sentences → cited answer
            </p>

            <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink-2">
              Okapi BM25 with k1&nbsp;=&nbsp;{BM25_K1} and b&nbsp;=&nbsp;{BM25_B}, over{' '}
              {RETRIEVAL_STATS.chunks} passages and {RETRIEVAL_STATS.vocabulary} distinct terms.
              Below a score of {CONFIDENCE_FLOOR.toFixed(2)} it declines instead of quoting the
              closest thing it found. The index is fetched into your browser on the first
              question and scored there — open the network tab and you will see the corpus
              arrive, and no request carrying an answer back.
            </p>

            <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink-2">
              <code className="font-mono text-[0.875rem]">npm run check:retrieval</code> fails
              the build if the behaviour changes. The refusals are the half that matters — a
              system that answers everything cannot prove it never invents.
            </p>

            <p className="text-[0.9375rem] leading-relaxed text-ink-2">
              <Link
                href="/lab"
                className="text-accent underline decoration-accent/40 underline-offset-2 transition-colors duration-[var(--duration-micro)] hover:decoration-current"
              >
                See the tokeniser, the vectors and the sampling running
              </Link>{' '}
              — the same machinery, taken apart.
            </p>
          </div>
        </details>
      </Container>
    </Section>
  )
}
