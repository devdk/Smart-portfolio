'use client'

import { useId, useMemo, useState } from 'react'
import { BPE_MERGES, BPE_BASE_CHARS, BPE_STATS } from '@/content/lab-data'
import { Meta, cx } from '@/components/primitives'
import { Caption } from '@/components/lab/Caption'

/* ==========================================================================
   INSTRUMENT 03 — TOKENIZER

   A real byte-pair encoder. Not a regex pretending to be one, and not a
   production vocabulary imported at great expense — the merge table in
   content/lab-data.ts was TRAINED, by scripts/build-lab-data.ts, on the 23
   chunks of this site's own corpus. 300 merges, greedy, most-frequent-pair-
   first, exactly the algorithm GPT-2's tokeniser was built with.

   ── WHY NOT `gpt-tokenizer` ────────────────────────────────────────────────
   It is roughly two megabytes of vocabulary to put chips under a textarea.
   On a site whose argument is that performance is a design decision, that
   would be a self-refuting import. Training our own costs about 4 KB.

   ── WHY THE SMALLNESS IS THE POINT ─────────────────────────────────────────
   A 300-merge vocabulary trained on one CV is a bad tokeniser, and being able
   to SEE that it is bad is more instructive than a good one behaving
   invisibly. Type a word this corpus has never met and it shatters into
   characters; type "WordPress" and it comes out whole. That contrast is the
   entire intuition behind why tokenisers are trained on the open web, why
   your name probably costs more tokens than "the", and why non-English text
   costs multiples of English. A borrowed vocabulary would hide all of it.

   ── HOW THE ENCODER WORKS ──────────────────────────────────────────────────
   Encoding replays training. For each pre-token, repeatedly find the adjacent
   pair with the LOWEST rank in the merge table and merge it; stop when no
   adjacent pair is in the table. Lowest rank means earliest learned, which
   means most frequent in the corpus — that ordering is why the merge list has
   to stay in learned order and must never be sorted.
   ========================================================================== */

/**
 * Key separator for pair lookups. Must match scripts/build-lab-data.ts.
 *
 * NOT a space: tokens contain spaces (" the" is one symbol), so a space would
 * make the pair ("a", " b") and the pair ("a ", "b") collide on the same key
 * and mis-rank one of them. A NUL cannot occur in the corpus, and is written
 * as an escape so it is visible in the source.
 */
const PAIR_SEP = '\u0000'

/** Rank lookup, built once. Rank = position in the merge table = priority. */
const RANKS = ((): Map<string, number> => {
  const ranks = new Map<string, number>()
  BPE_MERGES.forEach(([a, b], index) => ranks.set(`${a}${PAIR_SEP}${b}`, index))
  return ranks
})()

const KNOWN_CHARS = new Set(BPE_BASE_CHARS)

/** Same split as training: leading whitespace binds to the following word, so
    " the" and "the" are different tokens — as they are in every real model. */
function preTokenise(text: string): string[] {
  return text.match(/\s*\S+|\s+/g) ?? []
}

type Token = {
  text: string
  /** True when every character in it was seen during training. */
  known: boolean
  /** Number of merges that built it. 0 = a bare character. */
  merges: number
}

function encode(text: string): Token[] {
  const out: Token[] = []

  for (const word of preTokenise(text)) {
    const symbols = Array.from(word)

    while (symbols.length > 1) {
      let bestRank = Infinity
      let bestIndex = -1
      for (let i = 0; i < symbols.length - 1; i += 1) {
        const a = symbols[i]
        const b = symbols[i + 1]
        // noUncheckedIndexedAccess: both are `string | undefined` here, and
        // the guard is real rather than ceremonial — a merge that produced an
        // empty symbol would otherwise silently key the map wrongly.
        if (a === undefined || b === undefined) continue
        const rank = RANKS.get(`${a}${PAIR_SEP}${b}`)
        if (rank !== undefined && rank < bestRank) {
          bestRank = rank
          bestIndex = i
        }
      }
      if (bestIndex < 0) break

      const a = symbols[bestIndex]
      const b = symbols[bestIndex + 1]
      if (a === undefined || b === undefined) break
      symbols.splice(bestIndex, 2, a + b)
    }

    for (const symbol of symbols) {
      const characters = Array.from(symbol)
      out.push({
        text: symbol,
        known: characters.every((character) => KNOWN_CHARS.has(character)),
        merges: characters.length - 1,
      })
    }
  }

  return out
}

/** Whitespace has to be visible or the chips lie about where tokens begin. */
function display(text: string): string {
  return text.replace(/ /g, '·').replace(/\n/g, '⏎').replace(/\t/g, '⇥')
}

const SAMPLES: string[] = [
  'Dheeraj builds CRMs, lead engines and WordPress sites that load fast.',
  'Companies House data, deduplicated and scored, in a Postgres table.',
  'Tokenisation is why your name costs more than the word "the".',
]

const DEFAULT_TEXT = SAMPLES[0] ?? ''

/** Alternating tints so adjacent chips read as separate tokens. Both are
    token-derived and both keep their text at full contrast — the tint carries
    no meaning, it only marks a boundary. */
const TINTS = ['bg-accent/12 text-ink', 'bg-white/[0.05] text-ink-2']

