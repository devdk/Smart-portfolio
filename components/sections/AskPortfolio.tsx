import { Caption } from '@/components/lab/Caption'
import { AskConsole } from '@/components/sections/AskConsole'
import { Container, Section, SectionHeading, Surface } from '@/components/primitives'
import { BM25_B, BM25_K1, CONFIDENCE_FLOOR, RETRIEVAL_STATS } from '@/lib/retrieval'

/* ==========================================================================
   ASK MY PORTFOLIO — retrieval, labelled as retrieval

   ── WHAT THIS IS ───────────────────────────────────────────────────────────
   A search engine that answers in sentences. A question is tokenised, scored
   against every chunk of this site's own corpus with BM25, and the best one or
   two sentences of the winning chunk are shown VERBATIM with a link to the page
   they came from. When nothing clears the confidence floor it says so and
   offers an email address.

   ── WHAT IT IS NOT, AND WHY THE INTERFACE INSISTS ON IT ────────────────────
   There is no language model here. Nothing is generated, summarised or
   paraphrased, and the copy on screen says all three in as many words. This is
   not modesty: a chat-shaped box in 2026 carries an assumption, and leaving that
   assumption in place would be a lie of omission on a site whose argument is
   that the person who built it tells you how things work.

   So there is deliberately NO typing animation and no token-by-token reveal.
   Both are cheap to write and both would be dishonest, because both exist to
   suggest a model composing a reply. Scoring the corpus is arithmetic over 73
   short documents — well under a millisecond — so the answer appears at once,
   which is what actually happens. The only pending state in the whole feature is
   the one real wait: fetching the index itself, once, and it is described as
   exactly that.

   ── WHY THIS FILE IS A SERVER COMPONENT ────────────────────────────────────
   Everything above the form is static: a heading, the pipeline line, the
   parameters, the chunk count. Rendering that on the server means the numbers
   come from lib/retrieval directly — the interface cannot state a corpus size
   the index does not have — while none of the corpus reaches the browser to
   produce them. The interactive part is one small island in AskConsole.tsx, and
   the index behind it is fetched on first use.

   That split is not decoration, it is the performance budget. With the corpus
   statically imported into a client component, `npm run check:budget` measured
   32.8 KB of app code on this route against a 25 KB budget — the index alone was
   a third of it, downloaded by every visitor including the ones who never ask a
   question. Deferring it took the route to 22.2 KB, inside budget, and the
   corpus now arrives only for the people who actually use the thing.

   ── WHY THIS SECTION HAS NO CHAPTER ID ─────────────────────────────────────
   lib/chapters.ts defines seven chapters and all seven are already owned:
   identity (Hero), craft (Capabilities), work (WorkShowcase), thinking
   (ThinkingTeaser), process (Process), machine (Lab) and contact (BuildWithMe).
   Two elements with `id="chapter-machine"` would be invalid HTML, and
   ChapterNarrative's `getElementById` would observe only the first, so the hue
   would stop tracking halfway down the page. This section sits inside the
   machine chapter visually, immediately after the Lab, and holds its violet
   without claiming an id — the observer keeps the last chapter it saw while
   nothing is crossing the viewport centre, so passing through here is a hold
   rather than a snap. A section is not entitled to a chapter just because it
   exists.
   ========================================================================== */

export function AskPortfolio() {
  return (
    <Section band aria-labelledby="ask-heading">
      <Container>
        <SectionHeading
          index="05 — The machine, continued"
          id="ask-heading"
          title="Ask my portfolio. It will only quote me."
          lead="A question in, real sentences of mine out, with a link to where each one is published. No model runs here — so when the corpus does not contain the answer, it says so instead of composing something plausible."
        />

        <Surface level={2} data-reveal className="p-5 sm:p-7">
          <Caption>
            retrieval over {RETRIEVAL_STATS.chunks} indexed chunks · no model, no hallucination
          </Caption>

          {/* The pipeline, stated. Every stage is a real step in
              lib/retrieval.ts, in the order it runs.

              Not the Meta primitive: Meta is uppercase, and an uppercased
              pipeline reads as a label rather than as a description of what is
              about to happen. Overriding with `normal-case` would be a bet on
              which of two same-specificity utilities Tailwind emits last —
              components/lab/Caption.tsx declined that bet for the same reason. */}
          <p className="mb-6 font-mono text-meta leading-relaxed tracking-[0.02em] text-ink-3">
            your question → tokenise → BM25 over {RETRIEVAL_STATS.chunks} chunks → best sentences
            → cited answer
          </p>

          {/* The numbers are passed in rather than imported there, so the island
              can render a score against the floor without importing the module
              that knows the floor — which is the module carrying the corpus. */}
          <AskConsole chunks={RETRIEVAL_STATS.chunks} floor={CONFIDENCE_FLOOR} />

          {/* The one part of this site that genuinely cannot work without
              JavaScript, and it says so rather than presenting a form that
              silently does nothing. The scoring happens on the visitor's
              machine by design — there is no endpoint to post to. */}
          <noscript>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-2">
              The index is fetched and scored in your browser, so this one needs JavaScript. Every
              sentence it would quote is already on the site — the CV is at{' '}
              <a href="/cv" className="text-accent underline underline-offset-[3px]">
                /cv
              </a>{' '}
              and the case studies are at{' '}
              <a href="/work" className="text-accent underline underline-offset-[3px]">
                /work
              </a>
              .
            </p>
          </noscript>
        </Surface>

        <p className="mt-6 max-w-2xl text-[0.8125rem] leading-relaxed text-ink-3">
          BM25 with k1 = {BM25_K1} and b = {BM25_B}, over {RETRIEVAL_STATS.chunks} chunks and{' '}
          {RETRIEVAL_STATS.vocabulary} distinct terms. Below a score of{' '}
          {CONFIDENCE_FLOOR.toFixed(2)} it refuses rather than answers, and{' '}
          <code className="font-mono">npm run check:retrieval</code> fails the build if that stops
          being true — fourteen questions, eight it must answer and six it must not.
        </p>
      </Container>
    </Section>
  )
}
