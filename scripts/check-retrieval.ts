/* ==========================================================================
   RETRIEVAL GATE

   "Ask my portfolio" makes exactly one promise: it quotes what Dheeraj has
   written, and when the corpus does not contain the answer it says so. The
   first half of that is verifiable by reading the code. The second half is not
   — a threshold is a number, and a number that has never been tested against
   questions it should refuse is a guess.

   So this is the test. Fourteen probes, split into the two things that can go
   wrong, and both are failures:

     ANSWERABLE   the corpus contains the answer. A refusal here is a feature
                  that does not work, and worse, it teaches the visitor the
                  thing is broken and they stop asking.

     UNANSWERABLE the corpus does not. An answer here is the system quoting
                  Dheeraj's own words at a question they do not address, which
                  is the one failure the whole design exists to prevent.

   ── WHY THE PROBES ARE NOT ALLOWED TO BE SPECIAL-CASED ────────────────────
   Nothing in lib/retrieval.ts knows these strings exist. That is the entire
   value of this file: if the floor were fitted to these fourteen inputs, the
   gate would pass and the feature would still be broken for the fifteenth
   question. The floor was moved until the two groups separated cleanly, and the
   margin below is printed on every run so a regression that narrows the gap is
   visible before it becomes a failure.

   Run:  npm run check:retrieval
   Exit: 0 if every probe behaves, 1 otherwise.
   ========================================================================== */

import { answer, search, CONFIDENCE_FLOOR, RETRIEVAL_STATS } from '../lib/retrieval'

type Probe = {
  question: string
  /** True if the corpus genuinely contains the answer. */
  answerable: boolean
  /** Why this probe is in the set — the interesting part of each case. */
  note: string
}

const PROBES: Probe[] = [
  /* --- Answerable ------------------------------------------------------- */
  {
    question: 'has he worked with Shopify?',
    answerable: true,
    note: 'named technology, appears in several chunks',
  },
  {
    question: 'what is the CRM built with?',
    answerable: true,
    note: 'needs the case study, not the CV outline',
  },
  {
    question: 'how many endpoints?',
    answerable: true,
    note: 'one content term after stopwords — the thinnest answerable query',
  },
  {
    question: 'where is he based?',
    answerable: true,
    note: '"based" is the word a person uses; the CV says "location"',
  },
  {
    question: 'did he use AI to build the CRM?',
    answerable: true,
    note: 'documented as a decision — a refusal here would read as evasion, not caution',
  },
  {
    question: 'what did he trade away by working with an AI pair?',
    answerable: true,
    note: 'the trade-off field of that decision, which is the half people skip',
  },
  {
    question: 'why Postgres and not MongoDB?',
    answerable: true,
    note: 'the decision log was invisible to retrieval until it was indexed',
  },
  {
    question: 'what did the security audit find?',
    answerable: true,
    note: 'the IDOR story — about page and case study both carry it',
  },
  {
    question: 'does he know WordPress and React?',
    answerable: true,
    note: 'two technologies at once, the differentiator claim',
  },
  {
    question: 'what happened at Virtuoso?',
    answerable: true,
    note: 'named employer',
  },
  { question: 'what is his education?', answerable: true, note: 'a CV field with a real value' },

  /* --- Unanswerable ----------------------------------------------------- */
  {
    question: 'what is his salary expectation?',
    answerable: false,
    note: 'withheld: the CV states a stance, not a figure',
  },
  {
    question: 'what is his notice period?',
    answerable: false,
    note: 'withheld: the field exists and its value is unconfirmed',
  },
  {
    question: 'does he speak French?',
    answerable: false,
    note: 'plausible recruiter question, nothing in the corpus',
  },
  {
    question: 'what is the capital of Peru?',
    answerable: false,
    note: 'general knowledge — a model would answer, retrieval must not',
  },
  {
    question: 'who won the 2019 world cup?',
    answerable: false,
    note: 'general knowledge with a date in it',
  },
  {
    question: 'what is his shoe size?',
    answerable: false,
    note: 'nothing in the corpus contains either term — rejected by vocabulary',
  },
]

