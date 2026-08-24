import type { Decision, Incident, Principle } from '@/lib/schema'

/* ==========================================================================
   /thinking — THE DIFFERENTIATOR

   Almost every developer portfolio has projects, skills and a contact form.
   Almost none has a decision log or a failure archive. These two sections
   are worth more than every animation on the site combined, because they
   are the only content a senior engineer cannot fake.

   Everything below is mined out of the four case studies in
   content/projects.ts, plus two decisions about this site itself. Nothing
   here is written to fill a slot — where a real incident has no measured
   before-and-after, the `result` field is absent rather than estimated.

   Tone (spec §18): confident and honest. Not self-deprecating.
   ========================================================================== */

export const decisions: Decision[] = [
  /* ---- FFS Manager — Practice CRM --------------------------------------- */
  {
    id: 'postgres-prisma-over-mongodb',
    question: 'Why PostgreSQL and Prisma, and not MongoDB?',
    context:
      'The CRM replaces Fordham Finance Group’s entire practice software. Its data is compliance data: clients link to obligations, obligations to statutory deadlines, deadlines to documents and signatures, and all of it to billing. MongoDB was the familiar option — it is the M in the MERN stack I had shipped product work on — so this was a real choice rather than a default.',
    options: [
      {
        name: 'MongoDB',
        pros: [
          'Familiar from previous MERN product work, so no ramp-up cost',
          'Schemaless iteration is fast in the first weeks, which matters when the deadline is eight weeks',
        ],
        cons: [
          'The relationships are the domain here — a client’s obligations, deadlines, documents and signatures are the product, not a detail',
          'Referential integrity would have to be enforced in application code, in a system where a broken link means a missed filing deadline',
        ],
      },
      {
        name: 'PostgreSQL with Prisma',
        pros: [
          'Relational integrity for data whose whole value is its relationships',
          '55 models and 28 enums can be described precisely, and the UI can trust the queries',
          'Schema changes become explicit, reviewable migrations rather than a deploy-time surprise',
        ],
        cons: [
          'Slower schema iteration than schemaless, on a project with an eight-week runway',
          'Migrations become a discipline you cannot skip once real client data is in the database',
        ],
      },
    ],
    chose: 'PostgreSQL with Prisma',
    because:
      'Compliance data is deeply relational. The questions the firm asks — which clients have a VAT return due in the next fortnight, which of those are missing a signed engagement letter — are joins. Modelling them as documents would have meant reimplementing joins in application code, in the part of the system where being wrong is a missed statutory deadline.',
    tradeoff:
      'Schema iteration got slower, and migrations became a discipline rather than an afterthought. Every change had to be additive because production held live client data from week one, which rules out the fast, destructive reshaping that schemaless work allows.',
    outcome:
      '26 additive migrations against production with zero data loss, and queries the UI can trust without defensive checks.',
    wouldRepeat: 'yes',
    projects: ['crm'],
  },

  {
    id: 'e-signatures-in-house',
    question: 'Why build e-signatures in-house rather than integrating DocuSign?',
    context:
      'The CRM needed DocuSign-class signing: sequential and parallel signers, PDF stamping, and an audit trail that would stand up if a client ever disputed a signature. The obvious answer is to integrate a signing provider, and for most projects it is the right one.',
    options: [
      {
        name: 'DocuSign or SignRequest API',
        pros: [
          'Signing is a solved problem with a mature legal and audit story behind it',
          'Days of integration instead of weeks of building',
        ],
        cons: [
          'Per-envelope pricing scales with the firm’s activity, which is exactly the cost model the project existed to escape',
          'Signature state lives in someone else’s system, so client records and signing history are always one API call apart',
        ],
      },
      {
        name: 'Build the signing flow in the CRM',
        pros: [
          'Zero marginal cost per envelope, forever',
          'Signatures are rows next to the client and document they belong to, so the audit trail is a join rather than an integration',
        ],
        cons: [
          'Roughly two weeks of build: signer ordering, PDF stamping, audit events',
          'The legal and audit correctness of the flow is now mine to defend rather than a vendor’s',
        ],
      },
    ],
    chose: 'Build the signing flow in the CRM',
    because:
      'The entire project was a response to a £500-per-user-per-year subscription. Replacing it with a system that bills per envelope would have moved the cost rather than removed it — and signing is one of the highest-volume things an accounting practice does.',
    tradeoff:
      'Roughly two weeks that could have gone into other modules, and permanent ownership of a flow where correctness is a legal question and not just a technical one. If this were a product sold to many firms rather than one, I would want an external provider’s audit story behind it.',
    outcome:
      'Signature flows at zero marginal cost, fully integrated with the client records they belong to, with an append-only audit trail in the same database as everything else.',
    wouldRepeat: 'qualified',
    projects: ['crm'],
  },

  {
    id: 'vps-over-managed-paas',
    question: 'Why a VPS with PM2, and not a managed platform like Vercel or Railway?',
    context:
      'The CRM needs an API, twelve background workers, PostgreSQL, Redis and file storage. On a managed platform that is four or five billable services; on a VPS it is one machine. The firm is one accounting practice, not a scaling startup, so the load profile was known and modest from the start.',
    options: [
      {
        name: 'Managed PaaS (Vercel, Railway, Fly)',
        pros: [
          'No ops: backups, TLS, restarts and scaling are someone else’s job',
          'Deploys and rollbacks are a git push',
        ],
        cons: [
          'Postgres, Redis, workers and file storage become four or five separate billed services',
          'Cost becomes a function of usage, which is hard to quote to a client replacing a fixed subscription',
        ],
      },
      {
        name: 'Single VPS with a PM2 cluster behind Nginx',
        pros: [
          'Everything on one box means one predictable monthly figure',
          'Full control over the file storage and worker topology, and a one-command deploy',
        ],
        cons: [
          'Backups, recovery drills and TLS renewal are mine to own and mine to get wrong',
          'A single machine is a single failure domain',
        ],
      },
    ],
    chose: 'Single VPS with a PM2 cluster behind Nginx',
    because:
      'The whole system is one person’s to reason about and one firm’s to use. Putting Postgres, Redis, file storage and workers on one machine turned hosting into a fixed monthly number I could state honestly to the client, which is the thing a firm leaving a per-seat subscription actually cares about.',
    tradeoff:
      'I own the operations. That means encrypted nightly backups, a documented recovery path, and TLS that renews — and it means a hardware failure is my problem at whatever hour it happens. On a system with unpredictable traffic or a team that rotates, I would pay the platform instead.',
    outcome:
      'Encrypted nightly backups, a documented four-layer recovery path, a one-command deploy, and uptime that has been boring.',
    wouldRepeat: 'qualified',
    projects: ['crm'],
  },

  /* ---- CH Scrapper — Lead Engine ---------------------------------------- */
  {
    id: 'bulk-csv-over-streaming-api',
    question:
      'Why the 2.9GB bulk register and REST verification, and not the Companies House Streaming API?',
    context:
      'The lead engine has to find UK companies whose accounts are due. Companies House offers a Streaming API — the modern, event-driven, obviously-correct-looking option — and a monthly bulk CSV of the whole register, around five million rows and 2.9GB. Reaching for the streaming API first was the instinct.',
    options: [
      {
        name: 'Streaming API',
        pros: [
          'Real-time, so the data is never stale',
          'Event-driven and cheap to keep running once connected',
        ],
        cons: [
          'It answers "what changed", and the business question is "who is due" — a company sitting quietly with an overdue filing generates no event',
          'Building a full-register picture from a change feed means waiting for the register to describe itself, which could take months',
        ],
      },
      {
        name: 'Monthly bulk CSV, with live REST verification before contact',
        pros: [
          'Whole-register coverage on day one, with no API calls at all',
          'The expensive API budget gets spent only on the few hundred candidates that survive filtering',
        ],
        cons: [
          'The snapshot is up to a month stale, so a "due" flag cannot be trusted',
          'Processing 2.9GB and five million rows needs chunked ingest and somewhere to put it',
        ],
      },
    ],
    chose: 'Monthly bulk CSV, with live REST verification before contact',
    because:
      'The shape of the question decided it. "Who is due" is a scan across every company, not a subscription to changes. The bulk file answers it for free, and the REST API — which does have a per-company profile endpoint — is the right tool for confirming the handful that matter rather than discovering them.',
    tradeoff:
      'Monthly staleness, which is a real defect and had to be handled rather than accepted: nothing downstream may treat the bulk flag as truth, so every candidate is verified live before anyone contacts it. That is an extra stage, a cache, and a rate limiter that would not exist otherwise.',
    outcome:
      'Whole-register coverage on a fraction of the API budget, with staleness contained at the verification stage where it is visible.',
    wouldRepeat: 'yes',
    projects: ['leadhouse'],
  },

  {
    id: 'half-the-rate-ceiling',
    question: 'Why run the verifier at half the published rate limit instead of maxing it out?',
    context:
      'Companies House publishes a rate limit of 600 requests per five minutes. Verification is the slow stage of the pipeline, so the tempting move is to sit as close to the ceiling as the limiter allows and get runs finished faster.',
    options: [
      {
        name: 'Run near the published ceiling',
        pros: [
          'Verification runs finish materially faster',
          'The published limit is the contract, and staying inside it is technically compliant',
        ],
        cons: [
          'No headroom for retries — a burst of 429s or 5xx responses pushes you over exactly when you can least afford it',
          'A ban on a free public API run by a regulator would end the project, and there is no appeal process worth relying on',
        ],
      },
      {
        name: 'Run at half the ceiling',
        pros: [
          'Retries, backoff and any other consumer of the same key all fit in the remaining headroom',
          'The failure mode becomes "slower than ideal" rather than "locked out"',
        ],
        cons: ['Verification runs take roughly twice as long as they could'],
      },
    ],
    chose: 'Run at half the ceiling',
    because:
      'The asymmetry is not close. Being twice as slow costs minutes; being banned from the register costs the entire product, on a data source with no commercial alternative that is not also a per-lead bill.',
    tradeoff:
      'Verification is deliberately the slow stage of the pipeline, and it is the stage users wait on. That is paid for by keeping the free bulk scan fast, so the slow part only ever touches candidates that already passed filtering.',
    outcome:
      'Zero rate-limit incidents across 22 production scrape jobs, with an eight-step backoff honouring Retry-After for the failures that still happen.',
    wouldRepeat: 'yes',
    projects: ['leadhouse'],
  },

  {
    id: 'python-over-node-for-bulk-data',
    question: 'Why Python and FastAPI for this, when Node is the main stack?',
    context:
      'Everything else in this portfolio of systems is TypeScript on Node. Introducing a second language means a second toolchain, a second deployment story and a second set of habits to keep sharp — so it needed to earn its place.',
    options: [
      {
        name: 'Node.js and TypeScript',
        pros: [
          'One language across every system I maintain, so no context switch',
          'Shared deployment, tooling and type conventions with the CRM',
        ],
        cons: [
          'Chunked processing of a 2.9GB, five-million-row CSV means hand-rolling what pandas already does well',
          'The streaming and dataframe ergonomics are simply worse for this specific job',
        ],
      },
      {
        name: 'Python with pandas and FastAPI',
        pros: [
          'pandas handles chunked ingest of the full register on a modest VPS without a memory ceiling',
          'FastAPI keeps the dashboard API thin and typed, sitting next to the code doing the real work',
        ],
        cons: [
          'A second language, toolchain and deployment path to maintain',
          'No code sharing with the TypeScript systems',
        ],
      },
    ],
    chose: 'Python with pandas and FastAPI',
    because:
      'The hard part of this system is a 2.9GB CSV, and pandas is the right tool for a 2.9GB CSV. Choosing the stack to match the portfolio rather than the problem would have meant rebuilding chunked dataframe processing badly, in order to keep a consistency that nobody benefits from.',
    tradeoff:
      'A second language to keep current, and no shared code with the TypeScript systems. The mitigation is that the boundary is clean — Python owns data processing, and the only thing crossing it is JSON over HTTP.',
    outcome:
      '25,000-row chunked ingest that a single modest VPS handles comfortably, over the whole register.',
    wouldRepeat: 'yes',
    projects: ['leadhouse'],
  },

  /* ---- Competitive Ads Extractor ---------------------------------------- */
  {
    id: 'rule-based-over-llm',
    question: 'Why classify ads with rules, and not an LLM?',
    context:
      'The ads extractor pulls every live Facebook and Instagram ad for a set of competitors and has to cluster them into hooks, offers and unclaimed angles. Handing each ad to a model for classification is the modern default, and it would have been the shorter path to a first version.',
    options: [
      {
        name: 'LLM classification per ad',
        pros: [
          'Handles creative phrasing the taxonomy has not seen, without maintenance',
          'Faster to a first working version, and easier to extend to new dimensions',
        ],
        cons: [
          'A per-ad cost on a tool built under a zero-budget constraint',
          'Non-deterministic, so the same run can produce different clusters and a client cannot be shown why an ad landed where it did',
        ],
      },
      {
        name: 'Rule-based clustering',
        pros: [
          'Free, instant and deterministic — the same input always produces the same report',
          'Every cluster is explainable, which is what the person receiving a gap map actually needs',
          'At a few hundred ads per run, near-duplicate folding and set operations are sufficient',
        ],
        cons: [
          'The 11-type hook taxonomy and 9-offer matrix are hand-maintained',
          'Genuinely novel phrasing can fall outside the taxonomy until it is added',
        ],
      },
    ],
    chose: 'Rule-based clustering',
    because:
      '361 ads is regex-and-set-theory territory, not a machine learning problem. Determinism and explainability are worth more than coverage here: the output is a report a client makes spending decisions from, and "the model said so" is a worse answer than a rule you can point at.',
    tradeoff:
      'The hook taxonomy is hand-maintained, so the tool needs occasional attention as ad language shifts. An optional LLM summary layer sitting on top of the deterministic clusters is the obvious v2 — on top, not instead of.',
    outcome:
      'Zero analysis cost across 23 real runs, explainable clusters, and reports that generate instantly.',
    wouldRepeat: 'yes',
    projects: ['ads-analyser'],
  },

  {
    id: 'filesystem-runs-over-database',
    question: 'Why are analysis runs folders on disk, and not rows in a database?',
    context:
      'Each run of the ads extractor produces a dashboard, a Markdown report, a CSV, a JSON export and a PDF. Persisting that in SQLite or Postgres is the reflex, and it would have made cross-run analysis possible.',
    options: [
      {
        name: 'SQLite or PostgreSQL',
        pros: [
          'Cross-run queries: how a competitor’s hooks changed over six months',
          'Deduplication and history come free',
        ],
        cons: [
          'A dependency and a migration story on a tool whose selling point is that it installs anywhere with three packages',
          'Producing a client deliverable becomes an export step rather than the natural output',
        ],
      },
      {
        name: 'Timestamped folders as the datastore',
        pros: [
          'Each run is a self-contained folder that can be handed to a client as-is',
          'No database, no migrations, no export step — three dependencies total',
        ],
        cons: [
          'No cross-run queries, so trends over time have to be assembled by hand',
          'Disk organisation is the only index',
        ],
      },
    ],
    chose: 'Timestamped folders as the datastore',
    because:
      'The unit of value is a run, and a run is a deliverable. Making the deliverable the storage format meant there was never an export step, and the tool stayed installable anywhere on a runtime that is already present.',
    tradeoff:
      'No cross-run queries. Comparing a competitor’s hooks across six months means opening two folders, which is fine at 23 runs and would not be at 500 — that is the point at which SQLite earns its place.',
    outcome:
      'A three-dependency tool that installs anywhere and emits client-ready reports with no export step.',
    wouldRepeat: 'yes',
    projects: ['ads-analyser'],
  },

  /* ---- Mirasphere Studio ------------------------------------------------- */
  {
    id: 'real-stt-timestamps',
    question: 'Why transcribe generated narration for timing, instead of estimating word positions?',
    context:
      'Studio drives a Remotion timeline from a script: captions have to appear on the word, and scene changes have to land on the beat. Word positions can be estimated from a words-per-minute figure for free, or measured by running the synthesised narration back through speech-to-text for the price of one more API call.',
    options: [
      {
        name: 'Estimate from words per minute',
        pros: [
          'Free, instant, and no extra dependency in the chain',
          'Close enough for a rough cut',
        ],
        cons: [
          'Error accumulates across a 30-second narration, so the drift is worst at the end',
          'Captions that miss by 300 milliseconds do not read as slightly off, they read as broken',
        ],
      },
      {
        name: 'Transcribe the generated audio with Scribe for word-level timestamps',
        pros: [
          'Exact word start times, taken from the audio that will actually ship',
          'Scene cuts and captions can both be driven from one source of truth',
        ],
        cons: [
          'One more paid API call per video',
          'Another third-party step that can be slow or fail',
        ],
      },
    ],
    chose: 'Transcribe the generated audio with Scribe for word-level timestamps',
    because:
      'Timing is the difference between a video that looks produced and one that looks automated, and it is the first thing a viewer notices. Guessing at it to save one API call on a pipeline that already pays for text-to-speech, image-to-video and lip-sync is a false economy.',
    tradeoff:
      'One additional paid call per video — mitigated by the fact that it checkpoints like every other paid step, so it is paid once even across retries.',
    outcome: 'Karaoke-precise captions and scene cuts, driven from the audio that actually ships.',
    wouldRepeat: 'yes',
    projects: ['studio'],
  },

  {
    id: 'checkpoint-every-paid-step',
    question: 'Why checkpoint every paid step, rather than retrying a failed job from the start?',
    context:
      'One Studio render chains text-to-speech, speech-to-text, image-to-video and lip-sync, each billed per call, and the presenter step alone polls a third-party render for roughly an hour. Restart-on-failure is the simpler design, and for a cheap, fast job it would be the right one.',
    options: [
      {
        name: 'Retry the whole job on failure',
        pros: [
          'Far less state to manage — a job is either done or not',
          'No partial-result correctness questions',
        ],
        cons: [
          'One flake anywhere in the chain re-bills every step that had already succeeded',
          'With an hour-long presenter render in the middle, a late failure costs the whole hour again',
        ],
      },
      {
        name: 'Checkpoint each completed step',
        pros: [
          'A retry resumes from the last completed step, so a failure costs nothing extra',
          'Slow, flaky third-party APIs stop being a reliability problem and become a latency problem',
        ],
        cons: [
          'More state management, and every intermediate artefact needs a defined shape and a place to live',
          'Checkpoints can go stale if an earlier input changes, which has to be reasoned about',
        ],
      },
    ],
    chose: 'Checkpoint each completed step',
    because:
      'When every step in a chain bills per call and one of them takes an hour, retry semantics are the architecture. The design assumption was that the vendors will be slow and occasionally fail, and the job of the pipeline is to make that cost nothing.',
    tradeoff:
      'Noticeably more state to manage, and a job table that is now the reliability story of the whole product rather than a queue.',
    outcome:
      'Retries resume from the last completed step, so failures cost time and never money — which is what made the pipeline usable rather than merely working.',
    wouldRepeat: 'yes',
    projects: ['studio'],
  },

  /* A decision about THIS site. Cheap to write, and it demonstrates the
     format applied to something the reader can inspect directly. */
  {
    id: 'typed-data-vs-mdx',
    question: 'Why typed data files for this portfolio, and not MDX frontmatter?',
    context:
      'Every project on this site carries around twenty fields, several of them nested arrays — a stack with a required rationale per item, ten case-study sections, architecture nodes with failure modes. That content had to be authored somewhere, and the obvious default was MDX with YAML frontmatter.',
    options: [
      {
        name: 'MDX with YAML frontmatter',
        pros: [
          'Prose and metadata live in one file',
          'Conventional, and easy to move to a hosted CMS later',
        ],
        cons: [
          'YAML has no types, so a mistyped field fails at render rather than in the editor',
          'Deeply nested arrays in YAML are error-prone to hand-author',
          'No autocomplete for twenty field names',
        ],
      },
      {
        name: 'Typed TypeScript modules validated with Zod',
        pros: [
          'Editor autocomplete for every field, and compile-time errors on typos',
          'Zod refinements can encode rules YAML cannot — such as requiring exactly one of `client` or `clientDescriptor`',
          'The honesty rules become build failures instead of good intentions',
        ],
        cons: [
          'Content is coupled to the codebase, so a non-technical editor cannot update it',
          'Long prose in template literals is less pleasant to write than Markdown',
        ],
      },
    ],
    chose: 'Typed TypeScript modules validated with Zod',
    because:
      'The most important requirement for this content was that invented metrics and unfilled placeholders could not reach production. That is a validation problem, and validation wants a type system. Zod refinements enforce rules — one of `client` or `clientDescriptor`, a capture date on every metric, a real reason on every technology — that YAML would let through silently.',
    tradeoff:
      'The site now has no CMS, and content changes require a commit and a deploy. For a single-author portfolio that is a fair exchange; for a team or a client site it would be the wrong call, and I would reach for a hosted CMS with the same schema enforced at the edge.',
    outcome:
      'Long-form prose can still migrate to MDX bodies without changing this shape, because the schema describes structure rather than storage.',
    wouldRepeat: 'yes',
    projects: [],
  },

  /* A second decision about this site, and the more interesting one, because
     it went against the plan. Real numbers, measured on this codebase. */
  {
    id: 'dropping-gsap',
    question: 'Why does this site not use GSAP, when the plan specified it?',
    context:
      'The build plan for this portfolio named GSAP with ScrollTrigger as the animation layer, and it was installed and wired up first. Then the performance budget gate was written, and it failed: first-load JavaScript came to 220 KB gzipped. Attributing that weight chunk by chunk showed GSAP core plus ScrollTrigger accounted for 43.5 KB gzipped — and, because the reveal logic lived in the root layout, it was being shipped on every single route.',
    options: [
      {
        name: 'Keep GSAP, raise the budget',
        pros: [
          'No rework, and the timeline API is genuinely excellent',
          'Already integrated and working',
        ],
        cons: [
          'A budget that moves whenever it is inconvenient is not a budget',
          '43.5 KB on every route to do fade-up-on-scroll is a bad exchange',
          'A portfolio arguing for performance while paying that is arguing against itself',
        ],
      },
      {
        name: 'Keep GSAP, but load it lazily',
        pros: [
          'Off the critical path, and the API stays available',
          'Smaller change than removing it',
        ],
        cons: [
          'Still downloads for nearly every visitor, just slightly later',
          'Reveal animations are the first thing a visitor scrolls into, so deferring them either delays the effect or causes a visible jump',
        ],
      },
      {
        name: 'IntersectionObserver plus CSS keyframes',
        pros: [
          'Roughly 1 KB instead of 43.5 KB, for a visually identical result',
          'Animations become CSS, so they honour prefers-reduced-motion natively',
          'The hero and the flow diagram become server components, since they no longer need a JS runtime at all',
        ],
        cons: [
          'No timeline sequencing, so complex choreography would be painful',
          'Hand-rolled staggering, which is a small amount of code to own',
        ],
      },
    ],
    chose: 'IntersectionObserver plus CSS keyframes',
    because:
      'Everything V1 actually animates is a fade-up on scroll, a hero entrance and a breathing SVG. All three are CSS keyframes triggered by an observer. Paying 43.5 KB on every route for a timeline API that nothing was using is not a trade-off, it is an oversight — and the project rule was already written down: if an effect costs performance, remove the effect. The corollary is that if a library is not earning its bytes, remove the library.',
    tradeoff:
      'There is now no timeline sequencing available. The moment the V2 work needs the pinned Work transition or an animated architecture diagram, GSAP earns its place again — and it will come back as a dynamic import scoped to those components, never in the root layout. Hand-rolled staggering and a small magnetic-hover helper are also now this codebase’s to maintain rather than a vendor’s.',
    outcome:
      'First-load JavaScript went from 220 KB to 186 KB gzipped. More usefully, once the framework floor is subtracted — a bare Next 16.3 and React 19 route with zero client components measures 182 KB on its own — the code this project actually wrote is 4.2 KB on the heaviest route. Six of the eight routes ship no page-specific client JavaScript at all. The budget gate itself was rewritten to measure that delta rather than an absolute number, because an absolute budget dominated by a framework constant fails on day one and then gets ignored.',
    wouldRepeat: 'yes',
    revisitedAt: '2026-08',
    projects: [],
  },

  {
    id: 'directing-an-ai-pair',
    question: 'How does one developer replace an established practice-management platform in eight weeks, and what does using AI to do it actually cost?',
    context:
      'The firm was running on BrightManager, an established UK practice-management product, at roughly £500 per user per year. Replacing it meant 55 data models, 28 enums, 197 endpoints and twelve background services, against a live database of a real firm’s client history, with one developer. The way I chose to build this CRM was to direct an AI pair — Claude — and review everything it produced, line by line. That arithmetic does not work on typing speed, and pretending otherwise would have meant cutting the scope until it fit the typing — which is the same as not replacing the incumbent at all.',
    options: [
      {
        name: 'One developer, unassisted',
        pros: [
          'Every line written by the person who has to maintain it, understood at the moment it was written',
          'No review debt: you cannot ship code you never read',
        ],
        cons: [
          'The scope is simply not deliverable on this timeline, so the honest version of this option is a smaller product',
          'The firm keeps paying the subscription and keeps working around the software while you type',
        ],
      },
      {
        name: 'Configure a different off-the-shelf platform',
        pros: [
          'Fastest route to something working',
          'Somebody else owns the maintenance, the security patches and the uptime',
        ],
        cons: [
          'The reason for the project was that the incumbent would not bend to the firm’s workflows — a different vendor is a different set of the same limits',
          'The workarounds that were the real cost survive the migration',
        ],
      },
      {
        name: 'One developer directing an AI pair (Claude), reviewing everything that lands',
        pros: [
          'The scope becomes deliverable: boilerplate stops consuming the budget',
          'The developer’s attention moves to the parts that carry the risk — the data model, the migration, the tenancy boundary, the deploy',
        ],
        cons: [
          'Generated code is plausible before it is correct, and plausible code is harder to audit than code you wrote badly yourself',
          'You own bugs you did not type, which means the review burden is permanent rather than a phase',
        ],
      },
    ],
    chose:
      'One developer directing an AI pair — Claude — with every architectural decision and every review mine.',
    because:
      'The work that decided whether this project succeeded was not typing. It was choosing a relational model for compliance data where a document store would have looked fine for a month; validating that model against the firm’s real workflows with a one-day throwaway prototype before committing to anything; making migrations additive-only as a rule because the database held live client history from week one; and making the CSV importer dry-run by default. None of those are things you can delegate, and all of them are cheaper to get right than to fix. Delegating the volume is what left room to get them right.',
    tradeoff:
      'The review burden, and it is real. Generated code arrives confident and uniform, which is exactly what makes a missing check hard to see: there is no ugly seam to draw your eye. The insecure direct object reference in the failure archive is this trade-off being paid — one route among 197 that authenticated correctly and then loaded a record without constraining it to the tenant. It was found by audit rather than by accident, and the fix was structural rather than local, but it was there to be found. Anyone working this way who claims otherwise has not looked.',
    outcome:
      'It is in production, running the firm’s practice, and it absorbed years of BrightManager history without losing a record. The part worth judging is not the volume of code — it is that both bugs in the failure archive were found by me auditing my own system, one of them a cross-tenant exposure and the other a silently successful import. That is the half of this arrangement that actually has to work, and it is the half that does not come for free with the tooling.',
    wouldRepeat: 'qualified',
    revisitedAt: '2026-08-01',
    projects: ['crm', 'leadhouse'],
  },
]