export function Tokenizer() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const textareaId = useId()

  const tokens = useMemo(() => encode(text), [text])
  const characters = useMemo(() => Array.from(text).length, [text])
  const unknown = tokens.filter((token) => !token.known).length
  /* Compression against the naive baseline. A character split produces exactly
     one token per character, so "tokens saved versus naive" and "characters
     per token" are the same quantity read two ways — stating it once avoids
     dressing one number up as two findings. */
  const compression = tokens.length > 0 ? characters / tokens.length : 0

  return (
    <div>
      <Caption>
        demonstrates: byte-pair encoding. This BPE was trained on this site's own{' '}
        {BPE_STATS.chunks} content chunks ({BPE_STATS.merges} merges), so it is small and
        domain-specific — a production tokenizer has ~100k merges trained on the open web.
      </Caption>

      <label htmlFor={textareaId} className="block text-[0.9375rem] text-ink">
        Text to tokenise
      </label>
      <textarea
        id={textareaId}
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={2}
        spellCheck={false}
        className="mt-2 w-full resize-y rounded-[var(--radius-sm)] border border-hairline bg-white/[0.03] p-3 font-mono text-[0.8125rem] leading-relaxed text-ink focus:border-accent/50 focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Meta>try</Meta>
        {SAMPLES.map((sample, index) => (
          <button
            key={sample}
            type="button"
            onClick={() => setText(sample)}
            className={cx(
              'rounded-full border border-hairline bg-white/[0.02] px-3 py-1 font-mono text-[0.6875rem] text-ink-3',
              'transition-colors duration-[var(--duration-micro)] hover:border-hairline-strong hover:text-ink-2',
            )}
          >
            sample {index + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setText('Zürich zeppelin quixotry 🜛')}
          className="rounded-full border border-hairline bg-white/[0.02] px-3 py-1 font-mono text-[0.6875rem] text-ink-3 transition-colors duration-[var(--duration-micro)] hover:border-hairline-strong hover:text-ink-2"
        >
          words it has never seen
        </button>
      </div>

      {/* The chips. aria-hidden because a screen reader reading 47 fragments
          of a sentence one at a time is noise, not information — the counts
          and the ratio below are the accessible version, and the original text
          is right there in the textarea. */}
      <div aria-hidden="true" className="mt-5 flex flex-wrap gap-1">
        {tokens.map((token, index) => (
          <span
            key={`${index}-${token.text}`}
            className={cx(
              'rounded-[var(--radius-xs)] px-1.5 py-0.5 font-mono text-[0.75rem] whitespace-pre',
              token.known
                ? TINTS[index % TINTS.length]
                : 'border border-dashed border-hairline-strong text-ink-3',
            )}
          >
            {display(token.text)}
          </span>
        ))}
      </div>

      {/* Two bars, one scale: characters is always the longer one because a
          naive split can never beat BPE. scaleX only — a width transition here
          would relayout the panel on every keystroke. */}
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_11rem]">
        <dl className="space-y-2.5">
          {[
            { label: 'naive character split', value: characters, fraction: 1 },
            {
              label: `learned BPE (${BPE_STATS.merges} merges)`,
              value: tokens.length,
              fraction: characters > 0 ? tokens.length / characters : 0,
            },
          ].map((bar) => (
            <div key={bar.label} className="flex items-center gap-3">
              <dt className="w-[11rem] shrink-0 font-mono text-[0.6875rem] text-ink-3">
                {bar.label}
              </dt>
              <dd className="flex flex-1 items-center gap-3">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <span
                    className="block h-full origin-left rounded-full bg-accent transition-transform duration-[var(--duration-ui)] ease-[var(--ease-ui)]"
                    style={{ transform: `scaleX(${Math.max(bar.fraction, 0.004)})` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right font-mono text-[0.75rem] tabular-nums text-ink">
                  {bar.value}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <div
          role="status"
          className="rounded-[var(--radius-sm)] border border-hairline bg-white/[0.02] px-3 py-2.5 font-mono text-[0.75rem]"
        >
          <p className="text-ink">
            {tokens.length} tokens · {characters} chars
          </p>
          <p className="mt-1 text-ink-2">{compression.toFixed(2)}× vs naive</p>
          <p className="mt-1 text-ink-3">= {compression.toFixed(2)} chars/token</p>
          {unknown > 0 ? (
            <p className="mt-2 text-warning">
              {unknown} token{unknown === 1 ? '' : 's'} contain characters this corpus never
              saw
            </p>
          ) : null}
        </div>
      </div>

      <p className="mt-5 max-w-2xl text-[0.8125rem] leading-relaxed text-ink-3">
        Trained on {BPE_STATS.corpusChars.toLocaleString('en-GB')} characters it reaches{' '}
        <span className="text-ink-2">{BPE_STATS.charsPerToken.toFixed(2)} chars/token</span> on
        its own corpus, from a vocabulary of {BPE_STATS.vocabSize}. A production tokeniser
        manages roughly 4 on English prose with a vocabulary of about 100,000 — the gap is
        entirely the size of the corpus it learned from, not a difference in the algorithm.
      </p>
    </div>
  )
}
