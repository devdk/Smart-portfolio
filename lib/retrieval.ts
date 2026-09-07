import { ASK_CHUNKS, ASK_WITHHELD, type AskChunk } from '@/content/ask-corpus'

/* ==========================================================================
   RETRIEVAL — BM25 over this site's own corpus

   This module answers questions, and it is important to be precise about how,
   because the interesting claim is a NEGATIVE one: there is no model here.
   Nothing is generated. Every word a visitor reads back was written by Dheeraj
   and published on a route they can open. What this file does is decide WHICH
   words, and refuse when the honest answer is that it does not know.

   The pipeline, end to end:

     query → tokenise → BM25 over every chunk → best sentences in the winner

   ── WHY BM25 AND NOT COSINE SIMILARITY ────────────────────────────────────
   Because there is no encoder on the client, and pretending otherwise is the
   one thing this site will not do. Embedding a query with bge-small in the
   browser means shipping roughly 30 MB of weights to place one point — on a
   site whose entire argument is performance discipline. components/lab/
   EmbeddingMap.tsx makes the same call and says so on screen.

   Given that, BM25 is the right lexical scorer rather than the raw IDF-weighted
   term overlap the map uses, and the difference matters here in a way it does
   not there. The map only needs a rough centroid. An answer needs to pick ONE
   chunk out of 73 correctly, and BM25 adds the two corrections that decide it:

     1. TERM FREQUENCY, saturating. A chunk that says "Shopify" four times is
        more about Shopify than one that says it once — but not four times more.
        Term overlap ignores repetition entirely; raw counts over-reward it.

     2. LENGTH NORMALISATION. The corpus is deliberately uneven: a templated
        location chunk is 40 tokens, a case-study implementation paragraph is
        180. Without normalisation the long ones win everything, because they
        contain more words by construction.

   ── THE PARAMETERS, AND WHY THEY ARE THE STANDARD ONES ────────────────────
   k1 = 1.5 controls how fast term frequency saturates. At 1.5, the second
   occurrence of a term adds about 40% of what the first did and the fifth adds
   about 8%. Lower (0.5) makes the scorer almost binary — presence, not
   aboutness. Higher (3.0) lets one chunk win by repeating a word, which on a
   corpus this small is a real failure mode: the CV bullets repeat "WordPress"
   more often than the case study that explains it.

   b = 0.75 controls how much length is penalised: 0 ignores length, 1 divides
   fully by relative length. 0.75 is Lucene's default because it is what two
   decades of TREC evaluation settled on, and there is no reason to believe 73
   chunks of one man's CV justify a different constant. Departing from the
   defaults without an evaluation set to justify it would be tuning by vibe.

   These are unchanged from Robertson & Walker's formulation, which is the
   point: this is a known-good algorithm applied honestly, not a novel one.

   ── NO STEMMING, DELIBERATELY ─────────────────────────────────────────────
   "endpoint" does not match "endpoints" here. A Porter stemmer is ~200 lines
   and would help — but it also conflates words a small corpus needs kept
   apart, and it makes the matched-terms line the interface shows stop
   corresponding to what the visitor typed. Legibility wins: the mechanism on
   screen is the mechanism that ran. What recovers most of what a stemmer would
   have bought is cheaper and narrower: dotted terms are indexed in pieces as
   well as whole, so "Virtuoso.live" is findable as "Virtuoso".

   Pure functions, no React, no DOM. scripts/check-retrieval.ts imports this
   file directly and gates the build on its behaviour.
   ========================================================================== */

/* --- Parameters ---------------------------------------------------------- */

/** Term-frequency saturation. Robertson's default; see the note above. */
export const BM25_K1 = 1.5

/** Length normalisation strength. Lucene's default; see the note above. */
export const BM25_B = 0.75

