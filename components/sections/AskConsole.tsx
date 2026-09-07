'use client'

import { useId, useRef, useState } from 'react'
import Link from 'next/link'
import { site } from '@/lib/site.config'
import { cx } from '@/components/primitives'
import type { AskChunk } from '@/content/ask-corpus'
import type { Answer } from '@/lib/retrieval'

/* ==========================================================================
   ASK — the interactive island

   ── WHAT CHANGED, AND WHY ─────────────────────────────────────────────────

   This was a terminal. Mono type throughout, a "search the corpus" button, and
   every answer trailed by `matched: build crm · bm25 4.60`. To an engineer that
   read as transparency. To a recruiter or a shop owner it read as a developer
   tool they had wandered into by mistake, and they are two of the three people
   this site most needs to convince.

   The machinery did not change — same scorer, same corpus, same refusal floor.
   What changed is who the surface is addressed to:

     - the question and the answer are in normal prose at reading size
     - the numbers are behind a disclosure, not printed under every answer
     - the pipeline explanation moved to the section around this island, also
       behind a disclosure, so the people who want it can have all of it and
       nobody else is shown a diagram they did not ask for

   ── WHY THE CITATION IS STILL VISIBLE WHEN THE SOURCE IS NOT ──────────────

   Sources are collapsed by default, which was the right call. But the FACT of
   a citation stays on screen, as one chip naming the page the sentence came
   from. That is not decoration: the section's headline claim is that there is
   no model and therefore nothing invented, and a claim like that is only
   believable if every answer visibly points at something. Hide the citation
   entirely and the headline becomes marketing.

   ── WHY A REFUSAL IS DESIGNED AS CAREFULLY AS AN ANSWER ───────────────────

   "No model, no hallucination" is unfalsifiable if the thing answers
   everything. The refusals are the proof — so they get a real design: what it
   could not find, what it CAN answer, and a way to just ask him. A dead end
   becomes the most qualified contact prompt on the site, because the person
   reading it has already been told the answer isn't published.

   ── WHY THE INDEX IS STILL FETCHED ON FIRST USE ───────────────────────────

   Unchanged, and still the right call. Both imports above are type-only and
   erased at compile time. lib/retrieval carries the corpus and its term tables;
   a static import measured 32.8 KB of app code against a 25 KB budget, paid by
   every visitor whether they asked anything or not. It loads on first use and
   is warmed on focus and hover, so the one real wait usually happens while the
   question is still being typed.
   ========================================================================== */

let indexPromise: Promise<typeof import('@/lib/retrieval')> | null = null

function loadIndex(): Promise<typeof import('@/lib/retrieval')> {
  indexPromise ??= import('@/lib/retrieval')
  return indexPromise
}

/**
 * The suggested questions.
 *
 * Every one is a probe in the answerable half of scripts/check-retrieval.ts,
 * so `npm run check:retrieval` fails the build if any of them stops being
 * answerable. A suggestion that refuses is the worst possible first impression
 * — it teaches the visitor the feature is broken — so these are gated
 * behaviour, not aspirational examples.
 *
 * Chosen to span the audience rather than to show off: one for someone judging
 * engineering, one for someone judging range, one for a sceptic, one for a
 * recruiter.
 */
const SUGGESTIONS = [
  'What did the security audit find?',
  'Does he know WordPress and React?',
  'Did he use AI to build the CRM?',
  'Where is he based?',
]

const TRANSCRIPT_LIMIT = 6

type Exchange = { id: number; question: string; result: Answer }

