'use client'

import { useId, useRef, useState } from 'react'
import Link from 'next/link'
import { site } from '@/lib/site.config'
import { Button, Meta, cx } from '@/components/primitives'
import type { AskChunk } from '@/content/ask-corpus'
import type { Answer } from '@/lib/retrieval'

/* ==========================================================================
   ASK CONSOLE — the interactive island of components/sections/AskPortfolio.tsx

   Everything static lives in that server component; this is the part that has
   to run in the browser: an input, four suggestions, and a transcript.

   ── WHY THE INDEX IS IMPORTED AT RUNTIME AND NOT AT THE TOP ────────────────
   Both imports above are TYPE-ONLY, which means they are erased at compile time
   and cost nothing. lib/retrieval carries the corpus — 73 chunks of prose plus
   the term tables built from it — and a static import would put all of it in
   this route's first-load JavaScript. Measured: 32.8 KB of app code against a
   25 KB budget, paid by every visitor whether or not they ask anything.

   So the module is fetched on first use, in one chunk, and cached in a
   module-scope promise for the rest of the session. The cost lands on the
   people who use the feature, which is the only place it belongs. It is also
   warmed on focus and on hover, so by the time a question is finished being
   typed the index is usually already there.

   ── WHY THIS IS NOT A SERVER ACTION ────────────────────────────────────────
   Scoring on the server would keep the corpus off the client entirely and cost
   less again. It would also put a network round trip between a keystroke and an
   answer that takes microseconds to compute, and make the feature stop working
   offline — for a static site whose whole claim is that everything on it is
   inspectable, shipping the index and doing the arithmetic in front of the
   visitor is worth 10 KB. Open the network tab: the chunk that arrives is the
   corpus, and the answer is not a response from anywhere.
   ========================================================================== */

/** Loaded once, then reused. `??=` so concurrent calls share one request. */
let indexPromise: Promise<typeof import('@/lib/retrieval')> | null = null

function loadIndex(): Promise<typeof import('@/lib/retrieval')> {
  indexPromise ??= import('@/lib/retrieval')
  return indexPromise
}

/**
 * The suggested questions.
 *
 * All four are probes in the answerable half of scripts/check-retrieval.ts, so
 * `npm run check:retrieval` fails the build if any of them ever stops being
 * answerable. A suggestion chip that refuses is the worst possible first
 * impression — it teaches the visitor the feature is broken — so these are not
 * aspirational examples, they are gated behaviour.
 */
const SUGGESTIONS = [
  'What did the security audit find?',
  'How many endpoints?',
  'Does he know WordPress and React?',
  'Where is he based?',
]

/** Most recent first, and capped: an unbounded transcript would grow the page
    under the reader while they are reading it. Six is more than anyone asks. */
const TRANSCRIPT_LIMIT = 6

type Exchange = {
  id: number
  question: string
  result: Answer
}