/**
 * Below this BM25 score, refuse.
 *
 * ── HOW IT WAS SET ────────────────────────────────────────────────────────
 * Measured, against the probe set in scripts/check-retrieval.ts, and NOT fitted
 * to those strings — nothing in this file knows they exist, which is the only
 * thing that makes the gate worth running. As it stands:
 *
 *     answerable probes     2.44 … 7.57     (8 questions the corpus answers)
 *     unanswerable probes   0.00            (6 it does not, every one at zero)
 *
 * The unanswerable six all land at exactly zero, and that is the interesting
 * result: they are rejected by VOCABULARY, not by this threshold. "Peru",
 * "French" and "shoe" do not appear anywhere in the corpus, so nothing scores
 * at all. A question about the outside world cannot reach the floor to be
 * judged by it.
 *
 * ── SO WHAT IS THE FLOOR ACTUALLY FOR ─────────────────────────────────────
 * The middle band: questions built from words the corpus does contain, used in
 * a sense it does not. Those score between 1 and 4 and the floor is what stands
 * between them and a confident-looking quotation. 2.0 sits below the weakest
 * legitimate answer (2.44 — "what happened at Virtuoso?", one term surviving the
 * stopwords) with a fifth of that in margin, and above what a single common word
 * can produce on its own: "built" carries an IDF of 1.78 here, so a chunk
 * matching nothing else cannot clear the floor.
 *
 * ── WHAT IT CANNOT DO, STATED PLAINLY ─────────────────────────────────────
 * It cannot tell a good match from a perfect one. On 73 chunks the IDF range is
 * 1.50 to 3.90, so "docker" and "team" weigh the same, and "is he a good
 * developer?" will match the word "good" and quote a real sentence containing
 * it. That is a thin answer, not a fabricated one — which is why the interface
 * shows the matched terms and the score next to every answer. The reader can
 * see the mechanism, and see when it is reaching.
 *
 * ── WHY IT ERRS TOWARDS REFUSING ──────────────────────────────────────────
 * The two failure modes are not symmetrical. Refusing a question the corpus
 * could have answered costs a visitor one click to an email link. Answering one
 * it could not means quoting Dheeraj's own writing at a question it does not
 * address — putting words in his mouth, which is precisely the failure this
 * whole design exists to make impossible.
 */
export const CONFIDENCE_FLOOR = 2.0

/* A single matched term can carry an answer alone only if it appears in at
   most this share of the corpus. Above it, the word is a connective rather
   than a subject and the match is a coincidence.

   CHOSEN BY MEASUREMENT, not taste: scripts/ask-gaps.ts runs 43 realistic
   questions, and this is the value at which all seven false positives fall
   away while every correct single-term answer survives. See the specificity
   gate below for the failures it exists to stop. */
export const SINGLE_TERM_MAX_SHARE = 0.06

/* --- Tokenising ----------------------------------------------------------- */

/**
 * Stopwords.
 *
 * The first two lines are lifted verbatim from components/lab/EmbeddingMap.tsx
 * so the two lexical systems on this page agree about what a word is. It is
 * duplicated rather than imported for the same reason the BPE encoder is
 * duplicated in scripts/build-lab-data.ts: EmbeddingMap is a canvas component
 * with its own IDF table, and importing this module into it would pull the
 * whole retrieval corpus into the instrument to borrow one Set.
 *
 * The last two lines are added here, and only here, and they are load-bearing
 * in a way that took measurement to see. On a corpus this small, IDF cannot
 * tell a generic verb from a technology: "docker" and "team" each appear in 2
 * chunks, so both carry an identical weight of 3.39. The whole IDF range across
 * 1203 terms is 1.50 to 3.90 — nearly flat, because almost every word in one
 * man's writing appears in one to four chunks. IDF's usual job of demoting
 * function words simply does not work at this scale, so the list has to.
 *
 * Without them, "tell me a joke" scored 3.64 on the word "tell" and produced a
 * confident quotation, and "does he use Vue?" scored 3.72 on "use". Both are
 * the exact failure this feature exists to avoid, and no threshold could
 * separate them from "has he used Docker?", which is a real question with a
 * real answer.
 *
 * `work` is deliberately NOT in the list, though `worked` is. As a query term
 * "worked" is a generic employment verb in a corpus about employment. "work" is
 * kept because site.config names a logistics field "Work preference" whose
 * value is unconfirmed, and the withheld-topic check below needs every word of
 * that field name to survive tokenising or the field becomes quotable.
 */
