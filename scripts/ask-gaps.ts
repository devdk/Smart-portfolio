/* ==========================================================================
   ASK GAP REPORT

     npx tsx scripts/ask-gaps.ts

   Fires the questions a real recruiter, hiring manager or prospective client
   actually asks, and reports what the site can and cannot answer.

   ── WHY THIS EXISTS ────────────────────────────────────────────────────────

   "The chatbot doesn't have all the information about me" is a true
   observation and a useless one to act on, because it does not say WHICH
   information. This turns that feeling into a list.

   Every refusal falls into exactly one of two categories, and they have
   opposite fixes:

     CONTENT GAP     The answer is not written down anywhere on the site. No
                     retrieval engine, knowledge graph or language model can
                     fix this. The fix is to write the answer down. A model
                     asked to fix it would invent one.

     RETRIEVAL GAP   The answer IS on the site, but the query did not reach
                     it — different vocabulary, a relational question that
                     keyword search cannot chain, or a confidence floor set
                     too high. THIS is what better retrieval fixes, and it is
                     the only part of the problem a knowledge graph helps with.

   Sorting refusals into those two buckets is the whole point. Building a
   graph to fix content gaps is effort spent on the wrong problem; writing
   more content to fix retrieval gaps is the same mistake mirrored.

   scripts/check-retrieval.ts is a GATE — 17 probes with expected outcomes,
   and it fails the build. This is a REPORT: no expectations, no exit code,
   just an honest picture of the surface area.
   ========================================================================== */

import { answer, RETRIEVAL_STATS, CONFIDENCE_FLOOR } from '../lib/retrieval'

type Question = {
  q: string
  /** Who asks this, so the report can be read by audience. */
  asker: 'recruiter' | 'client' | 'engineer' | 'sceptic'
  /** Where the answer lives, if it exists at all. Written from knowledge of
      the content, and checked against reality by the report itself. */
  expect: 'should-answer' | 'known-content-gap'
  note?: string
}

const QUESTIONS: Question[] = [
  /* --- A recruiter's first five minutes ---------------------------------- */
  { q: 'what is his current role?', asker: 'recruiter', expect: 'should-answer' },
  { q: 'how many years of experience does he have?', asker: 'recruiter', expect: 'should-answer' },
  { q: 'where is he based?', asker: 'recruiter', expect: 'should-answer' },
  { q: 'what is his education?', asker: 'recruiter', expect: 'should-answer' },
  { q: 'is he open to remote work?', asker: 'recruiter', expect: 'should-answer', note: 'the FAQ answers this directly — my earlier label was wrong, not the retrieval' },
  { q: 'what is his notice period?', asker: 'recruiter', expect: 'known-content-gap', note: 'cv.logistics placeholder' },
  { q: 'what are his salary expectations?', asker: 'recruiter', expect: 'known-content-gap', note: 'cv.logistics placeholder' },
  { q: 'would he relocate to the UK?', asker: 'recruiter', expect: 'known-content-gap', note: 'cv.logistics placeholder' },
  { q: 'does he need a visa?', asker: 'recruiter', expect: 'known-content-gap', note: 'cv.logistics placeholder' },
  { q: 'what kind of role is he looking for?', asker: 'recruiter', expect: 'known-content-gap', note: 'cv.logistics placeholder' },
  { q: 'what is his github?', asker: 'recruiter', expect: 'should-answer', note: 'filled in this session' },
  { q: 'how do I contact him?', asker: 'recruiter', expect: 'should-answer' },

  /* --- A client sizing him up ------------------------------------------- */
  { q: 'has he built a Shopify store?', asker: 'client', expect: 'should-answer' },
  { q: 'does he do WordPress?', asker: 'client', expect: 'should-answer' },
  { q: 'can he do technical SEO?', asker: 'client', expect: 'should-answer' },
  { q: 'has he worked with clients outside India?', asker: 'client', expect: 'should-answer' },
  { q: 'how long does a project take?', asker: 'client', expect: 'should-answer' },
  { q: 'what does he charge?', asker: 'client', expect: 'known-content-gap', note: 'deliberately not published' },
  { q: 'does he work with agencies?', asker: 'client', expect: 'should-answer' },
  { q: 'has he built an ecommerce checkout?', asker: 'client', expect: 'should-answer' },

  /* --- Relational: what a graph is for ---------------------------------- */
  { q: 'which clients has he worked with at Mirasphere?', asker: 'recruiter', expect: 'should-answer', note: 'RELATIONAL — needs a chain, not a keyword' },
  { q: 'what has he built with Liquid?', asker: 'client', expect: 'should-answer', note: 'RELATIONAL — technology to projects' },
  { q: 'which projects used PostgreSQL?', asker: 'engineer', expect: 'should-answer', note: 'RELATIONAL' },
  { q: 'has any client hired him twice?', asker: 'client', expect: 'should-answer', note: 'RELATIONAL — Swann appears on two projects' },
  { q: 'which projects had performance problems?', asker: 'engineer', expect: 'should-answer', note: 'RELATIONAL' },
  { q: 'what did he build for accounting firms?', asker: 'client', expect: 'should-answer', note: 'RELATIONAL — two of them' },
  { q: 'which of his projects are live?', asker: 'client', expect: 'should-answer', note: 'RELATIONAL' },
  { q: 'what is the biggest thing he has built?', asker: 'recruiter', expect: 'should-answer', note: 'RELATIONAL — needs comparison' },

  /* --- An engineer reading the code ------------------------------------- */
  { q: 'why did he choose Postgres over MongoDB?', asker: 'engineer', expect: 'should-answer' },
  { q: 'how many endpoints does the CRM have?', asker: 'engineer', expect: 'should-answer' },
  { q: 'what did the security audit find?', asker: 'engineer', expect: 'should-answer' },
  { q: 'has he written tests?', asker: 'engineer', expect: 'should-answer' },
  { q: 'does he know Docker?', asker: 'engineer', expect: 'should-answer' },
  { q: 'what is his experience with queues?', asker: 'engineer', expect: 'should-answer' },
  { q: 'has he done any machine learning?', asker: 'engineer', expect: 'should-answer' },
  { q: 'does he use AI to write code?', asker: 'engineer', expect: 'should-answer', note: 'added this session' },
  { q: 'what would he do differently on the CRM?', asker: 'engineer', expect: 'should-answer' },

  /* --- The sceptic, poking for weaknesses ------------------------------- */
  { q: 'what has he failed at?', asker: 'sceptic', expect: 'should-answer' },
  { q: 'what is he bad at?', asker: 'sceptic', expect: 'known-content-gap', note: 'no weaknesses section exists' },
  { q: 'has he ever broken production?', asker: 'sceptic', expect: 'should-answer' },
  { q: 'why should I believe these numbers?', asker: 'sceptic', expect: 'should-answer' },
  { q: 'has he led a team?', asker: 'sceptic', expect: 'known-content-gap', note: 'sole-developer work throughout — worth stating explicitly' },
  { q: 'what happens when he leaves a project?', asker: 'sceptic', expect: 'known-content-gap', note: 'handover story is implied, never stated' },
]

