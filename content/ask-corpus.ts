/* ==========================================================================
   ASK CORPUS — GENERATED. DO NOT EDIT.

   Written by scripts/build-lab-data.ts (see the ASK CORPUS section there for
   the reasoning). Run `npm run build:lab` to rebuild.

   This is the corpus lib/retrieval.ts scores with BM25 and quotes verbatim.
   Two halves, and the difference matters:

      15 chunks  of the 23 in the embedded RAG index, imported from
                ./lab-data rather than copied — the Lab already ships that text
                on the same page. 8 are excluded; the reasons are listed
                against each id below.
     192 chunks  cut here from the site's own current content: the about
                page and the 11 case studies. 61791 characters of prose
                that is published on a route a visitor can open and check.

   Nothing in here is written by the build. One chunk is TEMPLATED from
   structured fields (location, timezone, availability, role, email) and it is
   marked as such below; everything else is prose lifted intact.
   ========================================================================== */

import { LAB_POINTS } from '@/content/lab-data'

export type AskChunk = {
  /** Stable id. `idx-*` came from the embedded index; the rest were cut here. */
  id: string
  /** Which document it came from — shown on the citation chip. */
  source: string
  /** Human label for the chip, so a citation reads as a place. */
  label: string
  /** Route where this text can be read in context, or null if it has no page. */
  href: string | null
  /** The text, whitespace collapsed. Quoted verbatim; never paraphrased. */
  text: string
}

/* Where each embedded chunk can be read. The index predates the current routes,
   so this mapping is stated rather than derived. */
const INDEX_HREF: Record<string, string> = {
  "cv": "/cv",
  "faq": "/about",
  "intros": "/about"
}

/* Chunks the Lab plots but this system will not quote. A picture of a corpus is
   not a claim about the world; an answer is. Reason per id:
     c9   FAQ answer describing WebLLM streaming inference on this site — the shipped site runs no model
     c14  engineer intro claiming a static export with transformers.js retrieval and WebLLM inference
     c15  founder intro citing "the in-browser LLM answering questions on this page"
     c16  the portfolio-RAG write-up: Qwen2.5-1.5B on WebGPU, an architecture that was never shipped
     c17  CRM outline with unanswered questions and empty metrics — superseded by /work/crm
     c18  lead-engine outline, questions to self — superseded by /work/leadhouse
     c19  ads-analyser outline, questions to self — superseded by /work/ads-analyser
     c20  voiceover-platform outline, questions to self — superseded by /work/studio
*/
const SUPERSEDED = new Set(["c9","c14","c15","c16","c17","c18","c19","c20"])

/** The embedded index, minus the superseded chunks, as retrieval chunks. */
const INDEXED: AskChunk[] = LAB_POINTS.filter((point) => !SUPERSEDED.has(point.id)).map(
  (point) => ({
    id: `idx-${point.id}`,
    source: point.source,
    label: point.label,
    href: INDEX_HREF[point.source] ?? null,
    text: point.text,
  }),
)