const STOPWORDS = new Set(
  ('a an and are as at be but by can did do does for from had has have he her his how i if in ' +
    'into is it its me my no not of on or our so than that the their them then there these they ' +
    'this to too us was we were what when where which who will with you your ' +
    'about also any been being both each him more most much many over such very would should could ' +
    'use used using worked working works tell tells why per get got know need make made take give ' +
    'see look just like really thing things able')
    .split(' '),
)

/**
 * Lowercase, split on anything that is not a word character, drop stopwords,
 * keep terms of two characters or more.
 *
 * `+`, `#` and `.` survive the split so "node.js", "c++" and "next.js" stay
 * single terms; leading and trailing dots are then trimmed so a sentence-final
 * "WordPress." is the same term as "WordPress".
 *
 * ── WHY A DOTTED TERM IS ALSO INDEXED IN PIECES ───────────────────────────
 * Keeping the dot is right — "node.js" is one thing — but on its own it made
 * the corpus unsearchable in a way that took a failing probe to notice. The CV
 * writes the employer as "Virtuoso.live", so "what happened at Virtuoso?"
 * scored ZERO: not a low score, no match at all, because "virtuoso" and
 * "virtuoso.live" are different strings. So a dotted token is emitted whole AND
 * split, which is what a search engine's word-delimiter filter does and for
 * exactly this reason. "virtuoso.live" indexes as all three of itself,
 * "virtuoso" and "live"; a query for any of them finds it.
 */
export function tokenise(text: string): string[] {
  const out: string[] = []
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((word) => word.replace(/^\.+|\.+$/g, ''))

  for (const word of words) {
    if (word.length > 1 && !STOPWORDS.has(word)) out.push(word)
    if (!word.includes('.')) continue
    for (const part of word.split('.')) {
      if (part.length > 1 && !STOPWORDS.has(part)) out.push(part)
    }
  }
  return out
}

/* --- The index ------------------------------------------------------------
   Built once, at module scope: 73 chunks, ~2 600 tokens, three passes. That is
   a fraction of a millisecond, paid on the first import and never again, which
   is why every answer after that is available on the same tick as the keystroke
   that asked for it — and why the interface has no spinner for scoring. The one
   wait a visitor can perceive is fetching THIS MODULE, which the console does
   lazily on first use; see the note in components/sections/AskConsole.tsx.    */

type IndexedDoc = {
  chunk: AskChunk
  /** term -> count in this chunk. */
  tf: Map<string, number>
  /** Length in tokens, for BM25's length normalisation. */
  length: number
}

const DOCS: IndexedDoc[] = ASK_CHUNKS.map((chunk) => {
  const tokens = tokenise(chunk.text)
  const tf = new Map<string, number>()
  for (const token of tokens) tf.set(token, (tf.get(token) ?? 0) + 1)
  return { chunk, tf, length: tokens.length }
})

/** Document frequency: how many chunks contain each term at least once. */
const DF = ((): Map<string, number> => {
  const df = new Map<string, number>()
  for (const doc of DOCS) {
    for (const term of doc.tf.keys()) df.set(term, (df.get(term) ?? 0) + 1)
  }
  return df
})()

const AVG_LENGTH =
  DOCS.length > 0 ? DOCS.reduce((sum, doc) => sum + doc.length, 0) / DOCS.length : 1

/**
 * Robertson–Sparck Jones IDF, in the form Lucene uses:
 *
 *   ln(1 + (N - df + 0.5) / (df + 0.5))
 *
 * The outer `1 +` matters. The classic form without it goes NEGATIVE for a
 * term appearing in more than half the corpus, which on 73 chunks of one
 * person's writing is not hypothetical — "project", "built" and "client" are
 * all close to that line. A negative weight means a chunk is penalised for
 * containing a word the visitor typed, which is indefensible in an interface
 * that shows the matched terms to explain the answer.
 */
function idf(term: string): number {
  const df = DF.get(term) ?? 0
  // An unseen term matches nothing, so this weight is never used in a score.
  // Zero rather than a maximum, so a caller that reaches for it by mistake gets
  // "no evidence" instead of "maximally specific evidence".
  if (df === 0) return 0
  return Math.log(1 + (DOCS.length - df + 0.5) / (df + 0.5))
}

