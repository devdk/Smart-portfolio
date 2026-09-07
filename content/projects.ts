import type { ProjectInput } from '@/lib/schema'

/* ==========================================================================
   PROJECTS

   Structured TS rather than MDX frontmatter — a deliberate decision, and it
   is documented as one in content/thinking.ts ("Why typed data files instead
   of MDX frontmatter"). Short version: these objects have ~20 fields with
   nested arrays, and Zod validation over a typed module gives editor
   autocomplete and compile-time errors, which YAML frontmatter cannot.
   Long-form prose bodies can still move to MDX later without touching
   this shape.

   TIERS (from the plan):
     flagship   — full ten-part case study.
     supporting — one-screen summary.
     archive    — a clean list with links.

   All four projects below are flagship, and every fact in them is traceable
   to the source repositories. Numbers that exist appear as metrics with a
   source and a capture date; numbers that do not exist are absent rather
   than estimated.

   Anything in [BRACKETS] is unfilled and will fail `npm run check:content`.
   ========================================================================== */

export const projects: ProjectInput[] = [
  {
    slug: 'crm',
    title: 'FFS Manager — Practice CRM',
    tagline:
      'The software Fordham Finance Group runs its practice on, in place of a £500-per-user-per-year subscription.',

    category: 'webapp',
    status: 'live',
    tier: 'flagship',

    role: 'Sole developer, end to end — at Mirasphere Digital, for an agency client',
    year: 2026,
    employer: 'Mirasphere Digital',
    clientIndustry: 'accountancy',
    duration: '~8 weeks from first line to production',
    client: 'Fordham Finance Group',
    url: 'https://crm.fordhamfinance.co.uk',

    stack: [
      {
        name: 'TypeScript',
        category: 'language',
        why: 'The domain is UK tax compliance — VAT, PAYE, CT600, self-assessment, P11D, CIS — where the difference between two obligation types is a different deadline and a different penalty. Types are how those distinctions survive contact with a codebase one person maintains.',
      },
      {
        name: 'Fastify',
        category: 'framework',
        why: 'Schema-validated routes with zod at the boundary, and one deployable unit rather than a service mesh. 197 endpoints in 16 modules stay tractable when the request and response shapes are declared rather than assumed.',
      },
      {
        name: 'PostgreSQL',
        category: 'database',
        why: 'Compliance data is deeply relational: clients link to obligations, obligations to deadlines, deadlines to documents and signatures. Relational integrity is the feature, not the overhead.',
      },
      {
        name: 'Prisma',
        category: 'tooling',
        why: '55 models and 28 enums need a migration story before they need anything else. Prisma made every schema change an explicit, reviewable, additive migration against a database holding a firm’s live client history.',
      },
      {
        name: 'Redis',
        category: 'infrastructure',
        why: 'The nightly Companies House sync, deadline reminders and encrypted backups all had to run without a user waiting on them. Redis is the queue substrate that gets them off the request path.',
      },
      {
        name: 'BullMQ',
        category: 'infrastructure',
        why: 'Twelve background services need retries, scheduling and visibility into what failed. Writing that once, badly, is the usual alternative.',
      },
      {
        name: 'React',
        category: 'framework',
        why: 'The UI is data-dense — client records, deadline boards, document lists — and TanStack Query’s caching is what makes it feel immediate without a request per interaction.',
      },
      {
        name: 'Socket.IO',
        category: 'infrastructure',
        why: 'Staff and clients act on the same records from different sides of the portal. Notifications had to arrive without a refresh, which is a push problem rather than a polling problem.',
      },
      {
        name: 'Docker',
        category: 'infrastructure',
        why: 'Postgres, Redis, workers and file storage sit on one VPS. Containerising the deploy path is what makes a single box reproducible rather than precious.',
      },
    ],

    // 01
    context:
      'Fordham Finance Group ran its practice on BrightManager at roughly £500 per user per year — and kept hitting its limits on the workflows they actually needed. The subscription was the cheap part of the problem; the expensive part was the work that had to happen outside the software because the software would not bend. Fordham came to Mirasphere Digital, where I was the only developer on the project from the data model through to deployment and support — and directing an AI pair — Claude — throughout, which is the only reason a replacement of this scope was deliverable by one person. That arrangement is written up as a decision rather than mentioned as a footnote, because the interesting part is not that AI was used but which half of the work stayed mine.',
    // 02
    problem:
      'Replace the firm’s core operating software — clients, UK tax deadlines, documents, signatures, billing, client portal — without losing a single record, while the firm kept working.',
    // 03
    constraints: [
      'One developer, roughly eight weeks from first line to production',
      'Live client data from week one — zero tolerance for data loss',
      'Years of BrightManager history had to import cleanly',
      'UK compliance domain: VAT, PAYE, CT600, self-assessment, P11D, CIS',
    ],
    // 04
    approach:
      'A one-day Express and SQLite prototype first, to validate the data model against the firm’s actual workflows before committing to anything. That prototype earned the production rebuild: a Fastify and PostgreSQL monorepo, additive-only migrations as a rule rather than a preference, and a dry-run-by-default CSV importer as the escape hatch from the old system.',
    // 05
    architecture: {
      nodes: [
        {
          id: 'react-app',
          label: 'React app',
          tech: 'React 18 + Vite + TanStack Query',
          purpose: 'Staff console and client portal — records, deadline boards, documents, signing.',
          rationale:
            'Fast iteration, and aggressive caching for a data-dense UI where the same client record is read far more often than it is written.',
        },
        {
          id: 'api',
          label: 'API',
          tech: 'Fastify 5 + TypeScript',
          purpose: '197 schema-validated endpoints across 16 modules, in one deployable unit.',
          rationale:
            'Schema-validated routes with zod, fast, and a single deployable — the whole system is one person’s to reason about, so it is one thing to deploy.',
          failureMode:
            'The write path is where this breaks first, and not for capacity reasons. Multi-tenant scoping is asserted on every route, so the failure mode is a new route that forgets it — which is exactly what the self-run security audit caught as an IDOR.',
        },
        {
          id: 'queue',
          label: 'Queue',
          tech: 'Redis + BullMQ',
          purpose: 'Nightly Companies House sync, deadline reminders, encrypted backups.',
          rationale:
            'Everything on this list is slow, periodic, or both. None of it belongs on a request the user is waiting for.',
          failureMode:
            'Redis is the single dependency here. If it goes, the app keeps serving reads and writes while the sync, the reminders and the nightly backup silently stop — which is the dangerous shape of failure, because nobody notices a reminder that was never sent.',
        },
        {
          id: 'database',
          label: 'Database',
          tech: 'PostgreSQL 16 + Prisma',
          purpose: '55 models and 28 enums covering clients, obligations, documents and billing.',
          rationale:
            'Relational integrity for compliance data. A missing foreign key here is a missed filing deadline later.',
        },
        {
          id: 'realtime',
          label: 'Realtime',
          tech: 'Socket.IO',
          purpose: 'Live notifications across staff and the client portal.',
          rationale:
            'Staff and clients touch the same records from opposite sides. Push beats polling when both ends need to see a change immediately.',
        },
        {
          id: 'vps',
          label: 'VPS',
          tech: 'PM2 cluster + Nginx, with a Caddy/Docker path',
          purpose: 'Hosts the API, workers, database, Redis and file storage on one box.',
          rationale:
            'Postgres, Redis, file storage and workers on one machine is a predictable monthly cost and a one-command deploy.',
          failureMode:
            'One box means I own the ops. Backups, recovery drills and TLS are mine to get right, which is why the recovery path is documented in four layers and the nightly backups are encrypted rather than assumed.',
        },
      ],
      edges: [
        { from: 'react-app', to: 'api', label: 'HTTPS / JSON' },
        { from: 'api', to: 'queue', label: 'Enqueue' },
        { from: 'queue', to: 'database', label: 'Workers' },
        { from: 'database', to: 'realtime', label: 'Change events' },
        { from: 'realtime', to: 'vps', label: 'Same host' },
      ],
    },
    // 06
    implementation:
      'One monorepo, one deployable API. Fastify serves 197 schema-validated routes across 16 modules, with 12 background services behind Redis and BullMQ so the nightly Companies House sync, the deadline reminders and the encrypted backups never sit on a request. Prisma models the compliance domain properly — 55 models, 28 enums — and every schema change ships as an additive migration, 26 of them against production so far, because a destructive migration against a firm’s live client history is not a mistake you get to make twice. The two parts worth interrogating are the importer and the signature flow. The importer is a custom RFC-4180 parser with a non-destructive merge and a dry run by default, because BrightManager’s exports quote inconsistently and the failure mode of getting that wrong is silent corruption of the firm’s history. E-signatures are built in-house — sequential and parallel signer ordering, PDF stamping, an append-only audit trail — because per-envelope pricing would have quietly reintroduced the subscription the project existed to remove.',
    // 07
    challenges: [
      'BrightManager exports quoted CSV fields inconsistently, so off-the-shelf parsing produced plausible-looking but wrong records — the worst possible outcome when the data is a firm’s client history',
      'A security audit I ran on my own code found an IDOR: an authenticated user could reach a record belonging to another tenant',
      'E-signatures needed DocuSign-class flows — sequential and parallel signers, a real audit trail — without DocuSign’s per-envelope pricing',
    ],
    // 08
    solution:
      'The CSV problem was solved by not trusting a library: a parser written to RFC 4180 with a non-destructive merge, run as a dry run first so a bad import produces a report instead of a rollback. The IDOR was fixed in the offending handler, and then properly: multi-tenant scoping is now asserted on every route rather than trusted to each one to remember, because the class of bug matters more than the instance. E-signatures were built rather than bought — signer ordering, PDF stamping and audit events took roughly two weeks and now cost nothing per envelope, fully joined to the client records they belong to.',
    // 09
    metrics: [
      {
        label: 'API endpoints in production',
        after: '197',
        source: 'self-measured',
        capturedAt: '2026-08-01',
        note: 'Across 16 modules, with 12 background services.',
      },
      {
        label: 'Additive migrations against production',
        after: '26',
        source: 'self-measured',
        capturedAt: '2026-08-01',
        note: 'Zero data loss.',
      },
      {
        label: 'TypeScript in the monorepo',
        after: '~30,000 lines',
        source: 'self-measured',
        capturedAt: '2026-08-01',
      },
    ],
    // 10
    reflection:
      'The one-day prototype earned the rebuild — it proved the data model cheaply, before anything expensive was committed. What I would change is the order of the safety work: the test suite should have arrived earlier, and the security audit should have been continuous rather than an event. Finding an IDOR in your own code is a good day; finding it because you finally sat down to look is a lesson about scheduling.',

    outcome:
      'The firm runs on it. It is live at crm.fordhamfinance.co.uk with real client and team data, it absorbed years of BrightManager history without losing a record, and it replaces roughly £500 per user per year of subscription cost with a workflow that bends when the firm needs it to.',

    decisions: [
      'postgres-prisma-over-mongodb',
      'e-signatures-in-house',
      'vps-over-managed-paas',
      'directing-an-ai-pair',
    ],
    incidents: ['crm-idor', 'brightmanager-csv-quoting'],

    featured: true,
    order: 1,
  },

  {
    slug: 'leadhouse',
    title: 'CH Scrapper — Lead Engine',
    tagline:
      'The UK’s entire public company register, turned into pre-qualified leads at zero cost per lead.',

    category: 'automation',
    status: 'live',
    tier: 'flagship',

    role: 'Sole developer, end to end — at Mirasphere Digital, for an agency client',
    year: 2026,
    employer: 'Mirasphere Digital',
    clientIndustry: 'accountancy',
    client: 'Swann Bookkeeping & Accountancy',

    stack: [
      {
        name: 'Python',
        category: 'language',
        why: 'The core job is a 2.9GB CSV of roughly five million rows. That is pandas territory, and choosing the right tool mattered more here than keeping one language across the portfolio.',
      },
      {
        name: 'pandas',
        category: 'tooling',
        why: 'Chunked ingest at 25,000 rows at a time is what lets a modest VPS process the whole register without a single API call, or a memory ceiling.',
      },
      {
        name: 'FastAPI',
        category: 'framework',
        why: 'The dashboard needed to start jobs, watch progress and export leads. FastAPI keeps that surface thin and typed, next to the Python that does the actual work.',
      },
      {
        name: 'PostgreSQL',
        category: 'database',
        why: 'Nine tables holding jobs, resumable cursors, a 30-day verdict cache and a suppression list. Every one of those is a correctness requirement — a lead sent to a suppressed contact is a compliance failure, not a bug.',
      },
      {
        name: 'React',
        category: 'framework',
        why: 'Long jobs need live progress. A dashboard that shows a batch advancing is the difference between trusting a six-minute scan and refreshing a log file.',
      },
      {
        name: 'Docker',
        category: 'infrastructure',
        why: 'Jobs die on deploys and restarts, so the deploy path had to be boring and repeatable before the resumability work meant anything.',
      },
      {
        name: 'Caddy',
        category: 'infrastructure',
        why: 'TLS and reverse proxying with no configuration to forget, on a single-box deployment where the ops budget is one person’s attention.',
      },
    ],

    context:
      'Accountants win clients whose filing deadlines are close. Companies House publishes every company’s accounts due date and offers no way to query for it, and the paid lead platforms that fill that gap charge per lead for data that is already public.',
    problem:
      'Turn the UK’s public company register into a pipeline of pre-qualified, contactable leads — at zero marginal cost per lead.',
    constraints: [
      'Companies House rate limits at 600 requests per five minutes — stay a good citizen at half the ceiling',
      'The full register is a 2.9GB monthly CSV of roughly five million rows',
      'Bulk data goes stale, so a "due" flag must be verified before anyone calls',
      'GDPR and PECR: lawful basis and suppression built into the schema, not bolted on',
    ],
    approach:
      'Hybrid by design. Source offline from the full bulk register with pandas in 25,000-row chunks, verify online through the rate-limited REST API, and make every long job restart-survivable: resumable batches with an auto-advancing cursor, and an orphan-job sweep on boot. The bulk file answers "who might be due" for free; the API answers "who actually is" for the few hundred that matter.',
    architecture: {
      nodes: [
        {
          id: 'bulk-ingest',
          label: 'Bulk ingest',
          tech: 'pandas, chunked CSV',
          purpose: 'Reads the full monthly company register into Postgres.',
          rationale:
            'The whole register, without a single API call. 25,000-row chunks keep memory flat regardless of file size.',
          failureMode:
            'The snapshot lies, and it lies confidently. It is monthly, so a company that filed yesterday still reads as due — live verification on a cohort of 162 flagged companies confirmed only 83 were actually overdue. Nothing downstream may treat the bulk flag as truth.',
        },
        {
          id: 'filter-engine',
          label: 'Filter engine',
          tech: 'Python rules',
          purpose: 'Narrows five million rows to candidates by due-date window, sector and geography.',
          rationale:
            'Deterministic rules over a local table cost nothing to run and can be re-run the moment the definition of a good lead changes.',
        },
        {
          id: 'verifier',
          label: 'Verifier',
          tech: 'Companies House REST + sliding-window limiter',
          purpose: 'Checks the live company profile before a lead ships; caches verdicts for 30 days.',
          rationale:
            'A live check is the only thing that turns a stale flag into a fact, and the 30-day cache keeps the API budget spent on companies nobody has looked at yet.',
          failureMode:
            'The rate limiter is the bottleneck and the point of failure by design. It runs at half the published 600-per-five-minute ceiling to leave headroom for retries, so verification is deliberately the slow stage — and an eight-step backoff honouring Retry-After exists because 429, 404, 5xx and TLS failures need different answers.',
        },
        {
          id: 'enrichment',
          label: 'Enrichment',
          tech: '3-tier matching + Hunter',
          purpose: 'Finds the company’s website and a contactable address.',
          rationale:
            'Matching is scored on evidence rather than guessed: a registered number in a site footer scores 95, a postcode match 80. A wrong match is worse than no match.',
        },
        {
          id: 'store',
          label: 'Store',
          tech: 'PostgreSQL, 9 tables',
          purpose: 'Jobs, resumable cursors, verdict cache, suppression list.',
          rationale:
            'The cursor is what makes a long job survivable, and the suppression list is a schema-level obligation rather than a checkbox in an interface.',
        },
        {
          id: 'dashboard',
          label: 'Dashboard',
          tech: 'React + FastAPI',
          purpose: 'Run jobs, watch progress, export leads.',
          rationale:
            'The jobs take minutes and can resume mid-batch. Progress has to be visible or nobody trusts the output.',
        },
      ],
      edges: [
        { from: 'bulk-ingest', to: 'filter-engine', label: 'Rows' },
        { from: 'filter-engine', to: 'verifier', label: 'Candidates' },
        { from: 'verifier', to: 'enrichment', label: 'Confirmed due' },
        { from: 'enrichment', to: 'store', label: 'Leads' },
        { from: 'store', to: 'dashboard', label: 'Jobs + exports' },
      ],
    },
    implementation:
      'Ingest reads the monthly register in 25,000-row chunks, so memory stays flat whatever the file does. Filtering happens locally against Postgres, which makes the definition of a good lead cheap to change. Verification is the expensive stage and is treated as such: a sliding-window limiter pinned at half the published ceiling, an eight-step backoff that honours Retry-After, and separate handling for 429, 404, 5xx and TLS failures, because retrying a 404 forever is how you get banned for a company that does not exist. Verdicts cache for 30 days. Enrichment scores matches on evidence rather than similarity — a registered company number in a site footer scores 95, a postcode match 80 — and Hunter fills the contact gap only after a match is trusted. Nine Postgres tables hold jobs, cursors, the verdict cache and the suppression list; the cursor auto-advances so a batch killed by a deploy resumes rather than restarts, and an orphan-job sweep on boot cleans up whatever the last restart left mid-flight.',
    challenges: [
      'Long jobs died mid-batch on deploys and restarts, losing hours of scanning',
      'The bulk snapshot flagged companies as due that were not: live verification found only 83 of 162 flagged companies were actually overdue',
      'Distinguishing 429, 404, 5xx and TLS failures so each got the correct retry behaviour rather than a generic one',
    ],
    solution:
      'Resumability was solved with slice-and-continue batches and an auto-advancing cursor, plus an orphan-job sweep on boot — one 42,119-row batch was processed across five resumed runs without losing position. Staleness was solved by refusing to trust the snapshot: the bulk file produces candidates, and the live REST profile decides. Retry behaviour was solved by classifying failures properly and building an eight-step backoff that honours Retry-After, which is why 22 production scrape jobs have run without a single rate-limit incident.',
    metrics: [
      {
        label: 'Register cohort scanned',
        after: '171,876 companies in ~6 minutes',
        source: 'self-measured',
        capturedAt: '2026-08-01',
      },
      {
        label: 'Companies matched in one imported batch',
        after: '8,668 from 42,119 rows',
        source: 'self-measured',
        capturedAt: '2026-08-01',
      },
      {
        label: 'Rate-limit incidents',
        after: '0 across 22 production jobs',
        source: 'self-measured',
        capturedAt: '2026-08-01',
      },
    ],
    reflection:
      'Rejecting the Streaming API was right, and it was the decision the whole design rests on: streaming answers "what changed", and the business question is "who is due", which is a full-register scan. The next leap is not more coverage but better ranking — scoring leads by likelihood to switch accountants rather than by deadline alone, because a deadline tells you who is under pressure and not who is unhappy.',
    outcome:
      'It fills the firm’s outreach pipeline at zero cost per lead, with every lead pre-qualified by a live-verified filing deadline rather than a stale flag — and it does it from data that was already public.',

    decisions: [
      'bulk-csv-over-streaming-api',
      'half-the-rate-ceiling',
      'python-over-node-for-bulk-data',
    ],
    incidents: ['leadhouse-stale-register', 'leadhouse-jobs-dying-mid-batch'],

    featured: true,
    order: 2,
  },

  {
    slug: 'ads-analyser',
    title: 'Competitive Ads Extractor',
    tagline:
      'A competitor list in, every live Facebook and Instagram ad out — clustered into hooks, offers and gaps.',

    category: 'automation',
    status: 'live',
    tier: 'flagship',

    role: 'Sole developer',
    year: 2026,
    clientDescriptor:
      'marketing work where competitor ad research was being done by hand, one ad at a time',
    url: 'https://meta-competitor-analysis.dheerajdrive.com/',

    stack: [
      {
        name: 'Node.js',
        category: 'runtime',
        why: 'The tool has to install and run anywhere, on a machine that has not been prepared for it. Three dependencies on a runtime that is already present is the whole distribution story.',
      },
      {
        name: 'Meta Ad Library API',
        category: 'infrastructure',
        why: 'It is the only sanctioned route to live ad creative, and it is quirky — pagination, EU DSA caveats, page-ID resolution. Building against it properly was most of the engineering.',
      },
      {
        name: 'PDFKit',
        category: 'tooling',
        why: 'The output has to be something a client can open, not a JSON file. A PDF per run, generated with no headless browser and no service, keeps that promise cheaply.',
      },
    ],

    context:
      'Knowing what competitors are running on Facebook and Instagram means manually trawling the Meta Ad Library, ad by ad — a job that is tedious at ten ads and impossible at three hundred.',
    problem:
      'One command in: a competitor list. One report out: every live ad, clustered into hooks, offers, and the angles nobody in the market has claimed.',
    constraints: [
      'Meta’s Ad Library API is quirky: pagination, EU DSA caveats, page-ID resolution',
      'Zero budget — no LLM spend on analysis',
      'Output must be client-presentable — a dashboard and a PDF, not JSON dumps',
    ],
    approach:
      'Deliberately dependency-light: three packages, no framework, no database, and a rule-based analysis pipeline that is deterministic, free and auditable. The hard engineering went somewhere less glamorous — three-tier competitor resolution that accepts a page URL, a brand name, or a bare domain, because that is the input a real user actually has. [CONFLICT TO RESOLVE — THIS PAGE DESCRIBES A LOCAL TOOL WITH NO DATABASE AND TIMESTAMPED FOLDERS AS THE DATASTORE, BUT THE LIVE CONSOLE HAS USER REGISTRATION, ADMIN APPROVAL AND SAVED RUN HISTORY. SAY WHETHER THE HOSTED APP WRAPS THE SAME FILESYSTEM ENGINE OR ADDED A REAL DATABASE, AND WHETHER THE THREE-DEPENDENCY AND NO-DATABASE CLAIMS STILL HOLD]',
    architecture: {
      nodes: [
        {
          id: 'resolver',
          label: 'Resolver',
          tech: '12 regex patterns, 3 user-agent identities',
          purpose: 'Turns a page URL, a brand name or a bare domain into a Facebook page ID.',
          rationale:
            'Pattern redundancy plus a link-preview user agent finds a page ID even behind Facebook’s login wall, which a single well-behaved request cannot.',
          failureMode:
            'This is the fragile end of the tool, deliberately. Twelve patterns exist because any one of them can stop matching when Facebook changes its markup — resolution is what breaks first, and it breaks loudly rather than returning a wrong page.',
        },
        {
          id: 'fetcher',
          label: 'Fetcher',
          tech: 'Ad Library API v21',
          purpose: 'Pages through every live ad for a resolved page.',
          rationale:
            'Pagination with backoff, and EU data caveats flagged rather than treated as failures — a partial result with a caveat is more useful than an error.',
        },
        {
          id: 'analyser',
          label: 'Analyser',
          tech: 'Rule-based clustering',
          purpose: 'Folds near-duplicates, then classifies hooks, offers and unclaimed angles.',
          rationale:
            'Jaccard folding at 0.9 similarity, 11 hook types, a 9-offer matrix and a 10-angle gap map. At a few hundred ads this is set theory, not a machine learning problem.',
        },
        {
          id: 'reports',
          label: 'Reports',
          tech: 'Single-file dashboard + PDFKit',
          purpose: 'Emits Markdown, CSV, JSON and PDF per run into a timestamped folder.',
          rationale:
            'Timestamped folders are the datastore. Each run is a self-contained deliverable a client can be handed without exporting anything.',
        },
      ],
      edges: [
        { from: 'resolver', to: 'fetcher', label: 'Page ID' },
        { from: 'fetcher', to: 'analyser', label: 'Ad creative' },
        { from: 'analyser', to: 'reports', label: 'Clusters + gaps' },
      ],
    },
    implementation:
      'Resolution runs twelve patterns across three user-agent identities, because Facebook shows a link-preview crawler things it will not show a browser without a session — that is the difference between the tool working on a bare domain and asking the user to go and find a page ID. The fetcher pages through Ad Library API v21 with backoff, and treats EU DSA data caveats as annotations on the result rather than errors. Analysis is entirely rule-based: near-duplicates are folded at 0.9 Jaccard similarity before anything is counted, then creative is classified into 11 hook types and a 9-offer matrix, and the interesting output falls out of the negative space — a 10-angle gap map naming the emotional angles nobody in a market has claimed. Every run writes a timestamped folder containing a single-file dashboard, Markdown, CSV, JSON and a PDF, which means there is no database and no export step. Token redaction is applied on every error path, because the fastest way to leak an API token is a stack trace nobody expected to see.',
    challenges: [
      'Facebook page-ID resolution behind login walls, where a plain request returns nothing useful',
      'Near-duplicate ads polluting the clusters, making a single creative look like a campaign trend',
      'Keeping the API token out of every error path, including the ones that only fire when something else has already gone wrong',
    ],
    solution:
      'Resolution was solved with a user-agent strategy and pattern redundancy rather than a headless browser — twelve patterns and three identities, so no single markup change takes the tool down. Duplicate pollution was solved by folding at 0.9 Jaccard similarity before classification, so clusters count distinct creative rather than repeats. Token leakage was solved by treating redaction as a discipline applied at the logging boundary, not a filter added to individual handlers.',
    metrics: [
      {
        label: 'Real analysis runs',
        after: '23 across 6 verticals',
        source: 'self-measured',
        capturedAt: '2026-08-01',
      },
      {
        label: 'Ads analysed',
        after: '361',
        source: 'self-measured',
        capturedAt: '2026-08-01',
      },
      {
        label: 'Runtime dependencies',
        after: '3',
        source: 'self-measured',
        capturedAt: '2026-08-01',
        note: 'No framework, no database.',
      },
    ],
    reflection:
      'Choosing not to use an LLM was the engineering decision here. At this scale deterministic rules beat a model on cost, speed and auditability, and being able to explain why an ad landed in a cluster is worth more to the person reading the report than a better-sounding summary. An optional LLM layer on top of the clusters is the obvious v2 — on top, not instead of.',
    outcome:
      'Twenty-three real analysis runs across six verticals, 361 ads analysed, and gap maps that name the emotional angles nobody in a market has claimed — produced at zero analysis cost by a tool that installs with three dependencies.',

    decisions: ['rule-based-over-llm', 'filesystem-runs-over-database'],
    incidents: [],

    featured: true,
    order: 3,
  },

  {
    slug: 'studio',
    title: 'Mirasphere Studio',
    tagline:
      'Script in, finished voiceover video out — including a lip-synced presenter built from one still photo.',

    category: 'ai',
    status: 'live',
    tier: 'flagship',

    role: 'Sole developer, end to end — an in-house product at Mirasphere Digital',
    year: 2026,
    employer: 'Mirasphere Digital',
    clientIndustry: 'digital agency',
    clientDescriptor: 'Mirasphere Digital, as its own product rather than for a client',
    repo: 'https://github.com/devdk/Voiceover-Video-Generator',

    stack: [
      {
        name: 'Next.js',
        category: 'framework',
        why: 'The authoring surface is a wizard over structured beats, and the live preview has to cost nothing — no API calls until a render is actually requested. Server rendering plus local state gets that for free.',
      },
      {
        name: 'TypeScript',
        category: 'language',
        why: 'A render is a chain of paid third-party calls whose outputs feed each other. Types on the shape of each checkpoint are what stop a malformed intermediate result becoming a re-billed step.',
      },
      {
        name: 'Remotion',
        category: 'tooling',
        why: 'Video as React components means the timeline can be driven by data — real word-level timestamps — rather than hand-placed in an editor. Four compositions produce six output styles because of it.',
      },
      {
        name: 'ElevenLabs',
        category: 'ai',
        why: 'Narration in a cloned voice, and Scribe for speech-to-text on the audio it just produced. Getting both from one vendor kept the timing round-trip short.',
      },
      {
        name: 'Kling',
        category: 'ai',
        why: 'Image-to-video is what turns a single still photo into a presenter. It is also the slowest and most expensive step in the chain, which is why it checkpoints.',
      },
      {
        name: 'ffmpeg',
        category: 'tooling',
        why: 'Ping-pong looping a short presenter clip to narration length, and general muxing. The alternative is paying an API for footage that ffmpeg can synthesise from what already exists.',
      },
      {
        name: 'Prisma',
        category: 'tooling',
        why: 'The job queue is database-polled, and each paid step writes a checkpoint row. That table is the entire reliability story — retries read it to know what has already been paid for.',
      },
    ],

    context:
      'A short marketing video normally needs an editor, a voice artist and days of turnaround, which puts it out of reach for exactly the work that needs it most — many small variations rather than one polished film.',
    problem:
      'Make video production a form submission: script in, finished voiceover video out — including a lip-synced AI presenter.',
    constraints: [
      'Third-party AI APIs bill per call — retries must never re-bill a completed step',
      'Captions and scene changes must land on the narration to the word',
      'Local-first: no S3, no Redis, no render farm',
    ],
    approach:
      'An orchestration pipeline where every paid step — text-to-speech, speech-to-text, image-to-video, lip-sync — checkpoints its output, and Remotion’s timeline is driven by real word-level timestamps taken from the narration rather than estimated from a words-per-minute figure. The pipeline assumes third-party APIs will be slow and flaky, and is built so that being slow and flaky costs nothing.',
    architecture: {
      nodes: [
        {
          id: 'beats-editor',
          label: 'Beats editor',
          tech: 'Next.js wizard',
          purpose: 'Turns a script into structured beats with a live preview.',
          rationale:
            'Structured beats are what the timeline consumes later, and previewing them costs no API calls — so iteration on the script is free.',
        },
        {
          id: 'voice',
          label: 'Voice',
          tech: 'ElevenLabs TTS + cloned voice',
          purpose: 'Generates the narration audio.',
          rationale:
            'A cloned voice makes the output personal rather than generic, and narration is the asset everything else in the timeline is measured against.',
        },
        {
          id: 'timing',
          label: 'Timing',
          tech: 'ElevenLabs Scribe STT',
          purpose: 'Extracts word-level timestamps from the narration that was just generated.',
          rationale:
            'Transcribing your own synthesised audio sounds redundant until you need to know exactly when each word starts. Estimation cannot give you that.',
        },
        {
          id: 'presenter',
          label: 'Presenter',
          tech: 'Kling image-to-video + Latent Sync',
          purpose: 'Turns a still photo into a lip-synced presenter, looped to narration length.',
          rationale:
            'ffmpeg ping-pong loops extend a short generated clip to the length the narration needs, instead of paying to generate more footage.',
          failureMode:
            'This is the step that dominates wall-clock — the presenter render polls for roughly an hour — so it is where a job is most likely to be interrupted, and it is the most expensive thing to lose. The checkpoint is what makes that survivable rather than a re-bill.',
        },
        {
          id: 'render',
          label: 'Render',
          tech: 'Remotion CLI worker',
          purpose: 'Composes the final video from beats, audio and presenter footage.',
          rationale:
            'Audio-driven durations with largest-remainder rounding, so proportional scaling of beat lengths never loses or duplicates a frame.',
        },
        {
          id: 'jobs',
          label: 'Jobs',
          tech: 'Prisma + database-polled queue',
          purpose: 'Sequences the pipeline and records a checkpoint per completed step.',
          rationale:
            'A polled table is the simplest queue that satisfies "no Redis", and checkpoints mean a retry resumes instead of restarting.',
        },
      ],
      edges: [
        { from: 'beats-editor', to: 'voice', label: 'Beats' },
        { from: 'voice', to: 'timing', label: 'Narration audio' },
        { from: 'timing', to: 'presenter', label: 'Word timestamps' },
        { from: 'presenter', to: 'render', label: 'Presenter footage' },
        { from: 'render', to: 'jobs', label: 'Checkpoints' },
      ],
    },
    implementation:
      'The wizard captures a script as structured beats and previews them without touching an API, so writing is free and only rendering costs money. A render then walks a fixed chain: ElevenLabs generates narration in a cloned voice, Scribe transcribes that same audio back to word-level timestamps, Kling turns a still photo into presenter footage, Latent Sync applies lip-sync, and ffmpeg ping-pong loops the clip to narration length. Remotion composes the result from four compositions that produce six output styles, with beat durations scaled proportionally against the real audio length and largest-remainder rounding so the frame count always reconciles. Every one of those steps writes a checkpoint row through Prisma before the next begins, which is the difference between a flaky vendor costing a retry and costing the whole video — the presenter step alone polls for around an hour. The whole thing is local-first: no S3, no Redis, no render farm, and the Claude-powered convenience features self-disable when no key is present rather than failing the pipeline.',
    challenges: [
      'Third-party render polling dominates wall-clock — the presenter step takes around an hour, and anything that interrupted it lost the money as well as the time',
      'Audio duration and the visual timeline disagreed, so captions and scene cuts drifted off the narration',
      'The lip-sync API required publicly reachable URLs, and the constraint was no object storage',
    ],
    solution:
      'The long-poll problem was solved by checkpointing every paid step, so a retry resumes from the last completed one and a failure costs nothing extra. The timeline mismatch was solved by driving durations from the audio: proportional scaling of beat lengths with largest-remainder rounding, so the frame counts reconcile exactly and captions land on the word. The public-URL requirement was solved without buying storage, keeping the local-first constraint intact.',
    metrics: [
      {
        label: 'Wall-clock for a branded 30-second video',
        after: '~8 minutes',
        source: 'self-measured',
        capturedAt: '2026-08-01',
      },
      {
        label: 'Output styles from 4 Remotion compositions',
        after: '6',
        source: 'self-measured',
        capturedAt: '2026-08-01',
      },
      {
        label: 'TypeScript in the pipeline',
        after: '~5,300 lines',
        source: 'self-measured',
        capturedAt: '2026-08-01',
      },
    ],
    reflection:
      'Checkpoint-everything was the best call in the codebase — it turned a chain of flaky, per-call-billed third-party APIs into a pipeline that can be retried without thinking about it. The next moves are structural rather than clever: renders belong on a queue-fed worker box rather than the app host, and the 9:16 remix flow is the output people ask for most.',
    outcome:
      'It works end to end: a script becomes a branded 30-second video in around eight minutes, including cloned-voice presenter videos built from a single still photo, with the core path consuming zero LLM credits.',

    decisions: ['real-stt-timestamps', 'checkpoint-every-paid-step'],
    incidents: [],

    featured: false,
    order: 4,
  },

  /* ========================================================================
     SUPPORTING — client storefronts.

     These are one-screen pages, not case studies. They exist because the
     range is the argument: the four projects above are systems, and these
     are the other end of the same working life. A portfolio that shows only
     the hard end is a portfolio that looks curated.

     Every one of these is named with permission — Dheeraj worked with each
     client directly, no agency in between.
     ======================================================================== */

  {
    slug: 'chefs-and-homes',
    title: 'Chefs and Homes',
    tagline: 'A Malta retailer with physical shops, taking its first step into selling direct.',

    category: 'shopify',
    status: 'live',
    tier: 'supporting',

    role: 'Consultant on approach and design, then developer alongside the client’s in-house team',
    year: 2026,
    employer: 'Mirasphere Digital',
    clientIndustry: 'kitchenware and homeware retail',
    client: 'RECC, Malta',
    url: 'https://chefsandhomes.com/',

    stack: [
      {
        name: 'Shopify',
        category: 'commerce',
        why: 'A retailer whose entire trading history is across a counter should not inherit a server on day one of selling online. Hosted means no patching, no deploys and no hosting bill to explain to a team that has never had one.',
      },
      {
        name: 'Liquid',
        category: 'cms',
        why: 'Sections written as Liquid with schema-declared settings, so the team can change copy, imagery and section order from the theme editor. The alternative is a store that needs a developer every time a product line changes — which for a business still deciding what it sells online would have been the wrong shape entirely.',
      },
    ],

    context:
      'RECC is an established Malta retailer with malls and shops across the island. Chefs and Homes is the same business stepping into direct-to-consumer for the first time, starting deliberately small: kitchen and tableware products chosen to introduce the brand to customers who currently only meet it in person.',
    problem:
      'Give a business that has only ever sold face to face a first online storefront — and leave it in a state its own team can run, extend and load products into without external help.',
    approach:
      'Consultancy before code. The first work was with their development team on the shape of the thing: what the store needed to be, how to structure it, and what to deliberately leave out of a first version. Only then the build, done end to end with their team rather than delivered over the wall to them.',

    outcome:
      'The store is live and the client’s team is loading listings into it themselves, which was the actual point — the handover is the deliverable, not the launch.',

    decisions: [],
    incidents: [],

    featured: false,
    order: 5,
  },

  {
    slug: 'zyvren',
    title: 'Zyvren',
    tagline: 'A US clothing store whose product page was quietly spending its ad budget on bounces.',

    category: 'shopify',
    status: 'live',
    tier: 'supporting',

    role: 'Developer, then performance and technical SEO',
    year: 2026,
    employer: 'Mirasphere Digital',
    clientIndustry: 'clothing and accessories',
    client: 'Zyvren',
    url: 'https://zyvren.com/',

    stack: [
      {
        name: 'Shopify',
        category: 'commerce',
        why: 'A clothing brand selling into the US from outside it needs multi-currency, international shipping and a checkout that people already trust, on day one. That is a solved problem worth not re-solving.',
      },
      {
        name: 'Liquid',
        category: 'cms',
        why: 'The performance problem lived in a single product template, and fixing it meant editing the template rather than installing something. Custom Liquid is what made the page fixable at all — an app-shaped fix would have added weight to a page that was already too heavy.',
      },
    ],

    context:
      'A US-focused clothing and accessories brand, trading internationally with multi-currency pricing and paid traffic as its main acquisition channel.',
    problem:
      'The store launched and the ads went live, and the bounce rate came back high enough to be an expense rather than a metric. Paid traffic was arriving and leaving, which is the worst combination available: you are paying full price for people who never see the product.',
    approach:
      'Work backwards from the bounce rather than guessing at the funnel. Isolating it by page put the problem on the featured single-product template — the exact page every ad pointed at. Lighthouse put the largest contentful paint on that template somewhere between twelve and sixteen seconds, which is long past the point where a visitor concludes the site is broken. The fix was in the template’s custom Liquid, guided by what Lighthouse said was blocking the render rather than by a general tidy-up.',

    outcome:
      'The product template was rebuilt and the page now renders in a fraction of the time it did. The client is running paid traffic against it and trading normally.',

    decisions: [],
    incidents: [],

    featured: false,
    order: 6,
  },

  {
    slug: 'women-wellness-first',
    title: 'Women Wellness First',
    tagline: 'A first storefront for a women’s health brand, rebuilt section by section to a strict spec.',

    category: 'shopify',
    status: 'live',
    tier: 'supporting',

    role: 'Shopify developer — theme architecture and Liquid build, working to the client’s in-house design team',
    year: 2025,
    employer: 'Mirasphere Digital',
    clientIndustry: 'women\'s health',
    client: 'Women Wellness First',
    url: 'https://womenwellnessfirst.com/',

    stack: [
      {
        name: 'Shopify',
        category: 'commerce',
        why: 'A first storefront for a brand-new business. The interesting problems here were design fidelity and editability, not infrastructure, so infrastructure was the thing to stop thinking about.',
      },
      {
        name: 'Liquid',
        category: 'cms',
        why: 'Every section was written from scratch in Liquid with its settings declared in schema, which is what let a strict design specification survive being handed to a non-technical team: they can edit the content of a section without being able to break its design.',
      },
      {
        name: 'Free Shopify theme',
        category: 'cms',
        why: 'Deliberately not a premium theme. A paid theme brings a set of design opinions you then spend the project fighting, and this project had a client design team with firm views on type and layout. Starting from a plain base and building each section to the spec was less work than overriding someone else’s.',
      },
    ],

    context:
      'A Gurugram-based women’s health brand with an in-house design team, no website, and firm rules about type, spacing and visual identity. This was the first site the business had ever had. [CONFIRM WHAT THE STORE SOLD AT LAUNCH — THE SINGLE PRODUCT, OR THE COURSE CATALOGUE THAT IS LIVE NOW]',
    problem:
      'Build a first storefront that matched an exacting design specification, and hand it over in a state where the client’s own team could keep running it — without either of those two goals eating the other.',
    approach:
      'A free theme as a plain base, then every section rebuilt in Liquid with its own schema. Several rounds of iteration with their design team on the way, because design fidelity is not something you achieve once and hold — it is what the iterations are for. The schema work is what makes the result survive: each element is exposed as a setting in the theme editor, so the team can change what a section says without being able to change what it looks like.',

    outcome:
      'The brand’s first website went live and is edited by the client’s own team from the theme editor.',

    decisions: [],
    incidents: [],

    featured: false,
    order: 7,
  },
  {
    slug: 'allure-dental',
    title: 'Allure Dental Care',
    tagline: 'A Barnet dental and facial-aesthetics practice, rebuilt and then made findable.',

    category: 'wordpress',
    status: 'live',
    tier: 'supporting',

    role: 'Developer, then the performance, schema and local-search work after launch',
    year: 2025,
    clientIndustry: 'dentistry',
    client: 'Allure Dental Care',
    url: 'https://alluredentalcare.co.uk/',

    stack: [
      {
        name: 'WordPress',
        category: 'cms',
        why: 'A practice that adds a treatment every few months needs to add a page every few months. The people doing that are dentists and receptionists, not developers, so the editing surface was the requirement rather than an afterthought.',
      },
      {
        name: 'Technical SEO',
        category: 'tooling',
        why: 'A dental practice competes inside about three miles. That makes the work local search rather than content marketing: structured data so the treatments are machine-readable, a Google Business Profile that matches the site, and a page that loads before a visitor on mobile data gives up. A beautiful site nobody finds is a brochure.',
      },
    ],

    context:
      'An established dental and facial-aesthetics practice in Barnet, north London, offering general dentistry, orthodontics and implants alongside a growing aesthetics list — anti-wrinkle treatments, fillers, HydraFacial, microneedling. They already had a website.',
    problem:
      'The site they had was not doing the two jobs a practice website has: convincing someone who lands on it, and being found by someone searching three miles away. Replacing it was only half the work — the other half was the part that has nothing to do with how the site looks.',
    approach:
      'Rebuild first, then everything that makes the rebuild worth having: structured data so search engines can read the treatments as treatments, a Google Business Profile aligned with the site so the local pack and the pages agree with each other, and speed work on the pages that actually receive traffic. [CONFIRM THE PAGE BUILDER — YOU SAID DIVI, THE LIVE SITE REPORTS ELEMENTOR 4.2.3]',

    outcome:
      'The practice runs on it, adds its own treatment pages, and is set up to be found locally rather than only to be looked at once someone arrives.',

    decisions: [],
    incidents: [],

    featured: false,
    order: 8,
  },

  {
    slug: 'mariforce',
    title: 'Mariforce Crewing',
    tagline: 'Offshore crew recruitment, where every CV lands in the system the team already works in.',

    category: 'wordpress',
    status: 'live',
    tier: 'supporting',

    role: 'Sole developer, end to end — at Mirasphere Digital, for an agency client',
    year: 2025,
    employer: 'Mirasphere Digital',
    clientIndustry: 'offshore and maritime recruitment',
    client: 'Mariforce Crewing',
    url: 'https://mariforce.com/',

    stack: [
      {
        name: 'WordPress',
        category: 'cms',
        why: 'Roles open and close constantly in offshore crewing. The vacancy list had to be the client’s to edit, daily, without a developer in the loop — which is a content problem, not an engineering one.',
      },
      {
        name: 'Elementor',
        category: 'cms',
        why: 'The site has to speak to two audiences that want opposite things — operators looking for crew, and crew looking for a berth. Building the page layouts visually made it fast to iterate on that split rather than committing to one structure early.',
      },
    ],

    context:
      'Mariforce Crewing recruits for the offshore energy and maritime sector — ROV and trenching crews, cables and pipelines, subsea operations, oil and gas, offshore renewables. The roles run from deck hands and stewards to geotechnical surveyors, ROV operators and party chiefs.',
    problem:
      'A recruitment website’s real output is not visits, it is candidates who reach the recruiter in a usable form. A CV arriving as an email attachment is a candidate the team has to re-type into whatever system they actually work in — which is where applications get lost.',
    approach:
      'Build the site so that submitting a CV puts the candidate directly into the platform the recruitment team already uses, rather than into an inbox. The site is the front door; the applicant tracking system is where the work happens, and the handoff between them is the part worth engineering. [CONFIRM THE ATS — I HEARD ZOHO RECRUIT, AND THE LIVE FORM READS AS A PLAIN UPLOAD, SO SAY WHICH PLATFORM AND WHETHER THE INTEGRATION IS LIVE]',

    outcome:
      'Candidates reach the team as records they can act on rather than as attachments someone has to process by hand.',

    decisions: [],
    incidents: [],

    featured: false,
    order: 9,
  },

  {
    slug: 'swann-bookkeeping',
    /* Titled to distinguish the PROJECT from the CLIENT. Both were called
       "Swann Bookkeeping & Accountancy", which the graph exposed the moment it
       reported the repeat client: "2 projects: CH Scrapper, Swann Bookkeeping
       & Accountancy" reads as if the firm itself were a deliverable. */
    title: 'Swann Bookkeeping — Website',
    tagline: 'A London accountancy firm’s services, made legible to the businesses that need them.',

    category: 'wordpress',
    status: 'live',
    tier: 'supporting',

    role: 'Sole developer, end to end — at Mirasphere Digital, for an agency client',
    year: 2025,
    employer: 'Mirasphere Digital',
    clientIndustry: 'accountancy',
    client: 'Swann Bookkeeping & Accountancy',
    url: 'https://swann-bookkeeping.com/',

    stack: [
      {
        name: 'WordPress',
        category: 'cms',
        why: 'A firm whose service list tracks HMRC obligations needs to edit that list without booking developer time. The obligations change; the site has to keep up on its own.',
      },
      {
        name: 'Elementor',
        category: 'cms',
        why: 'Six services that each need their own explanation, all sharing one layout. A visual builder makes that a template applied six times rather than six pages maintained separately.',
      },
      {
        name: 'Slider Revolution',
        category: 'tooling',
        why: 'The client wanted motion in the hero and the testimonial carousel. Using the tool the WordPress ecosystem has already solved this with cost less than hand-rolling it, and left something the client can adjust themselves.',
      },
    ],

    context:
      'Swann is a London bookkeeping and accountancy firm serving sole traders, limited companies and charities — bookkeeping, self-assessment, payroll, CIS and PAYE, VAT registration, corporation tax and tax planning. They positioned themselves as their clients’ behind-the-scenes finance team, and they already had a site.',
    problem:
      'Accountancy services are hard to tell apart from the outside. A small business owner cannot easily work out which of seven overlapping services they need, and a site that lists them without explaining them loses the enquiry to whoever explains it better.',
    approach:
      'Rebuild around the services as the spine of the site: each one given its own explanation rather than a line in a list, a four-step process section so a prospective client can see what working together actually looks like, and testimonials in the path rather than parked on a separate page.',

    outcome:
      'The firm’s services are legible to a non-accountant, and the enquiry path from a service page to a booked consultation is one click.',

    decisions: [],
    incidents: [],

    featured: false,
    order: 10,
  },

  {
    slug: 'mirasphere-site',
    /* Same collision the graph exposed for Swann: the PROJECT and the
       EMPLOYER were both called "Mirasphere Digital", so the map drew two
       differently-coloured nodes with identical names sitting next to each
       other. The employer is Mirasphere Digital; this is their site. */
    title: 'Mirasphere Digital — Agency Site',
    tagline: 'The agency’s own site — the one where the work has to argue for itself.',

    category: 'wordpress',
    status: 'live',
    tier: 'supporting',

    role: 'Developer and technical SEO — the agency’s own site, built in-house',
    year: 2025,
    employer: 'Mirasphere Digital',
    clientIndustry: 'digital agency',
    clientDescriptor: 'Mirasphere Digital, as the agency’s own site rather than a client project',
    url: 'https://mirasphere.digital/',

    stack: [
      {
        name: 'WordPress',
        category: 'cms',
        why: 'An agency edits its own site constantly — new services, new client logos, new offers. There is a theme underneath, but almost everything on the page is built in Elementor, because the people changing it are marketers.',
      },
      {
        name: 'Elementor',
        category: 'cms',
        why: 'Six service pages, each needing its own interactive treatment. Building them visually is what made per-page interaction affordable rather than a bespoke build six times over.',
      },
      {
        name: 'Technical SEO',
        category: 'tooling',
        why: 'An agency that sells SEO is judged on its own. That makes the site’s own technical health part of the product rather than housekeeping — which is a useful kind of pressure.',
      },
    ],

    context:
      'Mirasphere Digital is the agency I have worked at since April 2025, running social, PPC, SEO, email, web and influencer work out of London and Gurugram. This is their own website.',
    problem:
      'An agency site is the one build where the audience is professionally sceptical. It has to demonstrate the services rather than describe them — and an agency selling search cannot afford a site that underperforms on search.',
    approach:
      'Interaction per service rather than a shared template: each service page carries a before-and-after comparison that shows the difference the work makes, which is a demonstration rather than a claim. Then the technical SEO on the site itself, on the principle that an agency’s own site is the first sample of its work anyone sees.',

    outcome:
      'It is the agency’s live site, carrying their services, their client roster and their free-audit offer as the conversion path.',

    decisions: [],
    incidents: [],

    featured: false,
    order: 11,
  },
]