const GREEN = '\u001b[32m'
const RED = '\u001b[31m'
const DIM = '\u001b[2m'
const RESET = '\u001b[0m'

function main(): void {
  console.log(
    `check-retrieval: ${RETRIEVAL_STATS.chunks} chunks, ${RETRIEVAL_STATS.vocabulary} distinct ` +
      `terms, mean length ${RETRIEVAL_STATS.averageLength} tokens`,
  )
  console.log(`check-retrieval: confidence floor ${CONFIDENCE_FLOOR.toFixed(2)}\n`)

  let failures = 0
  let lowestAnswer = Infinity
  let highestRefusal = 0

  for (const probe of PROBES) {
    const result = answer(probe.question)
    const answered = result.kind === 'answer'
    const ok = answered === probe.answerable

    if (!ok) failures += 1
    if (probe.answerable && answered) lowestAnswer = Math.min(lowestAnswer, result.score)
    if (!probe.answerable) highestRefusal = Math.max(highestRefusal, result.score)

    const mark = ok ? `${GREEN}pass${RESET}` : `${RED}FAIL${RESET}`
    const wanted = probe.answerable ? 'answer' : 'refusal'
    console.log(
      `${mark}  ${probe.question}\n` +
        `      expected ${wanted}, got ${result.kind} ` +
        `${DIM}(score ${result.score.toFixed(2)} — ${probe.note})${RESET}`,
    )

    if (result.kind === 'answer') {
      console.log(`      ${DIM}matched:${RESET} ${result.matchedTerms.join(' ')}`)
      console.log(
        `      ${DIM}source:${RESET} ${result.sources[0]?.source ?? '?'} · ` +
          `${result.sources[0]?.label ?? '?'}`,
      )
      for (const sentence of result.sentences) {
        console.log(`      “${sentence.length > 150 ? `${sentence.slice(0, 150)}…` : sentence}”`)
      }
    } else {
      console.log(`      ${DIM}refused:${RESET} ${result.reason.slice(0, 120)}…`)
      if (result.kind === 'refusal' && result.topic) {
        console.log(`      ${DIM}withheld topic:${RESET} ${result.topic}`)
      }
    }
    console.log()
  }

  /* The margin is the real health metric. Both groups passing with the floor
     wedged between two scores 0.05 apart would be luck, not a working
     threshold, so the numbers are printed rather than just the verdict. */
  const answersFloor = lowestAnswer === Infinity ? 0 : lowestAnswer
  console.log(
    `check-retrieval: weakest accepted answer ${answersFloor.toFixed(2)}, ` +
      `strongest rejected question ${highestRefusal.toFixed(2)}, ` +
      `floor ${CONFIDENCE_FLOOR.toFixed(2)}`,
  )

  /* A degenerate query must not produce an answer either. Whitespace and
     punctuation tokenise to nothing, and "no terms" has to be a refusal rather
     than the first chunk in document order. */
  const degenerate = ['', '   ', '???', 'the and of']
  for (const query of degenerate) {
    const result = answer(query)
    if (result.kind !== 'refusal') {
      failures += 1
      console.log(`${RED}FAIL${RESET}  degenerate query ${JSON.stringify(query)} produced an answer`)
    }
    if (search(query).length > 0 && query.trim().length === 0) {
      failures += 1
      console.log(`${RED}FAIL${RESET}  empty query returned hits`)
    }
  }

  if (failures > 0) {
    console.log(`\ncheck-retrieval: ${RED}${failures} probe(s) failed${RESET}`)
    process.exit(1)
  }

  console.log(
    `\ncheck-retrieval: ${GREEN}all ${PROBES.length} probes behaved${RESET} ` +
      `(${PROBES.filter((p) => p.answerable).length} answered, ` +
      `${PROBES.filter((p) => !p.answerable).length} refused)`,
  )
}

main()