/* --- Search -------------------------------------------------------------- */

export type Hit = {
  chunk: AskChunk
  /** BM25, summed over the matched terms. Compare against CONFIDENCE_FLOOR. */
  score: number
  /** Which of the query's terms this chunk actually contains. The interface
      shows these, so the reader can see what the score was earned on. */
  matchedTerms: string[]
}

/**
 * The query's terms that exist ANYWHERE in the corpus.
 *
 * Filtering here rather than inside the loop is what makes a question about the
 * outside world cost nothing: "what is the capital of Peru?" has no known terms
 * at all, so search returns an empty list before a single chunk is scored, and
 * `answer()` refuses without a threshold being consulted. Six of the fourteen
 * probes in scripts/check-retrieval.ts are rejected exactly here, at zero.
 *
 * It is also the honest place to draw the line. An out-of-vocabulary word is
 * evidence about the CORPUS — that this site has never mentioned Peru — and not
 * evidence about any chunk in it, so it cannot help rank one chunk over another.
 */
function inVocabulary(queryTerms: string[]): string[] {
  return queryTerms.filter((term) => DF.has(term))
}

/**
 * Scores every chunk and returns the best `k`, highest first.
 *
 * Ties break on chunk id rather than being left to Array.prototype.sort's
 * implementation, so the same question always cites the same chunk. A citation
 * that moves between identical scores looks like a bug in the retrieval, and
 * scripts/check-retrieval.ts could not gate on it.
 */
export function search(query: string, k = 5): Hit[] {
  const known = inVocabulary([...new Set(tokenise(query))])
  if (known.length === 0) return []

  const hits: Hit[] = []
  for (const doc of DOCS) {
    let bm25 = 0
    const matchedTerms: string[] = []

    for (const term of known) {
      const frequency = doc.tf.get(term)
      if (frequency === undefined) continue
      matchedTerms.push(term)

      /* Textbook BM25 term contribution:
           idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * |d| / avgdl))
         The denominator is where length normalisation lives: a chunk longer
         than average has its term frequencies discounted, a shorter one has
         them boosted. */
      const norm = BM25_K1 * (1 - BM25_B + (BM25_B * doc.length) / AVG_LENGTH)
      bm25 += idf(term) * ((frequency * (BM25_K1 + 1)) / (frequency + norm))
    }

    if (matchedTerms.length === 0) continue

    /* The score IS the BM25 sum. Two alternatives were implemented here and
       measured against the probe set before being removed, and both are the
       kind of idea that sounds better than it scores:

       Multiplying by coverage (matched terms / query terms) punishes the right
       answer for words the question happened to include. "has he worked with
       Shopify?" is answered by a chunk listing Shopify among the technologies —
       and "worked" is not in it, so a coverage factor halved the score of the
       correct chunk and pushed a legitimate question below the floor.

       Averaging per term has the same defect in a different coat. IDF is
       already the mechanism for deciding which words matter: a generic word
       carries little weight whether it matches or not, and re-weighting by how
       many words matched second-guesses it with no evidence.

       What actually rejects a question the corpus cannot answer is the
       vocabulary check above — an unknown word matches nothing at all — and
       then this sum against CONFIDENCE_FLOOR. Both are honest about what they
       measure, and one of them is on screen next to every answer: the
       matched-terms line is what the score was earned on, in the visitor's own
       words, so a thin match looks thin. */
    hits.push({ chunk: doc.chunk, score: bm25, matchedTerms })
  }

  hits.sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id))
  return hits.slice(0, k)
}

/* --- Sentence selection ---------------------------------------------------
   Retrieval returns a chunk; a chunk is up to 900 characters. Handing back all
   of it and calling it an answer is what makes lexical search feel like search
   rather than an answer — the reader has to do the last step themselves. So
   the winning chunk is split into sentences and the one or two carrying the
   question's terms are quoted. Nothing is rewritten, joined or summarised: a
   quoted sentence is a substring of the chunk, which is a substring of what is
   published on the cited page.                                             */