export const incidents: Incident[] = [
  {
    id: 'crm-idor',
    title: 'The record that belonged to someone else',
    symptom:
      'During a security audit I ran on my own code, an authenticated request for a record ID that belonged to a different tenant returned the record instead of a 404.',
    impact:
      'A live production CRM holding Fordham Finance Group’s client data. Nothing was known to have been accessed improperly, but the class of the bug is the one that matters most in this system: cross-tenant data exposure in software whose entire value proposition is being trusted with client records.',
    cause:
      'Authorisation was being checked per handler rather than asserted structurally. The route in question authenticated the user correctly and then loaded the record by ID without also constraining the query to that user’s tenant — the classic insecure direct object reference, arrived at not by carelessness but by 197 endpoints each individually responsible for remembering the same rule.',
    investigation: [
      'The audit was deliberate rather than reactive: with real client data in production, I went looking for the failure modes I would be most embarrassed to have missed.',
      'Started from the assumption that authentication was fine and authorisation was not, because authentication is centralised and authorisation was not.',
      'Walked the routes that take a record ID from the client and load by primary key — the shape most likely to skip a tenant constraint — and found one that did.',
    ],
    fix:
      'Fixed the offending handler, then fixed the class: multi-tenant scoping is now asserted on every route rather than left to each handler to remember, so a new endpoint cannot omit it by default.',
    lesson:
      'Per-handler authorisation is a rule that has to be remembered 197 times, and a rule that has to be remembered will eventually be forgotten. Scope structurally. The second lesson is about scheduling: I found this because I finally sat down to look, which means the audit should have been continuous from the week production held real data, not an event some weeks later.',
    projects: ['crm'],
  },

  {
    id: 'brightmanager-csv-quoting',
    title: 'The import that looked like it worked',
    symptom:
      'Importing years of BrightManager history produced records that were structurally valid and quietly wrong — fields shifted, values landing in the wrong columns — rather than an error.',
    impact:
      'This was the migration the whole project depended on. The firm had to move years of client history into the new system with zero tolerance for data loss, and the dangerous outcome here was never a failed import: it was a successful-looking one that nobody would question until a deadline was missed.',
    cause:
      'BrightManager’s CSV exports quote fields inconsistently. Parsers that assume a consistent dialect resolve the ambiguity by guessing, and a guess that produces a parseable row produces a plausible row.',
    investigation: [
      'Compared imported records against the source export field by field rather than trusting a row count, because the row counts matched.',
      'Isolated the rows that differed and found the common factor was quoting, not encoding or delimiters — which had been the first suspicion.',
      'Confirmed it by re-parsing the same file strictly to RFC 4180 and getting different, correct output for exactly those rows.',
    ],
    fix:
      'Wrote a custom RFC-4180-compliant parser with a non-destructive merge, and made the importer dry-run by default so an import produces a report of what it would change before it changes anything.',
    lesson:
      'For a migration, the failure mode to design against is not an error — it is silent success. Anything that writes historical data gets a dry run by default and a field-level diff, not a row count.',
    projects: ['crm'],
  },

  {
    id: 'leadhouse-stale-register',
    title: 'Half the leads were not leads',
    symptom:
      'The bulk register flagged a cohort of companies as having accounts due. Verifying them live against the Companies House REST API showed that roughly half were not overdue at all.',
    impact:
      'Every one of those would have been a call to a company that had already filed — wasted outreach, and worse, an immediate credibility problem, because the entire pitch is knowing something specific and correct about the company being contacted.',
    cause:
      'The bulk company register is a monthly snapshot. A company that filed the day after the snapshot was taken still reads as due for up to a month, and the file gives no indication that it is out of date.',
    investigation: [
      'Spot-checked flagged companies against their live Companies House profile, expecting a small discrepancy rate.',
      'The discrepancy was not small, so the check was widened to the whole cohort of 162 flagged companies rather than a sample.',
      'Confirmed the pattern was recency rather than parsing: the mismatches were companies that had filed since the snapshot, not companies the ingest had misread.',
    ],
    fix:
      'Made live verification a mandatory stage rather than an optional one. Nothing downstream may treat the bulk flag as truth — the bulk file now produces candidates only, and a live REST profile check decides, with verdicts cached for 30 days so the API budget is spent on companies nobody has looked at yet.',
    result: {
      before: '162 companies flagged as due by the bulk snapshot',
      after: '83 confirmed actually overdue by live verification',
      source: 'self-measured',
      capturedAt: '2026-08-01',
    },
    lesson:
      'A cheap data source is allowed to be wrong as long as the system never forgets that it might be. Bulk data generates hypotheses; the authoritative source confirms them. The mistake would have been trusting a field because it was convenient to trust.',
    projects: ['leadhouse'],
  },

  {
    id: 'leadhouse-jobs-dying-mid-batch',
    title: 'The scan that had to start again',
    symptom:
      'Long scrape jobs died mid-batch whenever the process restarted — a deploy, a crash, a reboot — and lost their position entirely, along with any job rows left marked as running.',
    impact:
      'Hours of scanning discarded, and a queue containing orphaned jobs that would never complete and never fail. Since verification runs deliberately at half the published rate ceiling, redoing work is not just slow, it is spending a limited API budget twice.',
    cause:
      'Progress lived in the running process rather than in the database. A batch was an in-memory loop, so nothing outside that process knew how far it had got, and nothing on startup knew that a job claiming to be running no longer had anything running it.',
    investigation: [
      'Correlated the dead jobs with deploy times and confirmed the trigger was process lifecycle rather than any specific input row.',
      'Checked whether a row was the problem by resuming from the last known position by hand — it completed, which ruled out bad data and pointed at lost state.',
      'Established that the missing piece was durable progress plus a way to detect jobs abandoned by a previous process.',
    ],
    fix:
      'Moved progress into Postgres: slice-and-continue batches with an auto-advancing cursor, so a killed job resumes from its last committed position instead of restarting, plus an orphan-job sweep on boot that reclaims anything the previous process left mid-flight.',
    result: {
      before: 'A restart lost the whole batch',
      after: '42,119 rows completed across 5 resumed runs',
      source: 'self-measured',
      capturedAt: '2026-08-01',
    },
    lesson:
      'If a job takes longer than a deploy cycle, its progress belongs in the database, not in the process. And a queue needs to be able to tell the difference between "running" and "was running when something died" — otherwise the state is a lie the moment the process is.',
    projects: ['leadhouse'],
  },

  {
    id: 'virtuoso-post-event-bugs',
    title: 'The dashboards that only broke at events',
    symptom:
      'The artist, asset and event-management dashboards behaved correctly in development and then produced a steady stream of defects during live event trials — more than ten of them reaching production.',
    impact:
      'Failures landed during the trials the platform existed for, in front of the people running them, on the flows that mattered most: asset creation, purchase and profile management, across endpoints handling over a thousand requests a day.',
    cause:
      'Not one root cause. What every one of them shared is that none of them appeared before the event — the dashboards had been exercised in development, but not under a live trial, and the defects lived in the gap between those two conditions.',
    investigation: [
      'Reports arrived out of live event trials rather than a test plan, so triage happened in the sprint cycles that followed — four of them.',
      'The surface was bounded, which helped: three dashboards and the five REST endpoints behind them, so every report landed somewhere in that set.',
      'Treated the pattern as the finding rather than any individual bug — the interesting question was not what broke, but why nothing had broken before the event.',
    ],
    fix:
      'Fixed them as they came in — more than ten defects resolved across four sprint cycles, in the dashboards and the endpoints behind them.',
    lesson:
      'A feature that has only been exercised against seeded data is untested, not tested. Since then the default is to get real conditions in front of the code as early as it will survive them — which is why the CRM went live with real client data in week one rather than after a staging phase.',
    projects: [],
  },
]