export function AskConsole({ chunks, floor }: { chunks: number; floor: number }) {
  const [query, setQuery] = useState('')
  const [transcript, setTranscript] = useState<Exchange[]>([])
  const [loading, setLoading] = useState(false)

  const counter = useRef(0)
  const inputId = useId()

  async function ask(question: string): Promise<void> {
    const trimmed = question.trim()
    if (trimmed.length === 0) return

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

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void ask(query)
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Ask a question about Dheeraj&rsquo;s work
        </label>

        {/* One field, generously sized, with the action inside it. The old
            version put a "Search the corpus" button beside a mono input, which
            described the mechanism instead of inviting a question. */}
        <div className="group relative">
          <input
            id={inputId}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => void loadIndex()}
            placeholder="Ask anything about his work…"
            autoComplete="off"
            className={cx(
              'w-full rounded-full border border-hairline-strong bg-canvas',
              'py-4 pl-6 pr-32 text-[1.0625rem] text-ink placeholder:text-ink-3',
              'transition-colors duration-[var(--duration-ui)]',
              'focus:border-accent/60 focus:outline-none',
            )}
          />
          <button
            type="submit"
            className={cx(
              'absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-5 py-2.5',
              'bg-accent text-[0.9375rem] font-medium text-[var(--color-accent-ink)]',
              'transition-opacity duration-[var(--duration-micro)] hover:opacity-90',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
            )}
          >
            Ask
          </button>
        </div>
      </form>

      {/* Suggestions in sentence case, in the body face. As mono chips they
          read as commands to be typed rather than questions to be clicked. */}
      <ul className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <li key={suggestion}>
            <button
              type="button"
              onClick={() => void ask(suggestion)}
              onPointerEnter={() => void loadIndex()}
              className={cx(
                'rounded-full border border-hairline px-3.5 py-2 text-[0.875rem] text-ink-2',
                'transition-colors duration-[var(--duration-micro)]',
                'hover:border-hairline-strong hover:text-ink',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
              )}
            >
              {suggestion}
            </button>
          </li>
        ))}
      </ul>

      <div role="log" aria-live="polite" aria-label="Answers" className="mt-8">
        {loading ? (
          <p className="text-[0.9375rem] text-ink-3">
            Loading the index — {chunks} passages, once.
          </p>
        ) : null}

        {transcript.length === 0 && !loading ? (
          <p className="max-w-xl text-[0.9375rem] leading-relaxed text-ink-3">
            It matches the words you use rather than the meaning behind them, so naming a
            technology, a project or a client works better than asking it to infer.
          </p>
        ) : null}

        {transcript.length > 0 ? (
          <ol className="flex flex-col gap-8">
            {transcript.map((exchange) => (
              <li key={exchange.id}>
                <ExchangeView exchange={exchange} floor={floor} onAsk={(q) => void ask(q)} />
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>
  )
}

/* --- One exchange --------------------------------------------------------- */

function ExchangeView({
  exchange,
  floor,
  onAsk,
}: {
  exchange: Exchange
  floor: number
  onAsk: (question: string) => void
}) {
  const { question, result } = exchange

  return (
    <article>
      <p className="text-[1rem] font-medium leading-snug text-ink-2">{question}</p>

      {result.kind === 'answer' ? (
        <div className="mt-3">
          {/* A blockquote because it IS a quotation — the same sentence, from
              the page named below it. Nothing here was written for this
              answer, which is the entire claim. */}
          <blockquote className="border-l-2 border-accent/50 pl-4">
            {result.sentences.map((sentence) => (
              <p key={sentence} className="text-[1.0625rem] leading-relaxed text-ink">
                {sentence}
              </p>
            ))}
          </blockquote>

          <Provenance result={result} />
        </div>
      ) : (
        <div className="mt-3 rounded-[var(--radius-md)] border border-hairline bg-white/[0.02] p-5">
          <p className="text-[1rem] leading-relaxed text-ink">
            That isn&rsquo;t written down anywhere on this site.
          </p>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{result.reason}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className={cx(
                'rounded-full bg-accent px-4 py-2 text-[0.875rem] font-medium',
                'text-[var(--color-accent-ink)] transition-opacity hover:opacity-90',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
              )}
            >
              Ask him directly
            </Link>
            <a
              href={`mailto:${site.email}`}
              className="text-[0.875rem] text-ink-3 underline decoration-hairline-strong underline-offset-2 transition-colors hover:text-ink"
            >
              {site.email}
            </a>
          </div>

          {/* What it CAN answer, so a refusal is a redirection rather than a
              closed door. */}
          <div className="mt-4 border-t border-hairline pt-4">
            <p className="mb-2 text-[0.8125rem] text-ink-3">Things it does know:</p>
            <ul className="flex flex-wrap gap-2">
              {SUGGESTIONS.slice(0, 3).map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => onAsk(suggestion)}
                    className="rounded-full border border-hairline px-3 py-1.5 text-[0.8125rem] text-ink-2 transition-colors hover:border-hairline-strong hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-[0.8125rem] text-ink-3 transition-colors hover:text-ink-2">
              Why it declined
            </summary>
            <p className="mt-2 font-mono text-[0.75rem] leading-relaxed text-ink-3">
              best match scored {result.score.toFixed(2)}, below the floor of {floor.toFixed(2)}.
              Under that threshold it declines instead of quoting the closest thing it found.
            </p>
          </details>
        </div>
      )}
    </article>
  )
}

/* --- Provenance ----------------------------------------------------------
   One chip naming where the sentence came from, and a disclosure for
   everything else. The chip is never hidden; the arithmetic always is.      */

function Provenance({ result }: { result: Extract<Answer, { kind: 'answer' }> }) {
  const quoted = result.sources[0]
  if (!quoted) return null

  const others = result.sources.slice(1)

  return (
    <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
      <SourceChip chunk={quoted} quoted />

      {others.length > 0 || result.matchedTerms.length > 0 ? (
        <details className="group/details">
          <summary className="cursor-pointer list-none text-[0.8125rem] text-ink-3 transition-colors hover:text-ink-2">
            <span className="underline decoration-hairline-strong underline-offset-2">
              How it found this
            </span>
          </summary>
          <div className="mt-3 flex flex-col gap-2.5 rounded-[var(--radius-sm)] border border-hairline bg-white/[0.02] p-3.5">
            <p className="font-mono text-[0.75rem] leading-relaxed text-ink-3">
              matched on {result.matchedTerms.join(', ')} · score{' '}
              {result.score.toFixed(2)} · quoted verbatim from the first source
            </p>
            {others.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {others.map((source) => (
                  <SourceChip key={source.id} chunk={source} />
                ))}
              </div>
            ) : null}
          </div>
        </details>
      ) : null}
    </div>
  )
}

/* A link when the text has a page, a plain chip when it does not. Some corpus
   sources are CV entries with no case study, and a chip that looks like a link
   and lands on a 404 is worse than one that admits it goes nowhere. */
function SourceChip({ chunk, quoted = false }: { chunk: AskChunk; quoted?: boolean }) {
  const shared =
    'inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-[0.8125rem]'
  const tone = quoted ? 'border-accent/40 bg-accent/[0.08]' : 'border-hairline bg-white/[0.03]'

  const inner = (
    <>
      <span aria-hidden="true" className={cx('shrink-0', quoted ? 'text-accent' : 'text-ink-3')}>
        ↳
      </span>
      <span className="min-w-0 truncate text-ink-2">{chunk.label}</span>
    </>
  )

  if (chunk.href === null) {
    return (
      <span className={cx(shared, tone)}>
        <span className="sr-only">Quoted from: </span>
        {inner}
      </span>
    )
  }

  return (
    <Link
      href={chunk.href}
      className={cx(shared, tone, 'transition-colors duration-[var(--duration-micro)] hover:border-hairline-strong')}
    >
      <span className="sr-only">Quoted from: </span>
      {inner}
      <span className="sr-only"> — read it in context</span>
    </Link>
  )
}