/** Cut from lib/site.config.ts and content/projects.ts at build time. */
export const ASK_SUPPLEMENT: AskChunk[] = [
  {
    "id": "about-01",
    "source": "about",
    "href": "/about",
    "label": "Where I started",
    "text": "Where I started. I started in Patna in 2022, shipping websites to clients three time zones away — WordPress, WooCommerce and Shopify, mostly for people in Canada, the US and the UK. No team and no safety net, which meant scoping, building, deploying and supporting each project myself. That is also where I learned performance properly, because a slow page loses a client money and they tell you about it."
  },
  {
    "id": "about-02",
    "source": "about",
    "href": "/about",
    "label": "What I build now",
    "text": "What I build now. Products with real users. I moved to Gurgaon in 2023 for an MCA and spent those years building MERN products at night — dashboards, REST APIs and asset flows at Virtuoso.live, handling over a thousand requests a day. Since April 2025 I have been at Mirasphere Digital doing agency delivery in React, PHP and WordPress, and building software of my own alongside it: a practice CRM that Fordham Finance Group now runs its business on, a lead engine that reads the entire UK company register, and a pipeline that turns a script into a finished voiceover video."
  },
  {
    "id": "about-03",
    "source": "about",
    "href": "/about",
    "label": "What I have learned",
    "text": "What I have learned. Two things, both the expensive way. First, a rule that has to be remembered in every handler will eventually be forgotten — a security audit on my own CRM code found an insecure direct object reference, and the real fix was not the handler but asserting tenant scoping structurally on all 197 routes. Second, for anything that touches historical data, the failure mode to design against is not an error but a silent success: the BrightManager importer defaults to a dry run because a migration that looks like it worked is far more dangerous than one that stops."
  },
  {
    "id": "about-04",
    "source": "about",
    "href": "/about",
    "label": "What I am exploring",
    "text": "What I am exploring. LLM engineering, from the practical end: RAG pipelines, embeddings with transformers.js, and in-browser inference with WebLLM and WebGPU. What interests me is the judgement rather than the novelty — my Meta ads analyser is deliberately rule-based, because at a few hundred ads deterministic clustering beats a model on cost, speed and being able to explain the answer. Alongside that, TypeScript and Next.js in depth, which is what this site is built in."
  },
  {
    "id": "about-05",
    "source": "about",
    "href": "/about",
    "label": "Timeline",
    "text": "Timeline. 2022: Patna. First freelance clients — WordPress, WooCommerce, Shopify — for businesses in Canada, the US and the UK. 2023: Gurgaon. Started an MCA at K.R. Mangalam University while continuing to deliver freelance and agency work. 2024: Frontend developer intern at Virtuoso.live — three dashboards and five REST endpoints handling 1,000+ requests a day. 2025: Website developer at Mirasphere Digital, and the start of building products of my own."
  },
  {
    "id": "profile-06",
    "source": "profile",
    "href": "/about",
    "label": "Location and availability",
    "text": "Location and availability. Dheeraj Kumar is based in Gurgaon, India, and works in the Asia/Kolkata time zone (IST). His role is Web & Software Developer. Current status: Available for new projects. He can be reached by email at okkdheeraj@gmail.com."
  },
  {
    "id": "work/crm-07",
    "source": "work/crm",
    "href": "/work/crm",
    "label": "FFS Manager — Practice CRM",
    "text": "FFS Manager — Practice CRM. The software Fordham Finance Group runs its practice on, in place of a £500-per-user-per-year subscription. Role: Sole developer, end to end — at Mirasphere Digital, for an agency client. Status: live, 2026, ~8 weeks from first line to production. Built for Fordham Finance Group. Stack: TypeScript, Fastify, PostgreSQL, Prisma, Redis, BullMQ, React, Socket.IO, Docker."
  },
  {
    "id": "work/crm-08",
    "source": "work/crm",
    "href": "/work/crm",
    "label": "FFS Manager — Practice CRM — context",
    "text": "Fordham Finance Group ran its practice on BrightManager at roughly £500 per user per year — and kept hitting its limits on the workflows they actually needed. The subscription was the cheap part of the problem; the expensive part was the work that had to happen outside the software because the software would not bend. Fordham came to Mirasphere Digital, where I was the only developer on the project from the data model through to deployment and support — and directing an AI pair — Claude — throughout, which is the only reason a replacement of this scope was deliverable by one person. That arrangement is written up as a decision rather than mentioned as a footnote, because the interesting part is not that AI was used but which half of the work stayed mine."
  },
  {
    "id": "work/crm-09",
    "source": "work/crm",
    "href": "/work/crm",
    "label": "FFS Manager — Practice CRM — the problem",
    "text": "Replace the firm’s core operating software — clients, UK tax deadlines, documents, signatures, billing, client portal — without losing a single record, while the firm kept working."
  },
  {
    "id": "work/crm-10",
    "source": "work/crm",
    "href": "/work/crm",
    "label": "FFS Manager — Practice CRM — approach",
    "text": "A one-day Express and SQLite prototype first, to validate the data model against the firm’s actual workflows before committing to anything. That prototype earned the production rebuild: a Fastify and PostgreSQL monorepo, additive-only migrations as a rule rather than a preference, and a dry-run-by-default CSV importer as the escape hatch from the old system."
  },
  {
    "id": "work/crm-11",
    "source": "work/crm",
    "href": "/work/crm",
    "label": "FFS Manager — Practice CRM — implementation",
    "text": "One monorepo, one deployable API. Fastify serves 197 schema-validated routes across 16 modules, with 12 background services behind Redis and BullMQ so the nightly Companies House sync, the deadline reminders and the encrypted backups never sit on a request. Prisma models the compliance domain properly — 55 models, 28 enums — and every schema change ships as an additive migration, 26 of them against production so far, because a destructive migration against a firm’s live client history is not a mistake you get to make twice. The two parts worth interrogating are the importer and the signature flow. The importer is a custom RFC-4180 parser with a non-destructive merge and a dry run by default, because BrightManager’s exports quote inconsistently and the failure mode of getting that wrong is silent corruption of the firm’s history."
  },
  {
    "id": "work/crm-12",
    "source": "work/crm",
    "href": "/work/crm",
    "label": "FFS Manager — Practice CRM — implementation (cont.)",
    "text": "E-signatures are built in-house — sequential and parallel signer ordering, PDF stamping, an append-only audit trail — because per-envelope pricing would have quietly reintroduced the subscription the project existed to remove."
  },
  {
    "id": "work/crm-13",
    "source": "work/crm",
    "href": "/work/crm",
    "label": "FFS Manager — Practice CRM — what was hard (1/3)",
    "text": "BrightManager exports quoted CSV fields inconsistently, so off-the-shelf parsing produced plausible-looking but wrong records — the worst possible outcome when the data is a firm’s client history"
  },
  {
    "id": "work/crm-14",
    "source": "work/crm",
    "href": "/work/crm",
    "label": "FFS Manager — Practice CRM — what was hard (2/3)",
    "text": "A security audit I ran on my own code found an IDOR: an authenticated user could reach a record belonging to another tenant"
  },
  {
    "id": "work/crm-15",
    "source": "work/crm",
    "href": "/work/crm",
    "label": "FFS Manager — Practice CRM — what was hard (3/3)",
    "text": "E-signatures needed DocuSign-class flows — sequential and parallel signers, a real audit trail — without DocuSign’s per-envelope pricing"
  },
  {
    "id": "work/crm-16",
    "source": "work/crm",
    "href": "/work/crm",
    "label": "FFS Manager — Practice CRM — how it was solved",
    "text": "The CSV problem was solved by not trusting a library: a parser written to RFC 4180 with a non-destructive merge, run as a dry run first so a bad import produces a report instead of a rollback. The IDOR was fixed in the offending handler, and then properly: multi-tenant scoping is now asserted on every route rather than trusted to each one to remember, because the class of bug matters more than the instance. E-signatures were built rather than bought — signer ordering, PDF stamping and audit events took roughly two weeks and now cost nothing per envelope, fully joined to the client records they belong to."
  },
  {
    "id": "work/crm-17",
    "source": "work/crm",
    "href": "/work/crm",
    "label": "FFS Manager — Practice CRM — outcome",
    "text": "The firm runs on it. It is live at crm.fordhamfinance.co.uk with real client and team data, it absorbed years of BrightManager history without losing a record, and it replaces roughly £500 per user per year of subscription cost with a workflow that bends when the firm needs it to."
  },
  {
    "id": "work/crm-18",
    "source": "work/crm",
    "href": "/work/crm",
    "label": "FFS Manager — Practice CRM — in hindsight",
    "text": "The one-day prototype earned the rebuild — it proved the data model cheaply, before anything expensive was committed. What I would change is the order of the safety work: the test suite should have arrived earlier, and the security audit should have been continuous rather than an event. Finding an IDOR in your own code is a good day; finding it because you finally sat down to look is a lesson about scheduling."
  },
  {
    "id": "work/crm-19",
    "source": "work/crm",
    "href": "/work/crm",
    "label": "FFS Manager — Practice CRM — measured results",
    "text": "Measured results. API endpoints in production: 197 — self-measured, measured 2026-08-01. Across 16 modules, with 12 background services. Additive migrations against production: 26 — self-measured, measured 2026-08-01. Zero data loss. TypeScript in the monorepo: ~30,000 lines — self-measured, measured 2026-08-01."
  },
  {
    "id": "work/leadhouse-20",
    "source": "work/leadhouse",
    "href": "/work/leadhouse",
    "label": "CH Scrapper — Lead Engine",
    "text": "CH Scrapper — Lead Engine. The UK’s entire public company register, turned into pre-qualified leads at zero cost per lead. Role: Sole developer, end to end — at Mirasphere Digital, for an agency client. Status: live, 2026. Built for Swann Bookkeeping & Accountancy. Stack: Python, pandas, FastAPI, PostgreSQL, React, Docker, Caddy."
  },
  {
    "id": "work/leadhouse-21",
    "source": "work/leadhouse",
    "href": "/work/leadhouse",
    "label": "CH Scrapper — Lead Engine — context",
    "text": "Accountants win clients whose filing deadlines are close. Companies House publishes every company’s accounts due date and offers no way to query for it, and the paid lead platforms that fill that gap charge per lead for data that is already public."
  },
  {
    "id": "work/leadhouse-22",
    "source": "work/leadhouse",
    "href": "/work/leadhouse",
    "label": "CH Scrapper — Lead Engine — the problem",
    "text": "Turn the UK’s public company register into a pipeline of pre-qualified, contactable leads — at zero marginal cost per lead."
  },
  {
    "id": "work/leadhouse-23",
    "source": "work/leadhouse",
    "href": "/work/leadhouse",
    "label": "CH Scrapper — Lead Engine — approach",
    "text": "Hybrid by design. Source offline from the full bulk register with pandas in 25,000-row chunks, verify online through the rate-limited REST API, and make every long job restart-survivable: resumable batches with an auto-advancing cursor, and an orphan-job sweep on boot. The bulk file answers \"who might be due\" for free; the API answers \"who actually is\" for the few hundred that matter."
  },
  {
    "id": "work/leadhouse-24",
    "source": "work/leadhouse",
    "href": "/work/leadhouse",
    "label": "CH Scrapper — Lead Engine — implementation",
    "text": "Ingest reads the monthly register in 25,000-row chunks, so memory stays flat whatever the file does. Filtering happens locally against Postgres, which makes the definition of a good lead cheap to change. Verification is the expensive stage and is treated as such: a sliding-window limiter pinned at half the published ceiling, an eight-step backoff that honours Retry-After, and separate handling for 429, 404, 5xx and TLS failures, because retrying a 404 forever is how you get banned for a company that does not exist. Verdicts cache for 30 days. Enrichment scores matches on evidence rather than similarity — a registered company number in a site footer scores 95, a postcode match 80 — and Hunter fills the contact gap only after a match is trusted."
  },
  {
    "id": "work/leadhouse-25",
    "source": "work/leadhouse",
    "href": "/work/leadhouse",
    "label": "CH Scrapper — Lead Engine — implementation (cont.)",
    "text": "Nine Postgres tables hold jobs, cursors, the verdict cache and the suppression list; the cursor auto-advances so a batch killed by a deploy resumes rather than restarts, and an orphan-job sweep on boot cleans up whatever the last restart left mid-flight."
  },
  {
    "id": "work/leadhouse-26",
    "source": "work/leadhouse",
    "href": "/work/leadhouse",
    "label": "CH Scrapper — Lead Engine — what was hard (1/3)",
    "text": "Long jobs died mid-batch on deploys and restarts, losing hours of scanning"
  },
  {
    "id": "work/leadhouse-27",
    "source": "work/leadhouse",
    "href": "/work/leadhouse",
    "label": "CH Scrapper — Lead Engine — what was hard (2/3)",
    "text": "The bulk snapshot flagged companies as due that were not: live verification found only 83 of 162 flagged companies were actually overdue"
  },
  {
    "id": "work/leadhouse-28",
    "source": "work/leadhouse",
    "href": "/work/leadhouse",
    "label": "CH Scrapper — Lead Engine — what was hard (3/3)",
    "text": "Distinguishing 429, 404, 5xx and TLS failures so each got the correct retry behaviour rather than a generic one"
  },
  {
    "id": "work/leadhouse-29",
    "source": "work/leadhouse",
    "href": "/work/leadhouse",
    "label": "CH Scrapper — Lead Engine — how it was solved",
    "text": "Resumability was solved with slice-and-continue batches and an auto-advancing cursor, plus an orphan-job sweep on boot — one 42,119-row batch was processed across five resumed runs without losing position. Staleness was solved by refusing to trust the snapshot: the bulk file produces candidates, and the live REST profile decides. Retry behaviour was solved by classifying failures properly and building an eight-step backoff that honours Retry-After, which is why 22 production scrape jobs have run without a single rate-limit incident."
  },
  {
    "id": "work/leadhouse-30",
    "source": "work/leadhouse",
    "href": "/work/leadhouse",
    "label": "CH Scrapper — Lead Engine — outcome",
    "text": "It fills the firm’s outreach pipeline at zero cost per lead, with every lead pre-qualified by a live-verified filing deadline rather than a stale flag — and it does it from data that was already public."
  },
  {
    "id": "work/leadhouse-31",
    "source": "work/leadhouse",
    "href": "/work/leadhouse",
    "label": "CH Scrapper — Lead Engine — in hindsight",
    "text": "Rejecting the Streaming API was right, and it was the decision the whole design rests on: streaming answers \"what changed\", and the business question is \"who is due\", which is a full-register scan. The next leap is not more coverage but better ranking — scoring leads by likelihood to switch accountants rather than by deadline alone, because a deadline tells you who is under pressure and not who is unhappy."
  },
  {
    "id": "work/leadhouse-32",
    "source": "work/leadhouse",
    "href": "/work/leadhouse",
    "label": "CH Scrapper — Lead Engine — measured results",
    "text": "Measured results. Register cohort scanned: 171,876 companies in ~6 minutes — self-measured, measured 2026-08-01. Companies matched in one imported batch: 8,668 from 42,119 rows — self-measured, measured 2026-08-01. Rate-limit incidents: 0 across 22 production jobs — self-measured, measured 2026-08-01."
  },
  {
    "id": "work/ads-analyser-33",
    "source": "work/ads-analyser",
    "href": "/work/ads-analyser",
    "label": "Competitive Ads Extractor",
    "text": "Competitive Ads Extractor. A competitor list in, every live Facebook and Instagram ad out — clustered into hooks, offers and gaps. Role: Sole developer. Status: live, 2026. Built for marketing work where competitor ad research was being done by hand, one ad at a time. Stack: Node.js, Meta Ad Library API, PDFKit."
  },
  {
    "id": "work/ads-analyser-34",
    "source": "work/ads-analyser",
    "href": "/work/ads-analyser",
    "label": "Competitive Ads Extractor — context",
    "text": "Knowing what competitors are running on Facebook and Instagram means manually trawling the Meta Ad Library, ad by ad — a job that is tedious at ten ads and impossible at three hundred."
  },
  {
    "id": "work/ads-analyser-35",
    "source": "work/ads-analyser",
    "href": "/work/ads-analyser",
    "label": "Competitive Ads Extractor — the problem",
    "text": "One command in: a competitor list. One report out: every live ad, clustered into hooks, offers, and the angles nobody in the market has claimed."
  },
  {
    "id": "work/ads-analyser-36",
    "source": "work/ads-analyser",
    "href": "/work/ads-analyser",
    "label": "Competitive Ads Extractor — approach",
    "text": "Deliberately dependency-light: three packages, no framework, no database, and a rule-based analysis pipeline that is deterministic, free and auditable. The hard engineering went somewhere less glamorous — three-tier competitor resolution that accepts a page URL, a brand name, or a bare domain, because that is the input a real user actually has. [CONFLICT TO RESOLVE — THIS PAGE DESCRIBES A LOCAL TOOL WITH NO DATABASE AND TIMESTAMPED FOLDERS AS THE DATASTORE, BUT THE LIVE CONSOLE HAS USER REGISTRATION, ADMIN APPROVAL AND SAVED RUN HISTORY. SAY WHETHER THE HOSTED APP WRAPS THE SAME FILESYSTEM ENGINE OR ADDED A REAL DATABASE, AND WHETHER THE THREE-DEPENDENCY AND NO-DATABASE CLAIMS STILL HOLD]"
  },
  {
    "id": "work/ads-analyser-37",
    "source": "work/ads-analyser",
    "href": "/work/ads-analyser",
    "label": "Competitive Ads Extractor — implementation",
    "text": "Resolution runs twelve patterns across three user-agent identities, because Facebook shows a link-preview crawler things it will not show a browser without a session — that is the difference between the tool working on a bare domain and asking the user to go and find a page ID. The fetcher pages through Ad Library API v21 with backoff, and treats EU DSA data caveats as annotations on the result rather than errors. 9 Jaccard similarity before anything is counted, then creative is classified into 11 hook types and a 9-offer matrix, and the interesting output falls out of the negative space — a 10-angle gap map naming the emotional angles nobody in a market has claimed. Every run writes a timestamped folder containing a single-file dashboard, Markdown, CSV, JSON and a PDF, which means there is no database and no export step. Token redaction is applied on every error path, because the fastest way to leak an API token is a stack trace nobody expected to see."
  },
  {
    "id": "work/ads-analyser-38",
    "source": "work/ads-analyser",
    "href": "/work/ads-analyser",
    "label": "Competitive Ads Extractor — what was hard (1/3)",
    "text": "Facebook page-ID resolution behind login walls, where a plain request returns nothing useful"
  },
  {
    "id": "work/ads-analyser-39",
    "source": "work/ads-analyser",
    "href": "/work/ads-analyser",
    "label": "Competitive Ads Extractor — what was hard (2/3)",
    "text": "Near-duplicate ads polluting the clusters, making a single creative look like a campaign trend"
  },
  {
    "id": "work/ads-analyser-40",
    "source": "work/ads-analyser",
    "href": "/work/ads-analyser",
    "label": "Competitive Ads Extractor — what was hard (3/3)",
    "text": "Keeping the API token out of every error path, including the ones that only fire when something else has already gone wrong"
  },
  {
    "id": "work/ads-analyser-41",
    "source": "work/ads-analyser",
    "href": "/work/ads-analyser",
    "label": "Competitive Ads Extractor — how it was solved",
    "text": "Resolution was solved with a user-agent strategy and pattern redundancy rather than a headless browser — twelve patterns and three identities, so no single markup change takes the tool down. Duplicate pollution was solved by folding at 0.9 Jaccard similarity before classification, so clusters count distinct creative rather than repeats. Token leakage was solved by treating redaction as a discipline applied at the logging boundary, not a filter added to individual handlers."
  },
  {
    "id": "work/ads-analyser-42",
    "source": "work/ads-analyser",
    "href": "/work/ads-analyser",
    "label": "Competitive Ads Extractor — outcome",
    "text": "Twenty-three real analysis runs across six verticals, 361 ads analysed, and gap maps that name the emotional angles nobody in a market has claimed — produced at zero analysis cost by a tool that installs with three dependencies."
  },
  {
    "id": "work/ads-analyser-43",
    "source": "work/ads-analyser",
    "href": "/work/ads-analyser",
    "label": "Competitive Ads Extractor — in hindsight",
    "text": "Choosing not to use an LLM was the engineering decision here. At this scale deterministic rules beat a model on cost, speed and auditability, and being able to explain why an ad landed in a cluster is worth more to the person reading the report than a better-sounding summary. An optional LLM layer on top of the clusters is the obvious v2 — on top, not instead of."
  },
  {
    "id": "work/ads-analyser-44",
    "source": "work/ads-analyser",
    "href": "/work/ads-analyser",
    "label": "Competitive Ads Extractor — measured results",
    "text": "Measured results. Real analysis runs: 23 across 6 verticals — self-measured, measured 2026-08-01. Ads analysed: 361 — self-measured, measured 2026-08-01. Runtime dependencies: 3 — self-measured, measured 2026-08-01. No framework, no database."
  },
  {
    "id": "work/studio-45",
    "source": "work/studio",
    "href": "/work/studio",
    "label": "Mirasphere Studio",
    "text": "Mirasphere Studio. Script in, finished voiceover video out — including a lip-synced presenter built from one still photo. Role: Sole developer, end to end — an in-house product at Mirasphere Digital. Status: live, 2026. Built for Mirasphere Digital, as its own product rather than for a client. Stack: Next.js, TypeScript, Remotion, ElevenLabs, Kling, ffmpeg, Prisma."
  },
  {
    "id": "work/studio-46",
    "source": "work/studio",
    "href": "/work/studio",
    "label": "Mirasphere Studio — context",
    "text": "A short marketing video normally needs an editor, a voice artist and days of turnaround, which puts it out of reach for exactly the work that needs it most — many small variations rather than one polished film."
  },
  {
    "id": "work/studio-47",
    "source": "work/studio",
    "href": "/work/studio",
    "label": "Mirasphere Studio — the problem",
    "text": "Make video production a form submission: script in, finished voiceover video out — including a lip-synced AI presenter."
  },
  {
    "id": "work/studio-48",
    "source": "work/studio",
    "href": "/work/studio",
    "label": "Mirasphere Studio — approach",
    "text": "An orchestration pipeline where every paid step — text-to-speech, speech-to-text, image-to-video, lip-sync — checkpoints its output, and Remotion’s timeline is driven by real word-level timestamps taken from the narration rather than estimated from a words-per-minute figure. The pipeline assumes third-party APIs will be slow and flaky, and is built so that being slow and flaky costs nothing."
  },
  {
    "id": "work/studio-49",
    "source": "work/studio",
    "href": "/work/studio",
    "label": "Mirasphere Studio — implementation",
    "text": "The wizard captures a script as structured beats and previews them without touching an API, so writing is free and only rendering costs money. A render then walks a fixed chain: ElevenLabs generates narration in a cloned voice, Scribe transcribes that same audio back to word-level timestamps, Kling turns a still photo into presenter footage, Latent Sync applies lip-sync, and ffmpeg ping-pong loops the clip to narration length. Remotion composes the result from four compositions that produce six output styles, with beat durations scaled proportionally against the real audio length and largest-remainder rounding so the frame count always reconciles. Every one of those steps writes a checkpoint row through Prisma before the next begins, which is the difference between a flaky vendor costing a retry and costing the whole video — the presenter step alone polls for around an hour."
  },
  {
    "id": "work/studio-50",
    "source": "work/studio",
    "href": "/work/studio",
    "label": "Mirasphere Studio — implementation (cont.)",
    "text": "The whole thing is local-first: no S3, no Redis, no render farm, and the Claude-powered convenience features self-disable when no key is present rather than failing the pipeline."
  },
  {
    "id": "work/studio-51",
    "source": "work/studio",
    "href": "/work/studio",
    "label": "Mirasphere Studio — what was hard (1/3)",
    "text": "Third-party render polling dominates wall-clock — the presenter step takes around an hour, and anything that interrupted it lost the money as well as the time"
  },
  {
    "id": "work/studio-52",
    "source": "work/studio",
    "href": "/work/studio",
    "label": "Mirasphere Studio — what was hard (2/3)",
    "text": "Audio duration and the visual timeline disagreed, so captions and scene cuts drifted off the narration"
  },
  {
    "id": "work/studio-53",
    "source": "work/studio",
    "href": "/work/studio",
    "label": "Mirasphere Studio — what was hard (3/3)",
    "text": "The lip-sync API required publicly reachable URLs, and the constraint was no object storage"
  },
  {
    "id": "work/studio-54",
    "source": "work/studio",
    "href": "/work/studio",
    "label": "Mirasphere Studio — how it was solved",
    "text": "The long-poll problem was solved by checkpointing every paid step, so a retry resumes from the last completed one and a failure costs nothing extra. The timeline mismatch was solved by driving durations from the audio: proportional scaling of beat lengths with largest-remainder rounding, so the frame counts reconcile exactly and captions land on the word. The public-URL requirement was solved without buying storage, keeping the local-first constraint intact."
  },
  {
    "id": "work/studio-55",
    "source": "work/studio",
    "href": "/work/studio",
    "label": "Mirasphere Studio — outcome",
    "text": "It works end to end: a script becomes a branded 30-second video in around eight minutes, including cloned-voice presenter videos built from a single still photo, with the core path consuming zero LLM credits."
  },
  {
    "id": "work/studio-56",
    "source": "work/studio",
    "href": "/work/studio",
    "label": "Mirasphere Studio — in hindsight",
    "text": "Checkpoint-everything was the best call in the codebase — it turned a chain of flaky, per-call-billed third-party APIs into a pipeline that can be retried without thinking about it. The next moves are structural rather than clever: renders belong on a queue-fed worker box rather than the app host, and the 9:16 remix flow is the output people ask for most."
  },
  {
    "id": "work/studio-57",
    "source": "work/studio",
    "href": "/work/studio",
    "label": "Mirasphere Studio — measured results",
    "text": "Measured results. Wall-clock for a branded 30-second video: ~8 minutes — self-measured, measured 2026-08-01. Output styles from 4 Remotion compositions: 6 — self-measured, measured 2026-08-01. TypeScript in the pipeline: ~5,300 lines — self-measured, measured 2026-08-01."
  },
  {
    "id": "work/chefs-and-homes-58",
    "source": "work/chefs-and-homes",
    "href": "/work/chefs-and-homes",
    "label": "Chefs and Homes",
    "text": "Chefs and Homes. A Malta retailer with physical shops, taking its first step into selling direct. Role: Consultant on approach and design, then developer alongside the client’s in-house team. Status: live, 2026. Built for RECC, Malta. Stack: Shopify, Liquid."
  },
  {
    "id": "work/chefs-and-homes-59",
    "source": "work/chefs-and-homes",
    "href": "/work/chefs-and-homes",
    "label": "Chefs and Homes — context",
    "text": "RECC is an established Malta retailer with malls and shops across the island. Chefs and Homes is the same business stepping into direct-to-consumer for the first time, starting deliberately small: kitchen and tableware products chosen to introduce the brand to customers who currently only meet it in person."
  },
  {
    "id": "work/chefs-and-homes-60",
    "source": "work/chefs-and-homes",
    "href": "/work/chefs-and-homes",
    "label": "Chefs and Homes — the problem",
    "text": "Give a business that has only ever sold face to face a first online storefront — and leave it in a state its own team can run, extend and load products into without external help."
  },
  {
    "id": "work/chefs-and-homes-61",
    "source": "work/chefs-and-homes",
    "href": "/work/chefs-and-homes",
    "label": "Chefs and Homes — approach",
    "text": "Consultancy before code. The first work was with their development team on the shape of the thing: what the store needed to be, how to structure it, and what to deliberately leave out of a first version. Only then the build, done end to end with their team rather than delivered over the wall to them."
  },
  {
    "id": "work/chefs-and-homes-62",
    "source": "work/chefs-and-homes",
    "href": "/work/chefs-and-homes",
    "label": "Chefs and Homes — outcome",
    "text": "The store is live and the client’s team is loading listings into it themselves, which was the actual point — the handover is the deliverable, not the launch."
  },
  {
    "id": "work/zyvren-63",
    "source": "work/zyvren",
    "href": "/work/zyvren",
    "label": "Zyvren",
    "text": "Zyvren. A US clothing store whose product page was quietly spending its ad budget on bounces. Role: Developer, then performance and technical SEO. Status: live, 2026. Built for Zyvren. Stack: Shopify, Liquid."
  },
  {
    "id": "work/zyvren-64",
    "source": "work/zyvren",
    "href": "/work/zyvren",
    "label": "Zyvren — context",
    "text": "A US-focused clothing and accessories brand, trading internationally with multi-currency pricing and paid traffic as its main acquisition channel."
  },
  {
    "id": "work/zyvren-65",
    "source": "work/zyvren",
    "href": "/work/zyvren",
    "label": "Zyvren — the problem",
    "text": "The store launched and the ads went live, and the bounce rate came back high enough to be an expense rather than a metric. Paid traffic was arriving and leaving, which is the worst combination available: you are paying full price for people who never see the product."
  },
  {
    "id": "work/zyvren-66",
    "source": "work/zyvren",
    "href": "/work/zyvren",
    "label": "Zyvren — approach",
    "text": "Work backwards from the bounce rather than guessing at the funnel. Isolating it by page put the problem on the featured single-product template — the exact page every ad pointed at. Lighthouse put the largest contentful paint on that template somewhere between twelve and sixteen seconds, which is long past the point where a visitor concludes the site is broken. The fix was in the template’s custom Liquid, guided by what Lighthouse said was blocking the render rather than by a general tidy-up."
  },
  {
    "id": "work/zyvren-67",
    "source": "work/zyvren",
    "href": "/work/zyvren",
    "label": "Zyvren — outcome",
    "text": "The product template was rebuilt and the page now renders in a fraction of the time it did. The client is running paid traffic against it and trading normally."
  },
  {
    "id": "work/women-wellness-first-68",
    "source": "work/women-wellness-first",
    "href": "/work/women-wellness-first",
    "label": "Women Wellness First",
    "text": "Women Wellness First. A first storefront for a women’s health brand, rebuilt section by section to a strict spec. Role: Shopify developer — theme architecture and Liquid build, working to the client’s in-house design team. Status: live, 2025. Built for Women Wellness First. Stack: Shopify, Liquid, Free Shopify theme."
  },
  {
    "id": "work/women-wellness-first-69",
    "source": "work/women-wellness-first",
    "href": "/work/women-wellness-first",
    "label": "Women Wellness First — context",
    "text": "A Gurugram-based women’s health brand with an in-house design team, no website, and firm rules about type, spacing and visual identity. This was the first site the business had ever had. [CONFIRM WHAT THE STORE SOLD AT LAUNCH — THE SINGLE PRODUCT, OR THE COURSE CATALOGUE THAT IS LIVE NOW]"
  },
  {
    "id": "work/women-wellness-first-70",
    "source": "work/women-wellness-first",
    "href": "/work/women-wellness-first",
    "label": "Women Wellness First — the problem",
    "text": "Build a first storefront that matched an exacting design specification, and hand it over in a state where the client’s own team could keep running it — without either of those two goals eating the other."
  },
  {
    "id": "work/women-wellness-first-71",
    "source": "work/women-wellness-first",
    "href": "/work/women-wellness-first",
    "label": "Women Wellness First — approach",
    "text": "A free theme as a plain base, then every section rebuilt in Liquid with its own schema. Several rounds of iteration with their design team on the way, because design fidelity is not something you achieve once and hold — it is what the iterations are for. The schema work is what makes the result survive: each element is exposed as a setting in the theme editor, so the team can change what a section says without being able to change what it looks like."
  },
  {
    "id": "work/women-wellness-first-72",
    "source": "work/women-wellness-first",
    "href": "/work/women-wellness-first",
    "label": "Women Wellness First — outcome",
    "text": "The brand’s first website went live and is edited by the client’s own team from the theme editor."
  },
  {
    "id": "work/allure-dental-73",
    "source": "work/allure-dental",
    "href": "/work/allure-dental",
    "label": "Allure Dental Care",
    "text": "Allure Dental Care. A Barnet dental and facial-aesthetics practice, rebuilt and then made findable. Role: Developer, then the performance, schema and local-search work after launch. Status: live, 2025. Built for Allure Dental Care. Stack: WordPress, Technical SEO."
  },
  {
    "id": "work/allure-dental-74",
    "source": "work/allure-dental",
    "href": "/work/allure-dental",
    "label": "Allure Dental Care — context",
    "text": "An established dental and facial-aesthetics practice in Barnet, north London, offering general dentistry, orthodontics and implants alongside a growing aesthetics list — anti-wrinkle treatments, fillers, HydraFacial, microneedling. They already had a website."
  },
  {
    "id": "work/allure-dental-75",
    "source": "work/allure-dental",
    "href": "/work/allure-dental",
    "label": "Allure Dental Care — the problem",
    "text": "The site they had was not doing the two jobs a practice website has: convincing someone who lands on it, and being found by someone searching three miles away. Replacing it was only half the work — the other half was the part that has nothing to do with how the site looks."
  },
  {
    "id": "work/allure-dental-76",
    "source": "work/allure-dental",
    "href": "/work/allure-dental",
    "label": "Allure Dental Care — approach",
    "text": "Rebuild first, then everything that makes the rebuild worth having: structured data so search engines can read the treatments as treatments, a Google Business Profile aligned with the site so the local pack and the pages agree with each other, and speed work on the pages that actually receive traffic. [CONFIRM THE PAGE BUILDER — YOU SAID DIVI, THE LIVE SITE REPORTS ELEMENTOR 4.2.3]"
  },
  {
    "id": "work/allure-dental-77",
    "source": "work/allure-dental",
    "href": "/work/allure-dental",
    "label": "Allure Dental Care — outcome",
    "text": "The practice runs on it, adds its own treatment pages, and is set up to be found locally rather than only to be looked at once someone arrives."
  },
  {
    "id": "work/mariforce-78",
    "source": "work/mariforce",
    "href": "/work/mariforce",
    "label": "Mariforce Crewing",
    "text": "Mariforce Crewing. Offshore crew recruitment, where every CV lands in the system the team already works in. Role: Sole developer, end to end — at Mirasphere Digital, for an agency client. Status: live, 2025. Built for Mariforce Crewing. Stack: WordPress, Elementor."
  },
  {
    "id": "work/mariforce-79",
    "source": "work/mariforce",
    "href": "/work/mariforce",
    "label": "Mariforce Crewing — context",
    "text": "Mariforce Crewing recruits for the offshore energy and maritime sector — ROV and trenching crews, cables and pipelines, subsea operations, oil and gas, offshore renewables. The roles run from deck hands and stewards to geotechnical surveyors, ROV operators and party chiefs."
  },
  {
    "id": "work/mariforce-80",
    "source": "work/mariforce",
    "href": "/work/mariforce",
    "label": "Mariforce Crewing — the problem",
    "text": "A recruitment website’s real output is not visits, it is candidates who reach the recruiter in a usable form. A CV arriving as an email attachment is a candidate the team has to re-type into whatever system they actually work in — which is where applications get lost."
  },
  {
    "id": "work/mariforce-81",
    "source": "work/mariforce",
    "href": "/work/mariforce",
    "label": "Mariforce Crewing — approach",
    "text": "Build the site so that submitting a CV puts the candidate directly into the platform the recruitment team already uses, rather than into an inbox. The site is the front door; the applicant tracking system is where the work happens, and the handoff between them is the part worth engineering. [CONFIRM THE ATS — I HEARD ZOHO RECRUIT, AND THE LIVE FORM READS AS A PLAIN UPLOAD, SO SAY WHICH PLATFORM AND WHETHER THE INTEGRATION IS LIVE]"
  },
  {
    "id": "work/mariforce-82",
    "source": "work/mariforce",
    "href": "/work/mariforce",
    "label": "Mariforce Crewing — outcome",
    "text": "Candidates reach the team as records they can act on rather than as attachments someone has to process by hand."
  },
  {
    "id": "work/swann-bookkeeping-83",
    "source": "work/swann-bookkeeping",
    "href": "/work/swann-bookkeeping",
    "label": "Swann Bookkeeping — Website",
    "text": "Swann Bookkeeping — Website. A London accountancy firm’s services, made legible to the businesses that need them. Role: Sole developer, end to end — at Mirasphere Digital, for an agency client. Status: live, 2025. Built for Swann Bookkeeping & Accountancy. Stack: WordPress, Elementor, Slider Revolution."
  },
  {
    "id": "work/swann-bookkeeping-84",
    "source": "work/swann-bookkeeping",
    "href": "/work/swann-bookkeeping",
    "label": "Swann Bookkeeping — Website — context",
    "text": "Swann is a London bookkeeping and accountancy firm serving sole traders, limited companies and charities — bookkeeping, self-assessment, payroll, CIS and PAYE, VAT registration, corporation tax and tax planning. They positioned themselves as their clients’ behind-the-scenes finance team, and they already had a site."
  },
  {
    "id": "work/swann-bookkeeping-85",
    "source": "work/swann-bookkeeping",
    "href": "/work/swann-bookkeeping",
    "label": "Swann Bookkeeping — Website — the problem",
    "text": "Accountancy services are hard to tell apart from the outside. A small business owner cannot easily work out which of seven overlapping services they need, and a site that lists them without explaining them loses the enquiry to whoever explains it better."
  },
  {
    "id": "work/swann-bookkeeping-86",
    "source": "work/swann-bookkeeping",
    "href": "/work/swann-bookkeeping",
    "label": "Swann Bookkeeping — Website — approach",
    "text": "Rebuild around the services as the spine of the site: each one given its own explanation rather than a line in a list, a four-step process section so a prospective client can see what working together actually looks like, and testimonials in the path rather than parked on a separate page."
  },
  {
    "id": "work/swann-bookkeeping-87",
    "source": "work/swann-bookkeeping",
    "href": "/work/swann-bookkeeping",
    "label": "Swann Bookkeeping — Website — outcome",
    "text": "The firm’s services are legible to a non-accountant, and the enquiry path from a service page to a booked consultation is one click."
  },
  {
    "id": "work/mirasphere-site-88",
    "source": "work/mirasphere-site",
    "href": "/work/mirasphere-site",
    "label": "Mirasphere Digital — Agency Site",
    "text": "Mirasphere Digital — Agency Site. The agency’s own site — the one where the work has to argue for itself. Role: Developer and technical SEO — the agency’s own site, built in-house. Status: live, 2025. Built for Mirasphere Digital, as the agency’s own site rather than a client project. Stack: WordPress, Elementor, Technical SEO."
  },
  {
    "id": "work/mirasphere-site-89",
    "source": "work/mirasphere-site",
    "href": "/work/mirasphere-site",
    "label": "Mirasphere Digital — Agency Site — context",
    "text": "Mirasphere Digital is the agency I have worked at since April 2025, running social, PPC, SEO, email, web and influencer work out of London and Gurugram. This is their own website."
  },
  {
    "id": "work/mirasphere-site-90",
    "source": "work/mirasphere-site",
    "href": "/work/mirasphere-site",
    "label": "Mirasphere Digital — Agency Site — the problem",
    "text": "An agency site is the one build where the audience is professionally sceptical. It has to demonstrate the services rather than describe them — and an agency selling search cannot afford a site that underperforms on search."
  },
  {
    "id": "work/mirasphere-site-91",
    "source": "work/mirasphere-site",
    "href": "/work/mirasphere-site",
    "label": "Mirasphere Digital — Agency Site — approach",
    "text": "Interaction per service rather than a shared template: each service page carries a before-and-after comparison that shows the difference the work makes, which is a demonstration rather than a claim. Then the technical SEO on the site itself, on the principle that an agency’s own site is the first sample of its work anyone sees."
  },
  {
    "id": "work/mirasphere-site-92",
    "source": "work/mirasphere-site",
    "href": "/work/mirasphere-site",
    "label": "Mirasphere Digital — Agency Site — outcome",
    "text": "It is the agency’s live site, carrying their services, their client roster and their free-audit offer as the conversion path."
  },
  {
    "id": "thinking/postgres-prisma-over-mongodb-93",
    "source": "thinking/postgres-prisma-over-mongodb",
    "href": "/thinking#postgres-prisma-over-mongodb",
    "label": "Why PostgreSQL and Prisma, and not MongoDB?",
    "text": "Why PostgreSQL and Prisma, and not MongoDB? The CRM replaces Fordham Finance Group’s entire practice software. Its data is compliance data: clients link to obligations, obligations to statutory deadlines, deadlines to documents and signatures, and all of it to billing. MongoDB was the familiar option — it is the M in the MERN stack I had shipped product work on — so this was a real choice rather than a default. This decision is about FFS Manager — Practice CRM."
  },
  {
    "id": "thinking/postgres-prisma-over-mongodb-94",
    "source": "thinking/postgres-prisma-over-mongodb",
    "href": "/thinking#postgres-prisma-over-mongodb",
    "label": "Why PostgreSQL and Prisma, and not MongoDB? — what was chosen",
    "text": "Chose: PostgreSQL with Prisma. Compliance data is deeply relational. The questions the firm asks — which clients have a VAT return due in the next fortnight, which of those are missing a signed engagement letter — are joins. Modelling them as documents would have meant reimplementing joins in application code, in the part of the system where being wrong is a missed statutory deadline. This decision is about FFS Manager — Practice CRM."
  },
  {
    "id": "thinking/postgres-prisma-over-mongodb-95",
    "source": "thinking/postgres-prisma-over-mongodb",
    "href": "/thinking#postgres-prisma-over-mongodb",
    "label": "Why PostgreSQL and Prisma, and not MongoDB? — the trade-off",
    "text": "Schema iteration got slower, and migrations became a discipline rather than an afterthought. Every change had to be additive because production held live client data from week one, which rules out the fast, destructive reshaping that schemaless work allows."
  },
  {
    "id": "thinking/postgres-prisma-over-mongodb-96",
    "source": "thinking/postgres-prisma-over-mongodb",
    "href": "/thinking#postgres-prisma-over-mongodb",
    "label": "Why PostgreSQL and Prisma, and not MongoDB? — outcome",
    "text": "26 additive migrations against production with zero data loss, and queries the UI can trust without defensive checks. Would do it again: yes."
  },
  {
    "id": "thinking/postgres-prisma-over-mongodb-97",
    "source": "thinking/postgres-prisma-over-mongodb",
    "href": "/thinking#postgres-prisma-over-mongodb",
    "label": "Why PostgreSQL and Prisma, and not MongoDB? — option considered: MongoDB",
    "text": "MongoDB. In favour: Familiar from previous MERN product work, so no ramp-up cost. Schemaless iteration is fast in the first weeks, which matters when the deadline is eight weeks. Against: The relationships are the domain here — a client’s obligations, deadlines, documents and signatures are the product, not a detail. Referential integrity would have to be enforced in application code, in a system where a broken link means a missed filing deadline."
  },
  {
    "id": "thinking/postgres-prisma-over-mongodb-98",
    "source": "thinking/postgres-prisma-over-mongodb",
    "href": "/thinking#postgres-prisma-over-mongodb",
    "label": "Why PostgreSQL and Prisma, and not MongoDB? — option considered: PostgreSQL with Prisma",
    "text": "PostgreSQL with Prisma. In favour: Relational integrity for data whose whole value is its relationships. 55 models and 28 enums can be described precisely, and the UI can trust the queries. Schema changes become explicit, reviewable migrations rather than a deploy-time surprise. Against: Slower schema iteration than schemaless, on a project with an eight-week runway. Migrations become a discipline you cannot skip once real client data is in the database."
  },
  {
    "id": "thinking/e-signatures-in-house-99",
    "source": "thinking/e-signatures-in-house",
    "href": "/thinking#e-signatures-in-house",
    "label": "Why build e-signatures in-house rather than integrating DocuSign?",
    "text": "Why build e-signatures in-house rather than integrating DocuSign? The CRM needed DocuSign-class signing: sequential and parallel signers, PDF stamping, and an audit trail that would stand up if a client ever disputed a signature. The obvious answer is to integrate a signing provider, and for most projects it is the right one. This decision is about FFS Manager — Practice CRM."
  },
  {
    "id": "thinking/e-signatures-in-house-100",
    "source": "thinking/e-signatures-in-house",
    "href": "/thinking#e-signatures-in-house",
    "label": "Why build e-signatures in-house rather than integrating DocuSign? — what was chosen",
    "text": "Chose: Build the signing flow in the CRM. The entire project was a response to a £500-per-user-per-year subscription. Replacing it with a system that bills per envelope would have moved the cost rather than removed it — and signing is one of the highest-volume things an accounting practice does. This decision is about FFS Manager — Practice CRM."
  },
  {
    "id": "thinking/e-signatures-in-house-101",
    "source": "thinking/e-signatures-in-house",
    "href": "/thinking#e-signatures-in-house",
    "label": "Why build e-signatures in-house rather than integrating DocuSign? — the trade-off",
    "text": "Roughly two weeks that could have gone into other modules, and permanent ownership of a flow where correctness is a legal question and not just a technical one. If this were a product sold to many firms rather than one, I would want an external provider’s audit story behind it."
  },
  {
    "id": "thinking/e-signatures-in-house-102",
    "source": "thinking/e-signatures-in-house",
    "href": "/thinking#e-signatures-in-house",
    "label": "Why build e-signatures in-house rather than integrating DocuSign? — outcome",
    "text": "Signature flows at zero marginal cost, fully integrated with the client records they belong to, with an append-only audit trail in the same database as everything else. Would do it again: qualified."
  },
  {
    "id": "thinking/e-signatures-in-house-103",
    "source": "thinking/e-signatures-in-house",
    "href": "/thinking#e-signatures-in-house",
    "label": "Why build e-signatures in-house rather than integrating DocuSign? — option considered: DocuSign or SignRequest API",
    "text": "DocuSign or SignRequest API. In favour: Signing is a solved problem with a mature legal and audit story behind it. Days of integration instead of weeks of building. Against: Per-envelope pricing scales with the firm’s activity, which is exactly the cost model the project existed to escape. Signature state lives in someone else’s system, so client records and signing history are always one API call apart."
  },
  {
    "id": "thinking/e-signatures-in-house-104",
    "source": "thinking/e-signatures-in-house",
    "href": "/thinking#e-signatures-in-house",
    "label": "Why build e-signatures in-house rather than integrating DocuSign? — option considered: Build the signing flow in the CRM",
    "text": "Build the signing flow in the CRM. In favour: Zero marginal cost per envelope, forever. Signatures are rows next to the client and document they belong to, so the audit trail is a join rather than an integration. Against: Roughly two weeks of build: signer ordering, PDF stamping, audit events. The legal and audit correctness of the flow is now mine to defend rather than a vendor’s."
  },
  {
    "id": "thinking/vps-over-managed-paas-105",
    "source": "thinking/vps-over-managed-paas",
    "href": "/thinking#vps-over-managed-paas",
    "label": "Why a VPS with PM2, and not a managed platform like Vercel or Railway?",
    "text": "Why a VPS with PM2, and not a managed platform like Vercel or Railway? The CRM needs an API, twelve background workers, PostgreSQL, Redis and file storage. On a managed platform that is four or five billable services; on a VPS it is one machine. The firm is one accounting practice, not a scaling startup, so the load profile was known and modest from the start. This decision is about FFS Manager — Practice CRM."
  },
  {
    "id": "thinking/vps-over-managed-paas-106",
    "source": "thinking/vps-over-managed-paas",
    "href": "/thinking#vps-over-managed-paas",
    "label": "Why a VPS with PM2, and not a managed platform like Vercel or Railway? — what was chosen",
    "text": "Chose: Single VPS with a PM2 cluster behind Nginx. The whole system is one person’s to reason about and one firm’s to use. Putting Postgres, Redis, file storage and workers on one machine turned hosting into a fixed monthly number I could state honestly to the client, which is the thing a firm leaving a per-seat subscription actually cares about. This decision is about FFS Manager — Practice CRM."
  },
  {
    "id": "thinking/vps-over-managed-paas-107",
    "source": "thinking/vps-over-managed-paas",
    "href": "/thinking#vps-over-managed-paas",
    "label": "Why a VPS with PM2, and not a managed platform like Vercel or Railway? — the trade-off",
    "text": "I own the operations. That means encrypted nightly backups, a documented recovery path, and TLS that renews — and it means a hardware failure is my problem at whatever hour it happens. On a system with unpredictable traffic or a team that rotates, I would pay the platform instead."
  },
  {
    "id": "thinking/vps-over-managed-paas-108",
    "source": "thinking/vps-over-managed-paas",
    "href": "/thinking#vps-over-managed-paas",
    "label": "Why a VPS with PM2, and not a managed platform like Vercel or Railway? — outcome",
    "text": "Encrypted nightly backups, a documented four-layer recovery path, a one-command deploy, and uptime that has been boring. Would do it again: qualified."
  },
  {
    "id": "thinking/vps-over-managed-paas-109",
    "source": "thinking/vps-over-managed-paas",
    "href": "/thinking#vps-over-managed-paas",
    "label": "Why a VPS with PM2, and not a managed platform like Vercel or Railway? — option considered: Managed PaaS (Vercel, Railway, Fly)",
    "text": "Managed PaaS (Vercel, Railway, Fly). In favour: No ops: backups, TLS, restarts and scaling are someone else’s job. Deploys and rollbacks are a git push. Against: Postgres, Redis, workers and file storage become four or five separate billed services. Cost becomes a function of usage, which is hard to quote to a client replacing a fixed subscription."
  },
  {
    "id": "thinking/vps-over-managed-paas-110",
    "source": "thinking/vps-over-managed-paas",
    "href": "/thinking#vps-over-managed-paas",
    "label": "Why a VPS with PM2, and not a managed platform like Vercel or Railway? — option considered: Single VPS with a PM2 cluster behind Nginx",
    "text": "Single VPS with a PM2 cluster behind Nginx. In favour: Everything on one box means one predictable monthly figure. Full control over the file storage and worker topology, and a one-command deploy. Against: Backups, recovery drills and TLS renewal are mine to own and mine to get wrong. A single machine is a single failure domain."
  },
  {
    "id": "thinking/bulk-csv-over-streaming-api-111",
    "source": "thinking/bulk-csv-over-streaming-api",
    "href": "/thinking#bulk-csv-over-streaming-api",
    "label": "Why the 2.9GB bulk register and REST verification, and not the Companies House Streaming API?",
    "text": "Why the 2.9GB bulk register and REST verification, and not the Companies House Streaming API? The lead engine has to find UK companies whose accounts are due. Companies House offers a Streaming API — the modern, event-driven, obviously-correct-looking option — and a monthly bulk CSV of the whole register, around five million rows and 2.9GB. Reaching for the streaming API first was the instinct. This decision is about CH Scrapper — Lead Engine."
  },
  {
    "id": "thinking/bulk-csv-over-streaming-api-112",
    "source": "thinking/bulk-csv-over-streaming-api",
    "href": "/thinking#bulk-csv-over-streaming-api",
    "label": "Why the 2.9GB bulk register and REST verification, and not the Companies House Streaming API? — what was chosen",
    "text": "Chose: Monthly bulk CSV, with live REST verification before contact. The shape of the question decided it. \"Who is due\" is a scan across every company, not a subscription to changes. The bulk file answers it for free, and the REST API — which does have a per-company profile endpoint — is the right tool for confirming the handful that matter rather than discovering them. This decision is about CH Scrapper — Lead Engine."
  },
  {
    "id": "thinking/bulk-csv-over-streaming-api-113",
    "source": "thinking/bulk-csv-over-streaming-api",
    "href": "/thinking#bulk-csv-over-streaming-api",
    "label": "Why the 2.9GB bulk register and REST verification, and not the Companies House Streaming API? — the trade-off",
    "text": "Monthly staleness, which is a real defect and had to be handled rather than accepted: nothing downstream may treat the bulk flag as truth, so every candidate is verified live before anyone contacts it. That is an extra stage, a cache, and a rate limiter that would not exist otherwise."
  },
  {
    "id": "thinking/bulk-csv-over-streaming-api-114",
    "source": "thinking/bulk-csv-over-streaming-api",
    "href": "/thinking#bulk-csv-over-streaming-api",
    "label": "Why the 2.9GB bulk register and REST verification, and not the Companies House Streaming API? — outcome",
    "text": "Whole-register coverage on a fraction of the API budget, with staleness contained at the verification stage where it is visible. Would do it again: yes."
  },
  {
    "id": "thinking/bulk-csv-over-streaming-api-115",
    "source": "thinking/bulk-csv-over-streaming-api",
    "href": "/thinking#bulk-csv-over-streaming-api",
    "label": "Why the 2.9GB bulk register and REST verification, and not the Companies House Streaming API? — option considered: Streaming API",
    "text": "Streaming API. In favour: Real-time, so the data is never stale. Event-driven and cheap to keep running once connected. Against: It answers \"what changed\", and the business question is \"who is due\" — a company sitting quietly with an overdue filing generates no event. Building a full-register picture from a change feed means waiting for the register to describe itself, which could take months."
  },
  {
    "id": "thinking/bulk-csv-over-streaming-api-116",
    "source": "thinking/bulk-csv-over-streaming-api",
    "href": "/thinking#bulk-csv-over-streaming-api",
    "label": "Why the 2.9GB bulk register and REST verification, and not the Companies House Streaming API? — option considered: Monthly bulk CSV, with live REST verification before contact",
    "text": "Monthly bulk CSV, with live REST verification before contact. In favour: Whole-register coverage on day one, with no API calls at all. The expensive API budget gets spent only on the few hundred candidates that survive filtering. Against: The snapshot is up to a month stale, so a \"due\" flag cannot be trusted. Processing 2.9GB and five million rows needs chunked ingest and somewhere to put it."
  },
  {
    "id": "thinking/half-the-rate-ceiling-117",
    "source": "thinking/half-the-rate-ceiling",
    "href": "/thinking#half-the-rate-ceiling",
    "label": "Why run the verifier at half the published rate limit instead of maxing it out?",
    "text": "Why run the verifier at half the published rate limit instead of maxing it out? Companies House publishes a rate limit of 600 requests per five minutes. Verification is the slow stage of the pipeline, so the tempting move is to sit as close to the ceiling as the limiter allows and get runs finished faster. This decision is about CH Scrapper — Lead Engine."
  },
  {
    "id": "thinking/half-the-rate-ceiling-118",
    "source": "thinking/half-the-rate-ceiling",
    "href": "/thinking#half-the-rate-ceiling",
    "label": "Why run the verifier at half the published rate limit instead of maxing it out? — what was chosen",
    "text": "Chose: Run at half the ceiling. The asymmetry is not close. Being twice as slow costs minutes; being banned from the register costs the entire product, on a data source with no commercial alternative that is not also a per-lead bill. This decision is about CH Scrapper — Lead Engine."
  },
  {
    "id": "thinking/half-the-rate-ceiling-119",
    "source": "thinking/half-the-rate-ceiling",
    "href": "/thinking#half-the-rate-ceiling",
    "label": "Why run the verifier at half the published rate limit instead of maxing it out? — the trade-off",
    "text": "Verification is deliberately the slow stage of the pipeline, and it is the stage users wait on. That is paid for by keeping the free bulk scan fast, so the slow part only ever touches candidates that already passed filtering."
  },
  {
    "id": "thinking/half-the-rate-ceiling-120",
    "source": "thinking/half-the-rate-ceiling",
    "href": "/thinking#half-the-rate-ceiling",
    "label": "Why run the verifier at half the published rate limit instead of maxing it out? — outcome",
    "text": "Zero rate-limit incidents across 22 production scrape jobs, with an eight-step backoff honouring Retry-After for the failures that still happen. Would do it again: yes."
  },
  {
    "id": "thinking/half-the-rate-ceiling-121",
    "source": "thinking/half-the-rate-ceiling",
    "href": "/thinking#half-the-rate-ceiling",
    "label": "Why run the verifier at half the published rate limit instead of maxing it out? — option considered: Run near the published ceiling",
    "text": "Run near the published ceiling. In favour: Verification runs finish materially faster. The published limit is the contract, and staying inside it is technically compliant. Against: No headroom for retries — a burst of 429s or 5xx responses pushes you over exactly when you can least afford it. A ban on a free public API run by a regulator would end the project, and there is no appeal process worth relying on."
  },
  {
    "id": "thinking/half-the-rate-ceiling-122",
    "source": "thinking/half-the-rate-ceiling",
    "href": "/thinking#half-the-rate-ceiling",
    "label": "Why run the verifier at half the published rate limit instead of maxing it out? — option considered: Run at half the ceiling",
    "text": "Run at half the ceiling. In favour: Retries, backoff and any other consumer of the same key all fit in the remaining headroom. The failure mode becomes \"slower than ideal\" rather than \"locked out\". Against: Verification runs take roughly twice as long as they could."
  },
  {
    "id": "thinking/python-over-node-for-bulk-data-123",
    "source": "thinking/python-over-node-for-bulk-data",
    "href": "/thinking#python-over-node-for-bulk-data",
    "label": "Why Python and FastAPI for this, when Node is the main stack?",
    "text": "Why Python and FastAPI for this, when Node is the main stack? Everything else in this portfolio of systems is TypeScript on Node. Introducing a second language means a second toolchain, a second deployment story and a second set of habits to keep sharp — so it needed to earn its place. This decision is about CH Scrapper — Lead Engine."
  },
  {
    "id": "thinking/python-over-node-for-bulk-data-124",
    "source": "thinking/python-over-node-for-bulk-data",
    "href": "/thinking#python-over-node-for-bulk-data",
    "label": "Why Python and FastAPI for this, when Node is the main stack? — what was chosen",
    "text": "Chose: Python with pandas and FastAPI. The hard part of this system is a 2.9GB CSV, and pandas is the right tool for a 2.9GB CSV. Choosing the stack to match the portfolio rather than the problem would have meant rebuilding chunked dataframe processing badly, in order to keep a consistency that nobody benefits from. This decision is about CH Scrapper — Lead Engine."
  },
  {
    "id": "thinking/python-over-node-for-bulk-data-125",
    "source": "thinking/python-over-node-for-bulk-data",
    "href": "/thinking#python-over-node-for-bulk-data",
    "label": "Why Python and FastAPI for this, when Node is the main stack? — the trade-off",
    "text": "A second language to keep current, and no shared code with the TypeScript systems. The mitigation is that the boundary is clean — Python owns data processing, and the only thing crossing it is JSON over HTTP."
  },
  {
    "id": "thinking/python-over-node-for-bulk-data-126",
    "source": "thinking/python-over-node-for-bulk-data",
    "href": "/thinking#python-over-node-for-bulk-data",
    "label": "Why Python and FastAPI for this, when Node is the main stack? — outcome",
    "text": "25,000-row chunked ingest that a single modest VPS handles comfortably, over the whole register. Would do it again: yes."
  },
  {
    "id": "thinking/python-over-node-for-bulk-data-127",
    "source": "thinking/python-over-node-for-bulk-data",
    "href": "/thinking#python-over-node-for-bulk-data",
    "label": "Why Python and FastAPI for this, when Node is the main stack? — option considered: Node.js and TypeScript",
    "text": "Node.js and TypeScript. In favour: One language across every system I maintain, so no context switch. Shared deployment, tooling and type conventions with the CRM. Against: Chunked processing of a 2.9GB, five-million-row CSV means hand-rolling what pandas already does well. The streaming and dataframe ergonomics are simply worse for this specific job."
  },
  {
    "id": "thinking/python-over-node-for-bulk-data-128",
    "source": "thinking/python-over-node-for-bulk-data",
    "href": "/thinking#python-over-node-for-bulk-data",
    "label": "Why Python and FastAPI for this, when Node is the main stack? — option considered: Python with pandas and FastAPI",
    "text": "Python with pandas and FastAPI. In favour: pandas handles chunked ingest of the full register on a modest VPS without a memory ceiling. FastAPI keeps the dashboard API thin and typed, sitting next to the code doing the real work. Against: A second language, toolchain and deployment path to maintain. No code sharing with the TypeScript systems."
  },
  {
    "id": "thinking/rule-based-over-llm-129",
    "source": "thinking/rule-based-over-llm",
    "href": "/thinking#rule-based-over-llm",
    "label": "Why classify ads with rules, and not an LLM?",
    "text": "Why classify ads with rules, and not an LLM? The ads extractor pulls every live Facebook and Instagram ad for a set of competitors and has to cluster them into hooks, offers and unclaimed angles. Handing each ad to a model for classification is the modern default, and it would have been the shorter path to a first version. This decision is about Competitive Ads Extractor."
  },
  {
    "id": "thinking/rule-based-over-llm-130",
    "source": "thinking/rule-based-over-llm",
    "href": "/thinking#rule-based-over-llm",
    "label": "Why classify ads with rules, and not an LLM? — what was chosen",
    "text": "Chose: Rule-based clustering. 361 ads is regex-and-set-theory territory, not a machine learning problem. Determinism and explainability are worth more than coverage here: the output is a report a client makes spending decisions from, and \"the model said so\" is a worse answer than a rule you can point at. This decision is about Competitive Ads Extractor."
  },
  {
    "id": "thinking/rule-based-over-llm-131",
    "source": "thinking/rule-based-over-llm",
    "href": "/thinking#rule-based-over-llm",
    "label": "Why classify ads with rules, and not an LLM? — the trade-off",
    "text": "The hook taxonomy is hand-maintained, so the tool needs occasional attention as ad language shifts. An optional LLM summary layer sitting on top of the deterministic clusters is the obvious v2 — on top, not instead of."
  },
  {
    "id": "thinking/rule-based-over-llm-132",
    "source": "thinking/rule-based-over-llm",
    "href": "/thinking#rule-based-over-llm",
    "label": "Why classify ads with rules, and not an LLM? — outcome",
    "text": "Zero analysis cost across 23 real runs, explainable clusters, and reports that generate instantly. Would do it again: yes."
  },
  {
    "id": "thinking/rule-based-over-llm-133",
    "source": "thinking/rule-based-over-llm",
    "href": "/thinking#rule-based-over-llm",
    "label": "Why classify ads with rules, and not an LLM? — option considered: LLM classification per ad",
    "text": "LLM classification per ad. In favour: Handles creative phrasing the taxonomy has not seen, without maintenance. Faster to a first working version, and easier to extend to new dimensions. Against: A per-ad cost on a tool built under a zero-budget constraint. Non-deterministic, so the same run can produce different clusters and a client cannot be shown why an ad landed where it did."
  },
  {
    "id": "thinking/rule-based-over-llm-134",
    "source": "thinking/rule-based-over-llm",
    "href": "/thinking#rule-based-over-llm",
    "label": "Why classify ads with rules, and not an LLM? — option considered: Rule-based clustering",
    "text": "Rule-based clustering. In favour: Free, instant and deterministic — the same input always produces the same report. Every cluster is explainable, which is what the person receiving a gap map actually needs. At a few hundred ads per run, near-duplicate folding and set operations are sufficient. Against: The 11-type hook taxonomy and 9-offer matrix are hand-maintained. Genuinely novel phrasing can fall outside the taxonomy until it is added."
  },
  {
    "id": "thinking/filesystem-runs-over-database-135",
    "source": "thinking/filesystem-runs-over-database",
    "href": "/thinking#filesystem-runs-over-database",
    "label": "Why are analysis runs folders on disk, and not rows in a database?",
    "text": "Why are analysis runs folders on disk, and not rows in a database? Each run of the ads extractor produces a dashboard, a Markdown report, a CSV, a JSON export and a PDF. Persisting that in SQLite or Postgres is the reflex, and it would have made cross-run analysis possible. This decision is about Competitive Ads Extractor."
  },
  {
    "id": "thinking/filesystem-runs-over-database-136",
    "source": "thinking/filesystem-runs-over-database",
    "href": "/thinking#filesystem-runs-over-database",
    "label": "Why are analysis runs folders on disk, and not rows in a database? — what was chosen",
    "text": "Chose: Timestamped folders as the datastore. The unit of value is a run, and a run is a deliverable. Making the deliverable the storage format meant there was never an export step, and the tool stayed installable anywhere on a runtime that is already present. This decision is about Competitive Ads Extractor."
  },
  {
    "id": "thinking/filesystem-runs-over-database-137",
    "source": "thinking/filesystem-runs-over-database",
    "href": "/thinking#filesystem-runs-over-database",
    "label": "Why are analysis runs folders on disk, and not rows in a database? — the trade-off",
    "text": "No cross-run queries. Comparing a competitor’s hooks across six months means opening two folders, which is fine at 23 runs and would not be at 500 — that is the point at which SQLite earns its place."
  },
  {
    "id": "thinking/filesystem-runs-over-database-138",
    "source": "thinking/filesystem-runs-over-database",
    "href": "/thinking#filesystem-runs-over-database",
    "label": "Why are analysis runs folders on disk, and not rows in a database? — outcome",
    "text": "A three-dependency tool that installs anywhere and emits client-ready reports with no export step. Would do it again: yes."
  },
  {
    "id": "thinking/filesystem-runs-over-database-139",
    "source": "thinking/filesystem-runs-over-database",
    "href": "/thinking#filesystem-runs-over-database",
    "label": "Why are analysis runs folders on disk, and not rows in a database? — option considered: SQLite or PostgreSQL",
    "text": "SQLite or PostgreSQL. In favour: Cross-run queries: how a competitor’s hooks changed over six months. Deduplication and history come free. Against: A dependency and a migration story on a tool whose selling point is that it installs anywhere with three packages. Producing a client deliverable becomes an export step rather than the natural output."
  },
  {
    "id": "thinking/filesystem-runs-over-database-140",
    "source": "thinking/filesystem-runs-over-database",
    "href": "/thinking#filesystem-runs-over-database",
    "label": "Why are analysis runs folders on disk, and not rows in a database? — option considered: Timestamped folders as the datastore",
    "text": "Timestamped folders as the datastore. In favour: Each run is a self-contained folder that can be handed to a client as-is. No database, no migrations, no export step — three dependencies total. Against: No cross-run queries, so trends over time have to be assembled by hand. Disk organisation is the only index."
  },
  {
    "id": "thinking/real-stt-timestamps-141",
    "source": "thinking/real-stt-timestamps",
    "href": "/thinking#real-stt-timestamps",
    "label": "Why transcribe generated narration for timing, instead of estimating word positions?",
    "text": "Why transcribe generated narration for timing, instead of estimating word positions? Studio drives a Remotion timeline from a script: captions have to appear on the word, and scene changes have to land on the beat. Word positions can be estimated from a words-per-minute figure for free, or measured by running the synthesised narration back through speech-to-text for the price of one more API call. This decision is about Mirasphere Studio."
  },
  {
    "id": "thinking/real-stt-timestamps-142",
    "source": "thinking/real-stt-timestamps",
    "href": "/thinking#real-stt-timestamps",
    "label": "Why transcribe generated narration for timing, instead of estimating word positions? — what was chosen",
    "text": "Chose: Transcribe the generated audio with Scribe for word-level timestamps. Timing is the difference between a video that looks produced and one that looks automated, and it is the first thing a viewer notices. Guessing at it to save one API call on a pipeline that already pays for text-to-speech, image-to-video and lip-sync is a false economy. This decision is about Mirasphere Studio."
  },
  {
    "id": "thinking/real-stt-timestamps-143",
    "source": "thinking/real-stt-timestamps",
    "href": "/thinking#real-stt-timestamps",
    "label": "Why transcribe generated narration for timing, instead of estimating word positions? — the trade-off",
    "text": "One additional paid call per video — mitigated by the fact that it checkpoints like every other paid step, so it is paid once even across retries."
  },
  {
    "id": "thinking/real-stt-timestamps-144",
    "source": "thinking/real-stt-timestamps",
    "href": "/thinking#real-stt-timestamps",
    "label": "Why transcribe generated narration for timing, instead of estimating word positions? — outcome",
    "text": "Karaoke-precise captions and scene cuts, driven from the audio that actually ships. Would do it again: yes."
  },
  {
    "id": "thinking/real-stt-timestamps-145",
    "source": "thinking/real-stt-timestamps",
    "href": "/thinking#real-stt-timestamps",
    "label": "Why transcribe generated narration for timing, instead of estimating word positions? — option considered: Estimate from words per minute",
    "text": "Estimate from words per minute. In favour: Free, instant, and no extra dependency in the chain. Close enough for a rough cut. Against: Error accumulates across a 30-second narration, so the drift is worst at the end. Captions that miss by 300 milliseconds do not read as slightly off, they read as broken."
  },
  {
    "id": "thinking/real-stt-timestamps-146",
    "source": "thinking/real-stt-timestamps",
    "href": "/thinking#real-stt-timestamps",
    "label": "Why transcribe generated narration for timing, instead of estimating word positions? — option considered: Transcribe the generated audio with Scribe for word-level timestamps",
    "text": "Transcribe the generated audio with Scribe for word-level timestamps. In favour: Exact word start times, taken from the audio that will actually ship. Scene cuts and captions can both be driven from one source of truth. Against: One more paid API call per video. Another third-party step that can be slow or fail."
  },
  {
    "id": "thinking/checkpoint-every-paid-step-147",
    "source": "thinking/checkpoint-every-paid-step",
    "href": "/thinking#checkpoint-every-paid-step",
    "label": "Why checkpoint every paid step, rather than retrying a failed job from the start?",
    "text": "Why checkpoint every paid step, rather than retrying a failed job from the start? One Studio render chains text-to-speech, speech-to-text, image-to-video and lip-sync, each billed per call, and the presenter step alone polls a third-party render for roughly an hour. Restart-on-failure is the simpler design, and for a cheap, fast job it would be the right one. This decision is about Mirasphere Studio."
  },
  {
    "id": "thinking/checkpoint-every-paid-step-148",
    "source": "thinking/checkpoint-every-paid-step",
    "href": "/thinking#checkpoint-every-paid-step",
    "label": "Why checkpoint every paid step, rather than retrying a failed job from the start? — what was chosen",
    "text": "Chose: Checkpoint each completed step. When every step in a chain bills per call and one of them takes an hour, retry semantics are the architecture. The design assumption was that the vendors will be slow and occasionally fail, and the job of the pipeline is to make that cost nothing. This decision is about Mirasphere Studio."
  },
  {
    "id": "thinking/checkpoint-every-paid-step-149",
    "source": "thinking/checkpoint-every-paid-step",
    "href": "/thinking#checkpoint-every-paid-step",
    "label": "Why checkpoint every paid step, rather than retrying a failed job from the start? — the trade-off",
    "text": "Noticeably more state to manage, and a job table that is now the reliability story of the whole product rather than a queue."
  },
  {
    "id": "thinking/checkpoint-every-paid-step-150",
    "source": "thinking/checkpoint-every-paid-step",
    "href": "/thinking#checkpoint-every-paid-step",
    "label": "Why checkpoint every paid step, rather than retrying a failed job from the start? — outcome",
    "text": "Retries resume from the last completed step, so failures cost time and never money — which is what made the pipeline usable rather than merely working. Would do it again: yes."
  },
  {
    "id": "thinking/checkpoint-every-paid-step-151",
    "source": "thinking/checkpoint-every-paid-step",
    "href": "/thinking#checkpoint-every-paid-step",
    "label": "Why checkpoint every paid step, rather than retrying a failed job from the start? — option considered: Retry the whole job on failure",
    "text": "Retry the whole job on failure. In favour: Far less state to manage — a job is either done or not. No partial-result correctness questions. Against: One flake anywhere in the chain re-bills every step that had already succeeded. With an hour-long presenter render in the middle, a late failure costs the whole hour again."
  },
  {
    "id": "thinking/checkpoint-every-paid-step-152",
    "source": "thinking/checkpoint-every-paid-step",
    "href": "/thinking#checkpoint-every-paid-step",
    "label": "Why checkpoint every paid step, rather than retrying a failed job from the start? — option considered: Checkpoint each completed step",
    "text": "Checkpoint each completed step. In favour: A retry resumes from the last completed step, so a failure costs nothing extra. Slow, flaky third-party APIs stop being a reliability problem and become a latency problem. Against: More state management, and every intermediate artefact needs a defined shape and a place to live. Checkpoints can go stale if an earlier input changes, which has to be reasoned about."
  },
  {
    "id": "thinking/typed-data-vs-mdx-153",
    "source": "thinking/typed-data-vs-mdx",
    "href": "/thinking#typed-data-vs-mdx",
    "label": "Why typed data files for this portfolio, and not MDX frontmatter?",
    "text": "Why typed data files for this portfolio, and not MDX frontmatter? Every project on this site carries around twenty fields, several of them nested arrays — a stack with a required rationale per item, ten case-study sections, architecture nodes with failure modes. That content had to be authored somewhere, and the obvious default was MDX with YAML frontmatter."
  },
  {
    "id": "thinking/typed-data-vs-mdx-154",
    "source": "thinking/typed-data-vs-mdx",
    "href": "/thinking#typed-data-vs-mdx",
    "label": "Why typed data files for this portfolio, and not MDX frontmatter? — what was chosen",
    "text": "Chose: Typed TypeScript modules validated with Zod. The most important requirement for this content was that invented metrics and unfilled placeholders could not reach production. That is a validation problem, and validation wants a type system. Zod refinements enforce rules — one of `client` or `clientDescriptor`, a capture date on every metric, a real reason on every technology — that YAML would let through silently."
  },
  {
    "id": "thinking/typed-data-vs-mdx-155",
    "source": "thinking/typed-data-vs-mdx",
    "href": "/thinking#typed-data-vs-mdx",
    "label": "Why typed data files for this portfolio, and not MDX frontmatter? — the trade-off",
    "text": "The site now has no CMS, and content changes require a commit and a deploy. For a single-author portfolio that is a fair exchange; for a team or a client site it would be the wrong call, and I would reach for a hosted CMS with the same schema enforced at the edge."
  },
  {
    "id": "thinking/typed-data-vs-mdx-156",
    "source": "thinking/typed-data-vs-mdx",
    "href": "/thinking#typed-data-vs-mdx",
    "label": "Why typed data files for this portfolio, and not MDX frontmatter? — outcome",
    "text": "Long-form prose can still migrate to MDX bodies without changing this shape, because the schema describes structure rather than storage. Would do it again: yes."
  },
  {
    "id": "thinking/typed-data-vs-mdx-157",
    "source": "thinking/typed-data-vs-mdx",
    "href": "/thinking#typed-data-vs-mdx",
    "label": "Why typed data files for this portfolio, and not MDX frontmatter? — option considered: MDX with YAML frontmatter",
    "text": "MDX with YAML frontmatter. In favour: Prose and metadata live in one file. Conventional, and easy to move to a hosted CMS later. Against: YAML has no types, so a mistyped field fails at render rather than in the editor. Deeply nested arrays in YAML are error-prone to hand-author. No autocomplete for twenty field names."
  },
  {
    "id": "thinking/typed-data-vs-mdx-158",
    "source": "thinking/typed-data-vs-mdx",
    "href": "/thinking#typed-data-vs-mdx",
    "label": "Why typed data files for this portfolio, and not MDX frontmatter? — option considered: Typed TypeScript modules validated with Zod",
    "text": "Typed TypeScript modules validated with Zod. In favour: Editor autocomplete for every field, and compile-time errors on typos. Zod refinements can encode rules YAML cannot — such as requiring exactly one of `client` or `clientDescriptor`. The honesty rules become build failures instead of good intentions. Against: Content is coupled to the codebase, so a non-technical editor cannot update it. Long prose in template literals is less pleasant to write than Markdown."
  },
  {
    "id": "thinking/dropping-gsap-159",
    "source": "thinking/dropping-gsap",
    "href": "/thinking#dropping-gsap",
    "label": "Why does this site not use GSAP, when the plan specified it?",
    "text": "Why does this site not use GSAP, when the plan specified it? The build plan for this portfolio named GSAP with ScrollTrigger as the animation layer, and it was installed and wired up first. Then the performance budget gate was written, and it failed: first-load JavaScript came to 220 KB gzipped. Attributing that weight chunk by chunk showed GSAP core plus ScrollTrigger accounted for 43.5 KB gzipped — and, because the reveal logic lived in the root layout, it was being shipped on every single route."
  },
  {
    "id": "thinking/dropping-gsap-160",
    "source": "thinking/dropping-gsap",
    "href": "/thinking#dropping-gsap",
    "label": "Why does this site not use GSAP, when the plan specified it? — what was chosen",
    "text": "Chose: IntersectionObserver plus CSS keyframes. Everything V1 actually animates is a fade-up on scroll, a hero entrance and a breathing SVG. All three are CSS keyframes triggered by an observer. Paying 43.5 KB on every route for a timeline API that nothing was using is not a trade-off, it is an oversight — and the project rule was already written down: if an effect costs performance, remove the effect. The corollary is that if a library is not earning its bytes, remove the library."
  },
  {
    "id": "thinking/dropping-gsap-161",
    "source": "thinking/dropping-gsap",
    "href": "/thinking#dropping-gsap",
    "label": "Why does this site not use GSAP, when the plan specified it? — the trade-off",
    "text": "There is now no timeline sequencing available. The moment the V2 work needs the pinned Work transition or an animated architecture diagram, GSAP earns its place again — and it will come back as a dynamic import scoped to those components, never in the root layout. Hand-rolled staggering and a small magnetic-hover helper are also now this codebase’s to maintain rather than a vendor’s."
  },
  {
    "id": "thinking/dropping-gsap-162",
    "source": "thinking/dropping-gsap",
    "href": "/thinking#dropping-gsap",
    "label": "Why does this site not use GSAP, when the plan specified it? — outcome",
    "text": "First-load JavaScript went from 220 KB to 186 KB gzipped. More usefully, once the framework floor is subtracted — a bare Next 16.3 and React 19 route with zero client components measures 182 KB on its own — the code this project actually wrote is 4.2 KB on the heaviest route. Six of the eight routes ship no page-specific client JavaScript at all. The budget gate itself was rewritten to measure that delta rather than an absolute number, because an absolute budget dominated by a framework constant fails on day one and then gets ignored. Would do it again: yes."
  },
  {
    "id": "thinking/dropping-gsap-163",
    "source": "thinking/dropping-gsap",
    "href": "/thinking#dropping-gsap",
    "label": "Why does this site not use GSAP, when the plan specified it? — option considered: Keep GSAP, raise the budget",
    "text": "Keep GSAP, raise the budget. In favour: No rework, and the timeline API is genuinely excellent. Already integrated and working. Against: A budget that moves whenever it is inconvenient is not a budget. 43.5 KB on every route to do fade-up-on-scroll is a bad exchange. A portfolio arguing for performance while paying that is arguing against itself."
  },
  {
    "id": "thinking/dropping-gsap-164",
    "source": "thinking/dropping-gsap",
    "href": "/thinking#dropping-gsap",
    "label": "Why does this site not use GSAP, when the plan specified it? — option considered: Keep GSAP, but load it lazily",
    "text": "Keep GSAP, but load it lazily. In favour: Off the critical path, and the API stays available. Smaller change than removing it. Against: Still downloads for nearly every visitor, just slightly later. Reveal animations are the first thing a visitor scrolls into, so deferring them either delays the effect or causes a visible jump."
  },
  {
    "id": "thinking/dropping-gsap-165",
    "source": "thinking/dropping-gsap",
    "href": "/thinking#dropping-gsap",
    "label": "Why does this site not use GSAP, when the plan specified it? — option considered: IntersectionObserver plus CSS keyframes",
    "text": "IntersectionObserver plus CSS keyframes. In favour: Roughly 1 KB instead of 43.5 KB, for a visually identical result. Animations become CSS, so they honour prefers-reduced-motion natively. The hero and the flow diagram become server components, since they no longer need a JS runtime at all. Against: No timeline sequencing, so complex choreography would be painful. Hand-rolled staggering, which is a small amount of code to own."
  },
  {
    "id": "thinking/directing-an-ai-pair-166",
    "source": "thinking/directing-an-ai-pair",
    "href": "/thinking#directing-an-ai-pair",
    "label": "How does one developer replace an established practice-management platform in eight weeks, and what does using AI to do it actually cost?",
    "text": "How does one developer replace an established practice-management platform in eight weeks, and what does using AI to do it actually cost? The firm was running on BrightManager, an established UK practice-management product, at roughly £500 per user per year. Replacing it meant 55 data models, 28 enums, 197 endpoints and twelve background services, against a live database of a real firm’s client history, with one developer. The way I chose to build this CRM was to direct an AI pair — Claude — and review everything it produced, line by line. That arithmetic does not work on typing speed, and pretending otherwise would have meant cutting the scope until it fit the typing — which is the same as not replacing the incumbent at all. This decision is about FFS Manager — Practice CRM and CH Scrapper — Lead Engine."
  },
  {
    "id": "thinking/directing-an-ai-pair-167",
    "source": "thinking/directing-an-ai-pair",
    "href": "/thinking#directing-an-ai-pair",
    "label": "How does one developer replace an established practice-management platform in eight weeks, and what does using AI to do it actually cost? — what was chosen",
    "text": "Chose: One developer directing an AI pair — Claude — with every architectural decision and every review mine.. The work that decided whether this project succeeded was not typing. It was choosing a relational model for compliance data where a document store would have looked fine for a month; validating that model against the firm’s real workflows with a one-day throwaway prototype before committing to anything; making migrations additive-only as a rule because the database held live client history from week one; and making the CSV importer dry-run by default. None of those are things you can delegate, and all of them are cheaper to get right than to fix. Delegating the volume is what left room to get them right. This decision is about FFS Manager — Practice CRM and CH Scrapper — Lead Engine."
  },
  {
    "id": "thinking/directing-an-ai-pair-168",
    "source": "thinking/directing-an-ai-pair",
    "href": "/thinking#directing-an-ai-pair",
    "label": "How does one developer replace an established practice-management platform in eight weeks, and what does using AI to do it actually cost? — the trade-off",
    "text": "The review burden, and it is real. Generated code arrives confident and uniform, which is exactly what makes a missing check hard to see: there is no ugly seam to draw your eye. The insecure direct object reference in the failure archive is this trade-off being paid — one route among 197 that authenticated correctly and then loaded a record without constraining it to the tenant. It was found by audit rather than by accident, and the fix was structural rather than local, but it was there to be found. Anyone working this way who claims otherwise has not looked."
  },
  {
    "id": "thinking/directing-an-ai-pair-169",
    "source": "thinking/directing-an-ai-pair",
    "href": "/thinking#directing-an-ai-pair",
    "label": "How does one developer replace an established practice-management platform in eight weeks, and what does using AI to do it actually cost? — outcome",
    "text": "It is in production, running the firm’s practice, and it absorbed years of BrightManager history without losing a record. The part worth judging is not the volume of code — it is that both bugs in the failure archive were found by me auditing my own system, one of them a cross-tenant exposure and the other a silently successful import. That is the half of this arrangement that actually has to work, and it is the half that does not come for free with the tooling. Would do it again: qualified."
  },
  {
    "id": "thinking/directing-an-ai-pair-170",
    "source": "thinking/directing-an-ai-pair",
    "href": "/thinking#directing-an-ai-pair",
    "label": "How does one developer replace an established practice-management platform in eight weeks, and what does using AI to do it actually cost? — option considered: One developer, unassisted",
    "text": "One developer, unassisted. In favour: Every line written by the person who has to maintain it, understood at the moment it was written. No review debt: you cannot ship code you never read. Against: The scope is simply not deliverable on this timeline, so the honest version of this option is a smaller product. The firm keeps paying the subscription and keeps working around the software while you type."
  },
  {
    "id": "thinking/directing-an-ai-pair-171",
    "source": "thinking/directing-an-ai-pair",
    "href": "/thinking#directing-an-ai-pair",
    "label": "How does one developer replace an established practice-management platform in eight weeks, and what does using AI to do it actually cost? — option considered: Configure a different off-the-shelf platform",
    "text": "Configure a different off-the-shelf platform. In favour: Fastest route to something working. Somebody else owns the maintenance, the security patches and the uptime. Against: The reason for the project was that the incumbent would not bend to the firm’s workflows — a different vendor is a different set of the same limits. The workarounds that were the real cost survive the migration."
  },
  {
    "id": "thinking/directing-an-ai-pair-172",
    "source": "thinking/directing-an-ai-pair",
    "href": "/thinking#directing-an-ai-pair",
    "label": "How does one developer replace an established practice-management platform in eight weeks, and what does using AI to do it actually cost? — option considered: One developer directing an AI pair (Claude), reviewing everything that lands",
    "text": "One developer directing an AI pair (Claude), reviewing everything that lands. In favour: The scope becomes deliverable: boilerplate stops consuming the budget. The developer’s attention moves to the parts that carry the risk — the data model, the migration, the tenancy boundary, the deploy. Against: Generated code is plausible before it is correct, and plausible code is harder to audit than code you wrote badly yourself. You own bugs you did not type, which means the review burden is permanent rather than a phase."
  },
  {
    "id": "failures/crm-idor-173",
    "source": "failures/crm-idor",
    "href": "/thinking#crm-idor",
    "label": "The record that belonged to someone else — what happened",
    "text": "During a security audit I ran on my own code, an authenticated request for a record ID that belonged to a different tenant returned the record instead of a 404. A live production CRM holding Fordham Finance Group’s client data. Nothing was known to have been accessed improperly, but the class of the bug is the one that matters most in this system: cross-tenant data exposure in software whose entire value proposition is being trusted with client records."
  },
  {
    "id": "failures/crm-idor-174",
    "source": "failures/crm-idor",
    "href": "/thinking#crm-idor",
    "label": "The record that belonged to someone else — cause",
    "text": "Authorisation was being checked per handler rather than asserted structurally. The route in question authenticated the user correctly and then loaded the record by ID without also constraining the query to that user’s tenant — the classic insecure direct object reference, arrived at not by carelessness but by 197 endpoints each individually responsible for remembering the same rule."
  },
  {
    "id": "failures/crm-idor-175",
    "source": "failures/crm-idor",
    "href": "/thinking#crm-idor",
    "label": "The record that belonged to someone else — the fix",
    "text": "Fixed the offending handler, then fixed the class: multi-tenant scoping is now asserted on every route rather than left to each handler to remember, so a new endpoint cannot omit it by default."
  },
  {
    "id": "failures/crm-idor-176",
    "source": "failures/crm-idor",
    "href": "/thinking#crm-idor",
    "label": "The record that belonged to someone else — what it taught",
    "text": "Per-handler authorisation is a rule that has to be remembered 197 times, and a rule that has to be remembered will eventually be forgotten. Scope structurally. The second lesson is about scheduling: I found this because I finally sat down to look, which means the audit should have been continuous from the week production held real data, not an event some weeks later."
  },
  {
    "id": "failures/brightmanager-csv-quoting-177",
    "source": "failures/brightmanager-csv-quoting",
    "href": "/thinking#brightmanager-csv-quoting",
    "label": "The import that looked like it worked — what happened",
    "text": "Importing years of BrightManager history produced records that were structurally valid and quietly wrong — fields shifted, values landing in the wrong columns — rather than an error. This was the migration the whole project depended on. The firm had to move years of client history into the new system with zero tolerance for data loss, and the dangerous outcome here was never a failed import: it was a successful-looking one that nobody would question until a deadline was missed."
  },
  {
    "id": "failures/brightmanager-csv-quoting-178",
    "source": "failures/brightmanager-csv-quoting",
    "href": "/thinking#brightmanager-csv-quoting",
    "label": "The import that looked like it worked — cause",
    "text": "BrightManager’s CSV exports quote fields inconsistently. Parsers that assume a consistent dialect resolve the ambiguity by guessing, and a guess that produces a parseable row produces a plausible row."
  },
  {
    "id": "failures/brightmanager-csv-quoting-179",
    "source": "failures/brightmanager-csv-quoting",
    "href": "/thinking#brightmanager-csv-quoting",
    "label": "The import that looked like it worked — the fix",
    "text": "Wrote a custom RFC-4180-compliant parser with a non-destructive merge, and made the importer dry-run by default so an import produces a report of what it would change before it changes anything."
  },
  {
    "id": "failures/brightmanager-csv-quoting-180",
    "source": "failures/brightmanager-csv-quoting",
    "href": "/thinking#brightmanager-csv-quoting",
    "label": "The import that looked like it worked — what it taught",
    "text": "For a migration, the failure mode to design against is not an error — it is silent success. Anything that writes historical data gets a dry run by default and a field-level diff, not a row count."
  },
  {
    "id": "failures/leadhouse-stale-register-181",
    "source": "failures/leadhouse-stale-register",
    "href": "/thinking#leadhouse-stale-register",
    "label": "Half the leads were not leads — what happened",
    "text": "The bulk register flagged a cohort of companies as having accounts due. Verifying them live against the Companies House REST API showed that roughly half were not overdue at all. Every one of those would have been a call to a company that had already filed — wasted outreach, and worse, an immediate credibility problem, because the entire pitch is knowing something specific and correct about the company being contacted."
  },
  {
    "id": "failures/leadhouse-stale-register-182",
    "source": "failures/leadhouse-stale-register",
    "href": "/thinking#leadhouse-stale-register",
    "label": "Half the leads were not leads — cause",
    "text": "The bulk company register is a monthly snapshot. A company that filed the day after the snapshot was taken still reads as due for up to a month, and the file gives no indication that it is out of date."
  },
  {
    "id": "failures/leadhouse-stale-register-183",
    "source": "failures/leadhouse-stale-register",
    "href": "/thinking#leadhouse-stale-register",
    "label": "Half the leads were not leads — the fix",
    "text": "Made live verification a mandatory stage rather than an optional one. Nothing downstream may treat the bulk flag as truth — the bulk file now produces candidates only, and a live REST profile check decides, with verdicts cached for 30 days so the API budget is spent on companies nobody has looked at yet."
  },
  {
    "id": "failures/leadhouse-stale-register-184",
    "source": "failures/leadhouse-stale-register",
    "href": "/thinking#leadhouse-stale-register",
    "label": "Half the leads were not leads — what it taught",
    "text": "A cheap data source is allowed to be wrong as long as the system never forgets that it might be. Bulk data generates hypotheses; the authoritative source confirms them. The mistake would have been trusting a field because it was convenient to trust."
  },
  {
    "id": "failures/leadhouse-jobs-dying-mid-batch-185",
    "source": "failures/leadhouse-jobs-dying-mid-batch",
    "href": "/thinking#leadhouse-jobs-dying-mid-batch",
    "label": "The scan that had to start again — what happened",
    "text": "Long scrape jobs died mid-batch whenever the process restarted — a deploy, a crash, a reboot — and lost their position entirely, along with any job rows left marked as running. Hours of scanning discarded, and a queue containing orphaned jobs that would never complete and never fail. Since verification runs deliberately at half the published rate ceiling, redoing work is not just slow, it is spending a limited API budget twice."
  },
  {
    "id": "failures/leadhouse-jobs-dying-mid-batch-186",
    "source": "failures/leadhouse-jobs-dying-mid-batch",
    "href": "/thinking#leadhouse-jobs-dying-mid-batch",
    "label": "The scan that had to start again — cause",
    "text": "Progress lived in the running process rather than in the database. A batch was an in-memory loop, so nothing outside that process knew how far it had got, and nothing on startup knew that a job claiming to be running no longer had anything running it."
  },
  {
    "id": "failures/leadhouse-jobs-dying-mid-batch-187",
    "source": "failures/leadhouse-jobs-dying-mid-batch",
    "href": "/thinking#leadhouse-jobs-dying-mid-batch",
    "label": "The scan that had to start again — the fix",
    "text": "Moved progress into Postgres: slice-and-continue batches with an auto-advancing cursor, so a killed job resumes from its last committed position instead of restarting, plus an orphan-job sweep on boot that reclaims anything the previous process left mid-flight."
  },
  {
    "id": "failures/leadhouse-jobs-dying-mid-batch-188",
    "source": "failures/leadhouse-jobs-dying-mid-batch",
    "href": "/thinking#leadhouse-jobs-dying-mid-batch",
    "label": "The scan that had to start again — what it taught",
    "text": "If a job takes longer than a deploy cycle, its progress belongs in the database, not in the process. And a queue needs to be able to tell the difference between \"running\" and \"was running when something died\" — otherwise the state is a lie the moment the process is."
  },
  {
    "id": "failures/virtuoso-post-event-bugs-189",
    "source": "failures/virtuoso-post-event-bugs",
    "href": "/thinking#virtuoso-post-event-bugs",
    "label": "The dashboards that only broke at events — what happened",
    "text": "The artist, asset and event-management dashboards behaved correctly in development and then produced a steady stream of defects during live event trials — more than ten of them reaching production. Failures landed during the trials the platform existed for, in front of the people running them, on the flows that mattered most: asset creation, purchase and profile management, across endpoints handling over a thousand requests a day."
  },
  {
    "id": "failures/virtuoso-post-event-bugs-190",
    "source": "failures/virtuoso-post-event-bugs",
    "href": "/thinking#virtuoso-post-event-bugs",
    "label": "The dashboards that only broke at events — cause",
    "text": "Not one root cause. What every one of them shared is that none of them appeared before the event — the dashboards had been exercised in development, but not under a live trial, and the defects lived in the gap between those two conditions."
  },
  {
    "id": "failures/virtuoso-post-event-bugs-191",
    "source": "failures/virtuoso-post-event-bugs",
    "href": "/thinking#virtuoso-post-event-bugs",
    "label": "The dashboards that only broke at events — the fix",
    "text": "Fixed them as they came in — more than ten defects resolved across four sprint cycles, in the dashboards and the endpoints behind them."
  },
  {
    "id": "failures/virtuoso-post-event-bugs-192",
    "source": "failures/virtuoso-post-event-bugs",
    "href": "/thinking#virtuoso-post-event-bugs",
    "label": "The dashboards that only broke at events — what it taught",
    "text": "A feature that has only been exercised against seeded data is untested, not tested. Since then the default is to get real conditions in front of the code as early as it will survive them — which is why the CRM went live with real client data in week one rather than after a staging phase."
  }
]