export function AskConsole({ chunks, floor }: { chunks: number; floor: number }) {
  const [query, setQuery] = useState('')
  const [transcript, setTranscript] = useState<Exchange[]>([])
  const [loading, setLoading] = useState(false)

  /* A counter rather than an array index or a timestamp: the key has to stay
     stable as older exchanges fall off the end of the list, and Date.now()
     collides when two chips are clicked inside the same millisecond. */
  const counter = useRef(0)
  const inputId = useId()

  async function ask(question: string): Promise<void> {
    const trimmed = question.trim()
    if (trimmed.length === 0) return

    /* Only ever true while the index itself is in flight, and only on the first
       question of a session. Scoring is synchronous once it has arrived — there
       is nothing to wait for and so nothing to animate. */
    setLoading(indexPromise === null)
    try {
      const { answer } = await loadIndex()
      counter.current += 1
      setTranscript((previous) =>
        [{ id: counter.current, question: trimmed, result: answer(trimmed) }, ...previous].slice(
          0,
          TRANSCRIPT_LIMIT,
        ),
      )
      setQuery('')
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    void ask(query)
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <label htmlFor={inputId} className="block text-[0.9375rem] text-ink">
          Ask a question about Dheeraj's work
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            /* Warm the index the moment there is any sign it will be wanted, so
               the one real wait usually happens while the visitor is still
               typing. Harmless if it never gets used: one cached chunk. */
            onFocus={() => void loadIndex()}
            placeholder="try: what did the security audit find?"
            autoComplete="off"
            spellCheck={false}
            className={cx(
              'min-w-0 flex-1 rounded-[var(--radius-sm)] border border-hairline bg-white/[0.03]',
              'px-3 py-2.5 font-mono text-[0.8125rem] text-ink placeholder:text-ink-3',
              'focus:border-accent/50 focus:outline-none',
            )}
          />
          <Button type="submit" variant="secondary" size="md">
            Search the corpus
          </Button>
        </div>
      </form>

      <div className="mt-4">
        <Meta as="p" className="mb-2 block">
          questions this corpus answers
        </Meta>
        <ul className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => void ask(suggestion)}
                onPointerEnter={() => void loadIndex()}
                className={cx(
                  'rounded-full border border-hairline bg-white/[0.03] px-3 py-1.5',
                  'font-mono text-[0.75rem] text-ink-2',
                  'transition-colors duration-[var(--duration-micro)] ease-[var(--ease-micro)]',
                  'hover:border-hairline-strong hover:text-ink',
                )}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* role="log" rather than status: this is an append-only transcript, and a
          log is announced as it grows without interrupting whatever the reader is
          already hearing. The loading line lives inside it so the one real wait
          is announced too. */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Answers"
        className="mt-7 border-t border-hairline pt-6"
      >
        {loading ? (
          <p className="mb-4 font-mono text-[0.8125rem] text-ink-3">
            fetching the index · {chunks} chunks, once, then it stays in memory
          </p>
        ) : null}

        {transcript.length === 0 ? (
          <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink-2">
            Answers appear here, quoted exactly and attributed. The scorer matches words rather
            than meaning — there is no encoder in the page to turn your question into a vector —
            so naming a technology, a project or a period works better than asking it to infer.
          </p>
        ) : (
          <ol className="space-y-6">
            {transcript.map((exchange) => (
              <li key={exchange.id}>
                <ExchangeView exchange={exchange} floor={floor} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  )
}

/* --- One exchange --------------------------------------------------------- */

function ExchangeView({ exchange, floor }: { exchange: Exchange; floor: number }) {
  const { question, result } = exchange

  return (
    <article>
      <p className="text-[0.9375rem] leading-relaxed text-ink-2">
        <span className="font-mono text-ink-3">you asked · </span>
        {question}
      </p>

      {result.kind === 'answer' ? (
        <>
          {/* A blockquote, because it IS a quotation: the same sentence, from the
              page named underneath it. Nothing here was written for this
              answer. */}
          <blockquote className="mt-3 border-l-2 border-accent/50 pl-4">
            {result.sentences.map((sentence) => (
              <p key={sentence} className="text-[1.0625rem] leading-relaxed text-ink">
                {sentence}
              </p>
            ))}
          </blockquote>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <Meta>sources</Meta>
            {result.sources.map((source, index) => (
              <SourceChip key={source.id} chunk={source} quoted={index === 0} />
            ))}
          </div>

          <p className="mt-2 font-mono text-[0.75rem] leading-relaxed text-ink-3">
            matched: {result.matchedTerms.join(' ')} · bm25 {result.score.toFixed(2)} · quoted from
            the first source
          </p>
        </>
      ) : (
        <div className="mt-3 rounded-[var(--radius-sm)] border border-dashed border-hairline-strong px-4 py-3.5">
          <Meta className="mb-1.5 block">no answer in the corpus</Meta>
          <p className="text-[0.9375rem] leading-relaxed text-ink-2">{result.reason}</p>
          <p className="mt-2.5 text-[0.9375rem] text-ink-2">
            Ask him directly:{' '}
            <a
              href={`mailto:${site.email}`}
              className="text-accent underline decoration-1 underline-offset-[3px] transition-opacity duration-[var(--duration-micro)] hover:opacity-75"
            >
              {site.email}
            </a>
          </p>
          <p className="mt-2 font-mono text-[0.75rem] text-ink-3">
            best score {result.score.toFixed(2)} · floor {floor.toFixed(2)}
          </p>
        </div>
      )}
    </article>
  )
}

/* --- Citation chip -------------------------------------------------------
   A link when the text has a page, a plain chip when it does not. Two of the
   corpus's sources — the MERN store and the Virtuoso dashboards — are CV
   entries with no case study, and a chip that looks like a link and lands on a
   404 is worse than one that admits it goes nowhere.                       */

function SourceChip({ chunk, quoted }: { chunk: AskChunk; quoted: boolean }) {
  const shared =
    'inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[0.75rem]'
  const tone = quoted ? 'border-accent/40 bg-accent/10' : 'border-hairline bg-white/[0.03]'

  const inner = (
    <>
      <span className={cx('shrink-0', quoted ? 'text-accent' : 'text-ink-2')}>{chunk.source}</span>
      {/* min-w-0 is what makes `truncate` work inside a flex row: without it the
          label refuses to shrink below its content width and the chip wraps
          instead of clipping. */}
      <span className="min-w-0 truncate text-ink-3">{chunk.label}</span>
    </>
  )

  if (chunk.href === null) {
    return <span className={cx(shared, tone)}>{inner}</span>
  }

  return (
    <Link
      href={chunk.href}
      className={cx(
        shared,
        tone,
        'transition-colors duration-[var(--duration-micro)] ease-[var(--ease-micro)]',
        'hover:border-hairline-strong',
      )}
    >
      {inner}
      <span className="sr-only"> — read this in context</span>
    </Link>
  )
}