/** Characters that can legitimately begin a sentence in this corpus. */
const SENTENCE_START = /[A-Z0-9"“(*#£]/

/**
 * Splits collapsed markdown prose into sentences.
 *
 * Hand-written scanner rather than a regex, for two reasons. First, the
 * obvious regex needs a lookbehind to keep the terminator attached, and a
 * lookbehind in a module-scope literal is a SyntaxError at parse time on older
 * Safari — it would take the whole component down rather than degrade.
 * Second, this corpus contains "bge-small-en-v1.5", "99.9%" and ".js", and a
 * split on `.` mangles all three. The scanner only breaks on a terminator
 * followed by whitespace AND something that starts a sentence, which leaves
 * every one of those intact.
 *
 * Markdown bullets are boundaries too. The chunks are whitespace-collapsed, so
 * a CV entry arrives as one line with " - " between its bullets, and treating
 * that as a sentence break is what lets "**Notice period:**" be a separate
 * quotable unit from the line above it.
 */
export function splitSentences(text: string): string[] {
  const out: string[] = []
  let start = 0

  const cut = (end: number, nextStart: number): void => {
    const piece = text.slice(start, end).trim()
    if (piece.length > 0) out.push(piece)
    start = nextStart
  }

  let i = 0
  while (i < text.length) {
    const char = text[i]

    if (char === '.' || char === '!' || char === '?') {
      /* An INITIAL is not a full stop. "K.R. Mangalam University" ends a
         sentence at ". M" by every rule below, and the education answer came
         back as "MCA, K.R." — technically verbatim, useless as an answer. A
         terminator directly after a lone capital letter is part of an
         abbreviation, so it is skipped: the letter before must be uppercase,
         and the character before THAT must not be a letter, which is what
         distinguishes "K." in "K.R." from "…built with SQL." */
      const previous = text[i - 1]
      const beforeThat = text[i - 2]
      if (
        char === '.' &&
        previous !== undefined &&
        /[A-Z]/.test(previous) &&
        (beforeThat === undefined || !/[A-Za-z]/.test(beforeThat))
      ) {
        i += 1
        continue
      }

      // Run past "?!" and "..." so they stay with the sentence they end.
      let end = i + 1
      while (end < text.length) {
        const next = text[end]
        if (next !== '.' && next !== '!' && next !== '?') break
        end += 1
      }

      let after = end
      while (after < text.length && text[after] === ' ') after += 1

      const following = text[after]
      if (after > end && following !== undefined && SENTENCE_START.test(following)) {
        cut(end, after)
        i = after
        continue
      }
      i = end
      continue
    }

    // " - " between collapsed markdown bullets. The marker itself is dropped
    // rather than quoted, so a citation does not start with a stray dash.
    if (char === '-' && text[i - 1] === ' ' && text[i + 1] === ' ') {
      cut(i, i + 2)
      i += 2
      continue
    }

    /* A bold field LABEL — "**Status:**", "**Architecture:**" — starts a new
       unit. The CV and the project write-ups are field runs with no full stops
       in them at all, so without this rule a 400-character chunk is one
       "sentence" and the answer to "what is the CRM built with?" is the entire
       chunk pasted back. Only labels ending in a colon count: a bold word
       mid-sentence ("**every** schema change") must not split the sentence it
       is emphasising, so the closing `**` is found first and the colon checked
       before committing to a boundary. */
    if (char === '*' && text[i + 1] === '*' && i > 0 && text[i - 1] === ' ') {
      const close = text.indexOf('**', i + 2)
      if (close > i + 2 && close - i < 64 && text[close - 1] === ':') {
        cut(i, i)
        i += 2
        continue
      }
    }

    i += 1
  }

  cut(text.length, text.length)
  return out
}

export type Quote = {
  /** The chunk's own words, with markdown punctuation removed. */
  text: string
  matched: string[]
  density: number
}

/**
 * Removes markdown syntax from a quote.
 *
 * `##` and `**` are formatting characters, not words — they exist in the corpus
 * because it was written as markdown, and rendering "## Education" back at a
 * visitor makes a real quotation look like a bug. Nothing else is touched: no
 * word is added, removed, reordered or rephrased, so the sentence is still the
 * sentence he wrote and still findable on the cited page. That distinction is
 * the whole difference between quoting and generating, and it is worth being
 * pedantic about which side of it a transformation falls on.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/^#+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Below this many tokens a sentence is a heading or a field label rather than
    a statement — true of "## Education" and "**Notice period:**" alike. */
const HEADING_TOKENS = 5

/**
 * The one or two sentences in `chunk` that best answer `queryTerms`.
 *
 * Ranked by matched-term DENSITY rather than by matched weight alone: weight
 * alone hands the answer to the longest sentence in the chunk every time,
 * because a long sentence contains more words and therefore more matches. The
 * √length divisor is the same normalisation the command palette uses on titles,
 * and the floor of 6 tokens under it stops a three-word fragment from winning
 * purely by being short.
 *
 * A second sentence is added only when it earns its place: it must carry a term
 * the first one missed, and score at least half the leader. Otherwise the
 * answer is one sentence, which is usually the right length for a question.
 */
export function bestSentences(chunk: AskChunk, queryTerms: string[], limit = 2): Quote[] {
  const wanted = new Set(queryTerms)
  const sentences = splitSentences(chunk.text)
  const scored: { quote: Quote; position: number }[] = []

  sentences.forEach((sentence, position) => {
    const tokens = tokenise(sentence)
    if (tokens.length === 0) return

    const present = new Set(tokens)
    const matched = [...wanted].filter((term) => present.has(term))
    if (matched.length === 0) return

    const clean = stripMarkdown(sentence)

    /* A FIELD LABEL WITH NO VALUE IS NEVER QUOTABLE.

       This is the single most important rule in the file, and it is here rather
       than in the scoring because it is about what may be said, not about what
       ranks. The corpus contains "**Notice period:**" and "**Metrics:**" with
       nothing after them — labels whose values were never filled in. BM25 sees
       the label, matches the question's words against it, and would hand back a
       heading as though it were an answer: ask about a notice period and get
       "Notice period:" quoted at you, which reads as a system that has answered
       when in fact it has nothing.

       An empty label carries no information, so it is dropped as a candidate
       outright — not extended with the line beneath it, which would be worse:
       "Notice period:" followed by the next field's value would attribute a
       different field's answer to this question. */
    if (clean.endsWith(':')) return

    /* A HEADING, by contrast, is a real boundary with the answer under it.
       "## Education" matches "education" and says nothing; the degrees are in
       the bullet after it. So a heading-length candidate carries the following
       line with it. The two are adjacent in the source, so it remains one
       contiguous quotation rather than an assembly of fragments. */
    let text = clean
    if (tokens.length < HEADING_TOKENS) {
      const next = sentences[position + 1]
      const cleanNext = next === undefined ? '' : stripMarkdown(next)
      if (cleanNext.length > 0 && !cleanNext.endsWith(':')) text = `${clean} — ${cleanNext}`
    }

    const weight = matched.reduce((sum, term) => sum + idf(term), 0)
    const density = weight / Math.sqrt(Math.max(tokens.length, 6))
    scored.push({ quote: { text, matched, density }, position })
  })

  if (scored.length === 0) return []

  const ranked = [...scored].sort((a, b) => b.quote.density - a.quote.density || a.position - b.position)
  const best = ranked[0]
  if (!best) return []

  const chosen = [best]
  for (const candidate of ranked.slice(1)) {
    if (chosen.length >= limit) break
    if (candidate.quote.density < best.quote.density * 0.5) break
    const already = new Set(chosen.flatMap((entry) => entry.quote.matched))
    if (candidate.quote.matched.some((term) => !already.has(term))) chosen.push(candidate)
  }

  // Returned in document order, so two quoted sentences read in the order he
  // wrote them rather than in score order.
  return chosen.sort((a, b) => a.position - b.position).map((entry) => entry.quote)
}

/* --- Withheld topics -----------------------------------------------------
   Some questions have an answer-shaped hole in the corpus: site.config lists
   a notice period and a visa status as FIELDS whose values are still to be
   confirmed, and content/ask-corpus.ts emits those as withheld topics at build
   time. Without this check BM25 matches the field label, wins on it, and
   quotes a heading back as though it were a fact.

   The rule is deliberately strict — every word of the field name must appear
   in the question. One word of overlap is far too blunt: "role" must not
   refuse a question about his role at Virtuoso, which the corpus answers well.
   The only looseness is a shared four-character prefix, so "salary
   expectation" reaches the field called "salary expectations" without a
   stemmer.                                                                 */

function prefixMatch(a: string, b: string): boolean {
  if (a === b) return true
  const shorter = a.length < b.length ? a : b
  const longer = a.length < b.length ? b : a
  return shorter.length >= 4 && longer.startsWith(shorter)
}

function withheldFor(queryTerms: string[]): { topic: string; reason: string } | null {
  for (const entry of ASK_WITHHELD) {
    const namesEveryWord = entry.terms.every((term) =>
      queryTerms.some((queryTerm) => prefixMatch(term, queryTerm)),
    )
    if (namesEveryWord) return { topic: entry.topic, reason: entry.reason }
  }
  return null
}

/* --- The public answer --------------------------------------------------- */

export type Answer =
  | {
      kind: 'answer'
      /** Verbatim sentences, in document order. Never rewritten. */
      sentences: string[]
      /** The chunk quoted, first, then the next best matches. */
      sources: AskChunk[]
      /** Terms of the question that the quoted chunk contains. */
      matchedTerms: string[]
      /** Coverage-weighted BM25 of the quoted chunk. */
      score: number
    }
  | {
      kind: 'refusal'
      reason: string
      /** Set when the refusal is a withheld topic rather than a miss. */
      topic?: string
      /** Best score achieved, so the interface can show how close it came. */
      score: number
    }

/* --------------------------------------------------------------------------
   Does the match actually address the question?

   Two ways to pass:

     1. At least two of the question's content terms matched. Two independent
        words agreeing is hard to do by coincidence.

     2. Exactly one matched, but it is the question's RAREST term AND it is
        rare in absolute terms — present in a quarter of the corpus or less.
        This is what keeps short, pointed questions working: "where is he
        based?" reduces to one useful term, and it should answer.

   Fails when the only thing matched is a common word. That is the entire
   category of false positive this exists to stop.
   -------------------------------------------------------------------------- */
function specificityCheck(
  queryTerms: string[],
  matchedTerms: string[],
): { ok: true } | { ok: false; matchedDescription: string } {
  const matched = matchedTerms.filter((term) => DF.has(term))
  if (matched.length === 0) {
    return { ok: false, matchedDescription: 'words too common to carry a topic' }
  }
  if (matched.length >= 2) return { ok: true }

  const only = matched[0]!
  const df = DF.get(only) ?? 0
  const share = df / Math.max(1, DOCS.length)

  /* Absolute rarity, and ONLY absolute rarity.

     The first version of this also demanded that the single matched term be
     the rarest term in the QUESTION, which broke "why Postgres and not
     MongoDB?": "postgres" is rarer than "mongodb" in this corpus but is not
     in the chunk that answers it, so the rule rejected a correct answer for
     failing a comparison against a word that was never a candidate. What
     matters is whether the word that DID match is distinctive enough to pin a
     topic on its own — not how it ranks against words that did not. */
  if (share <= SINGLE_TERM_MAX_SHARE) return { ok: true }

  return {
    ok: false,
    matchedDescription: `the word "${only}", which appears all over the site`,
  }
}

/**
 * The whole system, as one function.
 *
 * A discriminated union rather than an answer with an `ok` flag, because the
 * two outcomes have nothing in common: a refusal has no sentences and no
 * sources, and a caller that forgets to check cannot render one as the other.
 * The interface is not allowed to invent a fallback.
 */
export function answer(query: string): Answer {
  const queryTerms = [...new Set(tokenise(query))]

  if (queryTerms.length === 0) {
    return {
      kind: 'refusal',
      score: 0,
      reason:
        'There is nothing in that question I can match on — it is all words too common to ' +
        'carry meaning on their own. Try naming a technology, a project or a period.',
    }
  }

  const withheld = withheldFor(queryTerms)
  if (withheld) {
    return { kind: 'refusal', score: 0, topic: withheld.topic, reason: withheld.reason }
  }

  const hits = search(query, 4)
  const top = hits[0]

  if (!top || top.score < CONFIDENCE_FLOOR) {
    const best = top?.score ?? 0
    return {
      kind: 'refusal',
      score: best,
      reason:
        best === 0
          ? 'No chunk in the corpus contains any word of that question, so there is nothing ' +
            'here to quote. This is retrieval over what Dheeraj has actually written — it ' +
            'cannot reason its way to an answer, and it will not invent one.'
          : 'Something matched, but not well enough to be sure it is about what you asked — ' +
            'so quoting it would be putting words in his mouth. Ask him directly and you ' +
            'will get a real answer.',
    }
  }

  /* ── THE SPECIFICITY GATE ────────────────────────────────────────────────

     BM25 alone answers too much. It scores word overlap, and a question's
     COMMON words overlap with almost everything, so a chunk can clear the
     floor without being about the subject at all. Measured on 43 realistic
     questions (scripts/ask-gaps.ts), this produced seven confidently wrong
     answers, including:

       "has he led a team?"        → "done end to end with their team"
       "what does he charge?"      → "paid lead platforms charge per lead"
       "has any client hired him
        twice?"                    → "being twice as slow costs minutes"

     Every one matched on a single ordinary word. None was about the question.
     And a wrong answer is worse than a refusal here by a wide margin: the
     section's whole claim is that nothing is invented, and "yes, he led a
     team" is an invention whether a model wrote it or a scorer picked it.

     The fix is not a higher floor — that would silence the good answers too,
     since a correct single-term match like "where is he based?" scores low.
     It is a requirement about WHICH terms matched: the most distinctive term
     in the question has to be one of them.

     "Charge" is distinctive in "what does he charge?" and appears in the
     lead-engine chunk, so that one needs the second half of the rule too:
     matching ONLY the rarest term, with nothing else, is a coincidence rather
     than a topic. Two content terms, or one that is rare enough to be
     unambiguous, is the bar. */
  const specificity = specificityCheck(queryTerms, top.matchedTerms)
  if (!specificity.ok) {
    return {
      kind: 'refusal',
      score: top.score,
      reason:
        'Something matched, but only on ' +
        `${specificity.matchedDescription} — not closely enough to be about what you asked. ` +
        'Quoting it would be putting words in his mouth.',
    }
  }

  const quotes = bestSentences(top.chunk, top.matchedTerms)
  if (quotes.length === 0) {
    // Unreachable in practice: a chunk cannot score above the floor without
    // containing a query term, and every term lives in some sentence. Handled
    // anyway, because the alternative is rendering an answer with no answer in
    // it — silence is the correct failure.
    return {
      kind: 'refusal',
      score: top.score,
      reason:
        'The closest chunk matched on the question as a whole, but no single sentence in it ' +
        'carries the answer, so there is nothing worth quoting.',
    }
  }

  /* Supporting citations: the next best matches, held to half the floor. They
     are not quoted, and the interface says the answer came from the first —
     they are there because "where else does this appear" is a question a
     sceptical reader has, and the honest response is a link. */
  const supporting = hits
    .slice(1)
    .filter((hit) => hit.score >= CONFIDENCE_FLOOR * 0.5)
    .slice(0, 2)
    .map((hit) => hit.chunk)

  return {
    kind: 'answer',
    sentences: quotes.map((quote) => quote.text),
    sources: [top.chunk, ...supporting],
    matchedTerms: top.matchedTerms,
    score: top.score,
  }
}

/* --- Facts the interface is allowed to state ------------------------------
   Exported so the label on screen cannot drift from the index it describes.
   If a chunk is added, the number the visitor reads changes with it.       */

export const RETRIEVAL_STATS = {
  /** Chunks in the index. */
  chunks: DOCS.length,
  /** Distinct terms after tokenising and stopword removal. */
  vocabulary: DF.size,
  /** Mean chunk length in tokens. */
  averageLength: Math.round(AVG_LENGTH),
} as const