/** The corpus. Index first, so ids stay stable as case studies are added. */
export const ASK_CHUNKS: AskChunk[] = [...INDEXED, ...ASK_SUPPLEMENT]

/* Topics the site itself declines to answer, derived from the unfilled
   `[TO CONFIRM]` placeholders in site.config's logistics block — the same
   placeholders `npm run check:content` reports. A withheld topic fires only
   when a query names EVERY word of the field, because one word of overlap is
   far too blunt: "roles" alone must not refuse a question about his role at
   Virtuoso, which the corpus answers perfectly well. */
export const ASK_WITHHELD: { topic: string; terms: string[]; reason: string }[] = [
  {
    "topic": "rates",
    "terms": [
      "charge"
    ],
    "reason": "Rates are not published here — they depend on scope, and a number quoted without knowing yours would be a guess. Tell Dheeraj what you need and you will get a real one."
  },
  {
    "topic": "rates",
    "terms": [
      "rate"
    ],
    "reason": "Rates are not published here — they depend on scope, and a number quoted without knowing yours would be a guess. Tell Dheeraj what you need and you will get a real one."
  },
  {
    "topic": "rates",
    "terms": [
      "rates"
    ],
    "reason": "Rates are not published here — they depend on scope, and a number quoted without knowing yours would be a guess. Tell Dheeraj what you need and you will get a real one."
  },
  {
    "topic": "rates",
    "terms": [
      "price"
    ],
    "reason": "Rates are not published here — they depend on scope, and a number quoted without knowing yours would be a guess. Tell Dheeraj what you need and you will get a real one."
  },
  {
    "topic": "rates",
    "terms": [
      "pricing"
    ],
    "reason": "Rates are not published here — they depend on scope, and a number quoted without knowing yours would be a guess. Tell Dheeraj what you need and you will get a real one."
  },
  {
    "topic": "rates",
    "terms": [
      "cost"
    ],
    "reason": "Rates are not published here — they depend on scope, and a number quoted without knowing yours would be a guess. Tell Dheeraj what you need and you will get a real one."
  },
  {
    "topic": "rates",
    "terms": [
      "quote"
    ],
    "reason": "Rates are not published here — they depend on scope, and a number quoted without knowing yours would be a guess. Tell Dheeraj what you need and you will get a real one."
  },
  {
    "topic": "rates",
    "terms": [
      "hourly"
    ],
    "reason": "Rates are not published here — they depend on scope, and a number quoted without knowing yours would be a guess. Tell Dheeraj what you need and you will get a real one."
  },
  {
    "topic": "rates",
    "terms": [
      "budget"
    ],
    "reason": "Rates are not published here — they depend on scope, and a number quoted without knowing yours would be a guess. Tell Dheeraj what you need and you will get a real one."
  },
  {
    "topic": "leading a team",
    "terms": [
      "led",
      "team"
    ],
    "reason": "Nothing on this site describes leading a team. The projects here are sole-developer work, built end to end, and several were delivered alongside a client’s own developers and designers — which is collaboration rather than management. If team leadership is what you need, ask him directly rather than reading it into this."
  },
  {
    "topic": "leading a team",
    "terms": [
      "lead",
      "team"
    ],
    "reason": "Nothing on this site describes leading a team. The projects here are sole-developer work, built end to end, and several were delivered alongside a client’s own developers and designers — which is collaboration rather than management. If team leadership is what you need, ask him directly rather than reading it into this."
  },
  {
    "topic": "leading a team",
    "terms": [
      "leading",
      "team"
    ],
    "reason": "Nothing on this site describes leading a team. The projects here are sole-developer work, built end to end, and several were delivered alongside a client’s own developers and designers — which is collaboration rather than management. If team leadership is what you need, ask him directly rather than reading it into this."
  },
  {
    "topic": "leading a team",
    "terms": [
      "manage",
      "team"
    ],
    "reason": "Nothing on this site describes leading a team. The projects here are sole-developer work, built end to end, and several were delivered alongside a client’s own developers and designers — which is collaboration rather than management. If team leadership is what you need, ask him directly rather than reading it into this."
  },
  {
    "topic": "leading a team",
    "terms": [
      "managed",
      "team"
    ],
    "reason": "Nothing on this site describes leading a team. The projects here are sole-developer work, built end to end, and several were delivered alongside a client’s own developers and designers — which is collaboration rather than management. If team leadership is what you need, ask him directly rather than reading it into this."
  },
  {
    "topic": "leading a team",
    "terms": [
      "team",
      "size"
    ],
    "reason": "Nothing on this site describes leading a team. The projects here are sole-developer work, built end to end, and several were delivered alongside a client’s own developers and designers — which is collaboration rather than management. If team leadership is what you need, ask him directly rather than reading it into this."
  },
  {
    "topic": "work preference",
    "terms": [
      "work",
      "preference"
    ],
    "reason": "The CV lists “work preference” as a field and leaves its value to be confirmed, so there is nothing published here to quote."
  },
  {
    "topic": "open to roles in",
    "terms": [
      "open",
      "roles"
    ],
    "reason": "The CV lists “open to roles in” as a field and leaves its value to be confirmed, so there is nothing published here to quote."
  },
  {
    "topic": "visa / work authorisation",
    "terms": [
      "visa",
      "work",
      "authorisation"
    ],
    "reason": "The CV lists “visa / work authorisation” as a field and leaves its value to be confirmed, so there is nothing published here to quote."
  },
  {
    "topic": "notice period",
    "terms": [
      "notice",
      "period"
    ],
    "reason": "The CV lists “notice period” as a field and leaves its value to be confirmed, so there is nothing published here to quote."
  },
  {
    "topic": "salary expectations",
    "terms": [
      "salary",
      "expectations"
    ],
    "reason": "On “salary expectations” the CV states only this: Discussed at offer stage. Anything more precise is Dheeraj's to tell you himself."
  },
  {
    "topic": "preferred roles",
    "terms": [
      "preferred",
      "roles"
    ],
    "reason": "The CV lists “preferred roles” as a field and leaves its value to be confirmed, so there is nothing published here to quote."
  }
]

/** Measured at build time, for the interface to cite honestly. */
export const ASK_STATS = {
  /** Chunks taken from the embedded index. */
  indexed: 15,
  /** Chunks in the embedded index that this system will not quote. */
  superseded: 8,
  /** Chunks cut from the site's current content. */
  supplement: 192,
  /** The corpus. This is the number the interface is allowed to state. */
  chunks: 207,
  supplementChars: 61791,
} as const