const G = '[32m'
const Y = '[33m'
const R = '[31m'
const D = '[2m'
const X = '[0m'

type Row = Question & {
  answered: boolean
  score: number
  /** What the report concludes, which may disagree with `expect`. */
  verdict: 'answered' | 'content-gap' | 'retrieval-gap' | 'unexpected-answer'
  source?: string
}

const rows: Row[] = QUESTIONS.map((question) => {
  const result = answer(question.q)
  const answered = result.kind === 'answer'

  let verdict: Row['verdict']
  if (answered && question.expect === 'should-answer') verdict = 'answered'
  else if (answered) verdict = 'unexpected-answer'
  else if (question.expect === 'known-content-gap') verdict = 'content-gap'
  else verdict = 'retrieval-gap'

  return {
    ...question,
    answered,
    score: result.score,
    verdict,
    source: result.kind === 'answer' ? result.sources[0]?.source : undefined,
  }
})

console.log(
  `\nask-gaps: ${RETRIEVAL_STATS.chunks} chunks, floor ${CONFIDENCE_FLOOR.toFixed(2)}, ` +
    `${QUESTIONS.length} questions a real visitor would ask\n`,
)

const LABEL: Record<Row['verdict'], string> = {
  answered: `${G}answered      ${X}`,
  'content-gap': `${Y}CONTENT GAP   ${X}`,
  'retrieval-gap': `${R}RETRIEVAL GAP ${X}`,
  'unexpected-answer': `${Y}ANSWERED ANYWAY${X}`,
}

for (const group of ['recruiter', 'client', 'engineer', 'sceptic'] as const) {
  const groupRows = rows.filter((r) => r.asker === group)
  console.log(`${D}── ${group} ${'─'.repeat(60 - group.length)}${X}`)
  for (const row of groupRows) {
    console.log(
      `  ${LABEL[row.verdict]} ${row.q.padEnd(48)} ${D}${row.score.toFixed(2)}${X}` +
        `${row.source ? ` ${D}${row.source}${X}` : ''}`,
    )
    if (row.note) console.log(`      ${D}${row.note}${X}`)
  }
  console.log()
}

const counts = {
  answered: rows.filter((r) => r.verdict === 'answered').length,
  contentGap: rows.filter((r) => r.verdict === 'content-gap').length,
  retrievalGap: rows.filter((r) => r.verdict === 'retrieval-gap').length,
  unexpected: rows.filter((r) => r.verdict === 'unexpected-answer').length,
}

console.log(`${'─'.repeat(72)}`)
console.log(`  answered            ${counts.answered} / ${rows.length}`)
console.log(`  content gaps        ${counts.contentGap}   ${D}fix by writing the answer down${X}`)
console.log(`  retrieval gaps      ${counts.retrievalGap}   ${D}fix with better retrieval — this is what a graph helps${X}`)
console.log(`  answered anyway     ${counts.unexpected}   ${D}expected a gap, got an answer — check it is a GOOD answer${X}`)
console.log(`${'─'.repeat(72)}\n`)

const relational = rows.filter((r) => r.note?.startsWith('RELATIONAL'))
const relationalAnswered = relational.filter((r) => r.answered).length
console.log(
  `  Of ${relational.length} relational questions — the kind that need a chain of facts rather\n` +
    `  than a keyword match — the current keyword engine answers ${relationalAnswered}.\n` +
    `  That number is the honest case for a knowledge graph.\n`,
)