/* Principles (spec §24). Engineering principles, not motivational quotes.
   The four statements below came from the brief. `evidence` points at
   something real in the projects or the decision log — a principle with no
   evidence is a slogan, which is why the schema requires the field. */
export const principles: Principle[] = [
  {
    id: 'problem-first',
    statement: 'Start with the problem, not the technology.',
    explanation:
      'Choosing a stack before understanding the problem means the problem gets reshaped to fit the tools. The interesting constraints — who maintains this, what the budget rules out, what the data actually looks like — only surface when you start from the problem.',
    evidence:
      'On the lead engine, the obvious technology was the Companies House Streaming API: real-time, event-driven, modern. It answers "what changed". The business question was "who is due", and a company sitting quietly with an overdue filing generates no event. Starting from the question produced a 2.9GB bulk-CSV pipeline with live verification instead — the less fashionable answer, and the only one that covers the whole register on day one.',
    projects: ['leadhouse'],
  },
  {
    id: 'simplest-surviving-architecture',
    statement: 'The simplest architecture that survives the constraints usually wins.',
    explanation:
      'Not the simplest architecture — the simplest one that survives. Constraints include traffic, but also the team that inherits it and the budget that maintains it. Most over-engineering is a failure to enumerate the constraints, and most under-engineering is the same failure.',
    evidence:
      'The CRM started as a one-day Express and SQLite prototype whose only job was to prove the data model against the firm’s real workflows. It did, and that is what earned the eight-week production rebuild on Fastify and PostgreSQL — the complexity was bought with evidence rather than assumed. The ads extractor is the same principle in the other direction: three dependencies, no framework, no database, because at a few hundred ads per run timestamped folders survive the constraints and a database would only have added a migration story.',
    projects: ['crm', 'ads-analyser'],
  },
  {
    id: 'clarity-over-beauty',
    statement: 'A beautiful interface is useless if nobody understands what to do next.',
    explanation:
      'Visual quality and clarity are usually complementary, but when they conflict, clarity wins. An interface that photographs well and confuses users has failed at the only thing it was for.',
    evidence:
      'The CRM’s BrightManager importer defaults to a dry run. One button and one confirmation would have been the cleaner screen, and it would have been the wrong one: the person using it is migrating years of an accounting firm’s history, and what they need is to see exactly what will change before anything changes. The extra step exists because silent success is the failure mode of a migration, and an interface that hides that is not simpler, it is just quieter.',
    projects: ['crm'],
  },
  {
    id: 'every-decision-trades',
    statement: 'Every technical decision creates a trade-off.',
    explanation:
      'If a decision appears to have no downside, the downside has not been found yet. Naming the trade-off at the time of the decision is what makes it possible to revisit later, and it is the difference between a choice and a habit.',
    evidence:
      'Every entry in the decision log above names what it cost. PostgreSQL over MongoDB bought relational integrity for compliance data and paid for it in migration discipline — 26 additive migrations against a live production database, none of them destructive. Running the Companies House verifier at half the published rate ceiling bought zero rate-limit incidents across 22 production jobs and paid for it by making verification the deliberately slow stage of the pipeline. Both were the right call; neither was free.',
    projects: ['crm', 'leadhouse'],
  },
]
