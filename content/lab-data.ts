/* ==========================================================================
   LAB DATA — GENERATED. DO NOT EDIT.

   Written by scripts/build-lab-data.ts. Run `npm run build:lab` to rebuild.
   Source: the RAG index of Dheeraj's CV, FAQ, intros and project write-ups —
   23 chunks, each embedded with bge-small-en-v1.5 (384 dimensions,
   L2-normalised).

   ── PCA, MEASURED ─────────────────────────────────────────────────────────
   Two components, computed by power iteration on the 23x23 Gram matrix of
   the mean-centred vectors, then deflation.

     component 1   14.3% of total variance
     component 2   10.8% of total variance
     together      25.1%

   That is a real number, not a flattering one, and the instrument states it
   on screen. 74.9% of the structure in this corpus does not fit on a
   flat picture — which is the honest lesson of the map, and the reason no
   claim is made that visual distance equals semantic distance exactly.

   Both axes share one scale factor (0.4823), so the plot's aspect ratio
   reflects the real ratio between the components rather than stretching the
   weaker axis to fill the box.

   ── BPE, MEASURED ─────────────────────────────────────────────────────────
   300 merges trained on the same 23 chunks. On the training corpus:

     10444 characters -> 4896 tokens   (2.13 chars/token)

   A production tokeniser has ~100k merges trained on the open web and would
   reach roughly 4 chars/token on English prose. This one is domain-specific
   by construction: it knows "WordPress" and "Companies House" as single
   tokens and has never seen the word "banana".
   ========================================================================== */

export type LabPoint = {
  /** Chunk id from the RAG index. */
  id: string
  /** Source document the chunk came from. */
  source: string
  /** ~40-character human label, derived from the chunk's opening phrase. */
  label: string
  /** PCA coordinates, shared scale, both within [-1, 1]. */
  x: number
  y: number
  /** Full chunk text, whitespace collapsed. Used for lexical retrieval. */
  text: string
}

/** The corpus, projected. Document order matches the index. */
export const LAB_POINTS: LabPoint[] = [
  {
    "id": "c0",
    "source": "cv",
    "label": "Dheeraj Kumar",
    "x": -0.8655,
    "y": -0.3406,
    "text": "# Dheeraj Kumar — Full-Stack Developer - **Location:** Gurgaon, Haryana, India - **Email:** okkdheeraj@gmail.com - **LinkedIn:** linkedin.com/in/dheerajheree - **Website:** dheerajdrive.com - **Phone:** +91 7667116918"
  },
  {
    "id": "c1",
    "source": "cv",
    "label": "Summary Full-stack developer with 3+",
    "x": 0.105,
    "y": 0.6062,
    "text": "## Summary Full-stack developer with 3+ years of experience across freelance and agency work — WordPress, WooCommerce, Shopify, and the MERN stack. Delivered 16+ freelance and 12+ agency projects for clients in Canada, USA, and UK. Strong performance-engineering track record: raised multiple sites from Lighthouse ~40 to 85+. Currently building client-side LLM applications (RAG, in-browser inference with WebGPU)."
  },
  {
    "id": "c2",
    "source": "cv",
    "label": "Mirasphere Digital",
    "x": -0.3195,
    "y": 0.7178,
    "text": "### Mirasphere Digital — Website Developer (Apr 2025 – Present, Onsite, Gurgaon) - Delivered 7+ end-to-end web projects spanning ReactJS, PHP, and WordPress — UI development through deployment and post-launch support. - Built custom WordPress solutions with custom PHP, Advanced Custom Fields, and Elementor. - Developed ReactJS interfaces with reusable component architecture used across multiple client projects. - Worked with designers and PMs in an agency environment, maintaining delivery timelines across simultaneous projects."
  },
  {
    "id": "c3",
    "source": "cv",
    "label": "Freelance Full-Stack Developer (Jun",
    "x": -0.1362,
    "y": 0.7344,
    "text": "### Freelance Full-Stack Developer (Jun 2022 – Apr 2025, Remote) - Managed 16+ end-to-end freelance projects and 12+ agency collaborations for clients in Canada, USA, and UK using WordPress, WooCommerce, Shopify, and Bootstrap. - Boosted page speed by 60% via asset optimization and LCP/CLS improvements (GTmetrix, Lighthouse). - Maintained domain, DNS, and hosting for 20+ client websites at 99.9% uptime."
  },
  {
    "id": "c4",
    "source": "cv",
    "label": "Virtuoso.live",
    "x": 0.2533,
    "y": 0.5029,
    "text": "### Virtuoso.live — Frontend Developer Intern (Jul 2024 – Apr 2025, Remote) - Engineered 3 interactive dashboards (artists, assets, event management) with React, Express, MongoDB. - Built and deployed 5 RESTful API endpoints handling 1000+ requests/day (asset creation, purchase, profile management). - Contributed to 4 Agile sprint cycles; resolved 10+ live production bugs post-event trials."
  },
  {
    "id": "c5",
    "source": "cv",
    "label": "Skills",
    "x": 0.2119,
    "y": 0.2016,
    "text": "## Skills - **Expert:** JavaScript, React, HTML/CSS, WordPress (custom PHP, ACF, Elementor), performance optimization (Lighthouse, Core Web Vitals) - **Working:** Node.js, Express, MongoDB, PHP, Tailwind CSS, Shopify/WooCommerce, Strapi, REST API design - **Learning / current focus:** TypeScript, Next.js, LLM engineering — RAG pipelines, in-browser inference (WebLLM/WebGPU), embeddings (transformers.js) - **Tools:** Git, GitHub, Figma, Postman"
  },
  {
    "id": "c6",
    "source": "cv",
    "label": "Education",
    "x": -0.8454,
    "y": -0.5202,
    "text": "## Education - **MCA**, K.R. Mangalam University, Gurugram (2023–2025) — 7.2/10 CGPA - **BCA**, Aryabhatta Knowledge University, Patna (2020–2023) — 8.2/10 CGPA"
  },
  {
    "id": "c7",
    "source": "cv",
    "label": "Logistics",
    "x": -1,
    "y": -0.2243,
    "text": "## Logistics - **Current location:** Gurgaon, India - **Work preference:** - **Open to roles in:** - **Visa / work authorization:** - **Notice period:** - **Salary expectations:** Discussed at offer stage. - **Preferred roles:**"
  },
  {
    "id": "c8",
    "source": "faq",
    "label": "Does he work remote?",
    "x": -0.4225,
    "y": 0.6716,
    "text": "## Does he work remote? Yes — 3 years of remote freelance delivery for clients across Canada, USA, and UK. Currently onsite at Mirasphere Digital."
  },
  {
    "id": "c9",
    "source": "faq",
    "label": "What's his experience with AI/LLMs?",
    "x": 0.5845,
    "y": -0.3752,
    "text": "## What's his experience with AI/LLMs? He builds client-side LLM applications. This portfolio itself runs a full RAG pipeline in the browser: build-time chunking and embedding of his CV and projects, client-side retrieval with transformers.js, and streaming inference on WebGPU via WebLLM — no server, no API keys."
  },
  {
    "id": "c10",
    "source": "faq",
    "label": "Can he do WordPress AND modern JS",
    "x": 0.1461,
    "y": 0.4584,
    "text": "## Can he do WordPress AND modern JS stacks? Yes — that's his differentiator. 28+ delivered WordPress/WooCommerce/Shopify projects plus MERN-stack product work (dashboards, REST APIs, e-commerce). He's comfortable both in agency delivery mode and product engineering mode."
  },
  {
    "id": "c11",
    "source": "faq",
    "label": "What's his strongest technical skill?",
    "x": 0.0283,
    "y": 0.017,
    "text": "## What's his strongest technical skill? Web performance. He's repeatedly taken sites from Lighthouse ~40 to 85+, and boosted page speed 60% via asset optimization and Core Web Vitals work."
  },
  {
    "id": "c12",
    "source": "faq",
    "label": "Refusal list",
    "x": -0.7648,
    "y": -0.6971,
    "text": "# Refusal list — the bot must deflect these - Exact current or past salary figures → \"That's discussed directly with Dheeraj.\" - Personal details beyond what's on this page (family, age, address) - References' contact information → \"Available on request via email.\" - Opinions on past clients or employers - Anything not grounded in retrieved context → \"I don't have that information — ask Dheeraj directly at okkdheeraj@gmail.com.\""
  },
  {
    "id": "c13",
    "source": "intros",
    "label": "Recruiter I'm Dheeraj",
    "x": -0.5914,
    "y": 0.0881,
    "text": "## Recruiter I'm Dheeraj — a full-stack developer with 3+ years shipping for clients across Canada, the US, and the UK. 28+ delivered projects, sites taken from Lighthouse 40 to 85+, and 99.9% uptime across 20+ properties I've managed end-to-end. Right now I'm building AI-powered web experiences — including the chatbot on this page, which runs entirely in your browser. Ask it about my notice period."
  },
  {
    "id": "c14",
    "source": "intros",
    "label": "Engineer Full-stack dev",
    "x": 0.3446,
    "y": 0.0685,
    "text": "## Engineer Full-stack dev, React/Node/PHP, with a performance habit — I don't ship pages I haven't profiled. This site is a static Next.js export running a complete RAG pipeline client-side: build-time chunked and embedded corpus, transformers.js retrieval, WebLLM streaming inference on WebGPU. No server, no API keys. Open the devtools, check the worker. The README explains the indexing pipeline if you want to go deeper."
  },
  {
    "id": "c15",
    "source": "intros",
    "label": "Founder I've spent three years as the",
    "x": 0.103,
    "y": 0.2259,
    "text": "## Founder I've spent three years as the single point of delivery for 16+ freelance projects — scoping, building, deploying, and supporting them alone, on time, for clients in three countries. I move fast without dropping quality: 60% page-speed gains, 99.9% uptime, zero hand-holding needed. Now I'm applying that same ownership to AI features users can actually feel — like the in-browser LLM answering questions on this page."
  },
  {
    "id": "c16",
    "source": "01-portfolio-rag",
    "label": "In-Browser RAG Portfolio (this site)",
    "x": 0.6163,
    "y": -0.4312,
    "text": "# In-Browser RAG Portfolio (this site) **Problem:** Prove LLM engineering capability without a single API key or server — every AI feature must run on the visitor's device, free, forever. **Architecture:** - Build time: markdown corpus (CV, projects, FAQ) → chunked (~200 tokens, overlap) → embedded with bge-small-en-v1.5 → static JSON index + 2D UMAP projection - Runtime: query embedded client-side (transformers.js) → cosine top-k retrieval → context-assembled prompt with guardrails → Qwen2.5-1.5B streaming on WebGPU (WebLLM), in a Web Worker - Fallback: no WebGPU → retrieval-only mode, curated answers, honest labeling - CI rebuilds the index on every content change (GitHub Actions) **Metrics:** **Stack:** Next.js 15, TypeScript, Tailwind v4, Motion, Lenis, WebLLM, transformers.js **Repo:** **What it demonstrates:** RAG design end-to-end, embedding/retrieval mechanics, prompt guardrails, sampling parameters (live demo in the LLM Lab), and the performance discipline to keep all of it off the critical path."
  },
  {
    "id": "c17",
    "source": "02-crm",
    "label": "Practice CRM (BrightManager Alternative)",
    "x": 0.1834,
    "y": -0.3564,
    "text": "# Practice CRM (BrightManager Alternative) **Status:** Deployed & tested in real use **Problem:** Replace a paid practice-management CRM (BrightManager-class) with a purpose-built system — **Architecture:** - Stack (frontend, backend, DB, hosting) - Core modules built (clients, deadlines, tasks, document handling, email?) - Anything Companies House / HMRC-integrated? - Auth/multi-user model **Metrics:** **AI angle:** Built end-to-end with Claude as pair-programmer/agent. **Demo:**"
  },
  {
    "id": "c18",
    "source": "03-companies-house-scraper",
    "label": "Companies House Lead Engine",
    "x": 0.2563,
    "y": -0.3242,
    "text": "# Companies House Lead Engine (\"Leadhouse\") **Status:** Deployed & tested **Problem:** Generate qualified B2B leads from UK Companies House data — new incorporations, filings, sector filters — as a self-hosted alternative to paid lead platforms. **Architecture:** Companies House API + a maintained open/streaming connection with handshake keep-alive. - Which stream — the CH Streaming API (long-lived HTTP stream)? How do you handle reconnects/resume points? - Filtering/enrichment logic — what makes something a \"lead\"? - Storage + delivery (DB? CSV export? feeds into the CRM?) - Rate-limit handling on the REST side **Metrics:** **Why it's a strong deep-dive:** long-lived connection management, backpressure, and API resilience — real systems engineering, not CRUD. Tell the reconnect/handshake story in detail; that's the animated diagram. **Demo/Repo:**"
  },
  {
    "id": "c19",
    "source": "04-meta-ads-analyser",
    "label": "Meta Ads Competitor Analyser",
    "x": 0.437,
    "y": -0.5095,
    "text": "# Meta Ads Competitor Analyser **Problem:** See every live ad your competitors are running — creatives, copy, run-time, placements — in one dashboard instead of manually trawling the Meta Ad Library. **Architecture:** Meta Ad Library API → - How competitors are tracked (page IDs? search terms?) - Refresh cadence and how you handle API pagination/limits - What analysis is done on the data — trends, creative comparison, longevity scoring? Any LLM-powered analysis of ad copy? (If not, this is a cheap high-value add: classify/summarize competitor messaging with an LLM) - Frontend/dashboard stack **Metrics:** **Status:** **Demo/Repo:**"
  },
  {
    "id": "c20",
    "source": "05-voiceover-video-platform",
    "label": "AI Voiceover Video Platform",
    "x": 0.6222,
    "y": -0.5383,
    "text": "# AI Voiceover Video Platform **Problem:** Generate finished voiceover videos end-to-end without spending LLM credits per render — orchestrating best-in-class tools instead of one expensive model. **Pipeline:** Magnific (visual upscaling) + ElevenLabs (voice synthesis) + Remotion (programmatic video render) + **Architecture:** - Flow: script in → ? → final MP4 out. What's automated vs manual? - How Remotion compositions are parameterized (props from the script? timing from ElevenLabs audio duration?) - Where it runs (local render? Lambda? server?) - The \"zero Claude credits\" trick — explain the design decision **Metrics:** **Why it's a strong deep-dive:** multi-vendor AI orchestration is exactly what \"LLM capabilities\" means in a product context — knowing which tool does what, wiring them into a pipeline, and controlling cost. The cost-engineering angle is the story. **Status:** **Demo:**"
  },
  {
    "id": "c21",
    "source": "06-mern-ecommerce",
    "label": "MERN E-commerce Platform",
    "x": 0.4927,
    "y": -0.0341,
    "text": "# MERN E-commerce Platform **Problem:** Full e-commerce flow — catalog, cart, auth, transactions — built solo to production standard. **Architecture:** React + Redux frontend; Express.js REST API; MongoDB; JWT auth. **Metrics:** 100+ products, 1000+ user accounts and transactions, sub-2s load across devices. **Stack:** MongoDB, Express, React, Redux, Node.js, JWT **Repo:** **Upgrade idea (optional, high ROI):** add one LLM feature — e.g. semantic product search using the same embedding approach as the portfolio. Turns a standard MERN project into a second AI story."
  },
  {
    "id": "c22",
    "source": "07-virtuoso-dashboards",
    "label": "Virtuoso.live",
    "x": 0.5606,
    "y": 0.0588,
    "text": "# Virtuoso.live — Event & Asset Dashboards **Problem:** Artists and event managers needed real-time management tooling for assets, purchases, and profiles on a live-events platform. **Architecture:** 3 React dashboards backed by Express + MongoDB; 5 REST endpoints handling 1000+ requests/day. **Metrics:** 1000+ req/day, 10+ production bugs resolved under live-event pressure, 4 sprint cycles. **Stack:** React, Express.js, MongoDB, REST **Note:** internship/company work — describe generically, no internal screenshots without permission."
  }
]

/** Distinct sources, in first-appearance order. Drives the legend and hues. */
export const LAB_SOURCES: { id: string; label: string }[] = [
  {
    "id": "cv",
    "label": "cv"
  },
  {
    "id": "faq",
    "label": "faq"
  },
  {
    "id": "intros",
    "label": "intros"
  },
  {
    "id": "01-portfolio-rag",
    "label": "portfolio-rag"
  },
  {
    "id": "02-crm",
    "label": "crm"
  },
  {
    "id": "03-companies-house-scraper",
    "label": "companies-house-scraper"
  },
  {
    "id": "04-meta-ads-analyser",
    "label": "meta-ads-analyser"
  },
  {
    "id": "05-voiceover-video-platform",
    "label": "voiceover-video-platform"
  },
  {
    "id": "06-mern-ecommerce",
    "label": "mern-ecommerce"
  },
  {
    "id": "07-virtuoso-dashboards",
    "label": "virtuoso-dashboards"
  }
]

/** Fraction of total variance retained by the two plotted components. */
export const PCA_EXPLAINED_VARIANCE = 0.251
export const PCA_EXPLAINED_VARIANCE_1 = 0.143
export const PCA_EXPLAINED_VARIANCE_2 = 0.108

/** Embedding dimensionality the projection was fitted on. */
export const PCA_DIMENSIONS = 384

/* The fitted basis. Nothing in the shipped instruments imports these three —
   the query point is placed lexically, and saying so is the point — but they
   are emitted because they are what makes the projection reproducible and
   invertible: given a real bge-small vector q, its map position is
   ((q - PCA_MEAN) · PCA_COMPONENT_N) / PCA_SCALE. Unused named exports are
   dropped by tree-shaking, so they cost nothing in the browser. */
export const PCA_SCALE = 0.482338
export const PCA_MEAN: number[] = [-0.04326,-0.01956,-0.0017,-0.04202,-0.00382,0.00215,-0.03564,0.02026,-0.01951,-0.01617,0.00889,-0.04254,0.02022,0.03386,0.04038,0.02411,0.01768,-0.00793,-0.0173,-0.00753,0.05077,-0.02023,-0.00686,-0.03844,0.01925,-0.00128,-0.02698,-0.03984,-0.04641,-0.17333,-0.00327,-0.02849,0.03376,0.00156,0.01798,0.00919,-0.02497,0.04058,-0.02583,0.01266,0.0157,0.0166,-0.01142,-0.01874,0.00668,-0.0508,-0.01512,-0.00486,-0.04739,-0.01003,-0.01834,-0.04588,0.00566,0.00829,0.02096,0.02137,0.03142,0.03925,0.01868,0.03943,0.03612,0.01014,-0.17478,0.0587,0.0226,0.04261,-0.03194,-0.05227,-0.00665,0.04859,-0.0017,-0.00654,-0.01516,0.02667,0.02973,0.00652,0.02067,-0.01286,0.02318,-0.00995,0.00042,-0.02012,-0.03975,-0.00304,-0.03881,-0.00583,0.01079,0.00963,0.02755,0.00883,-0.00611,-0.00962,0.00571,0.00555,-0.02574,-0.02064,0.02669,0.031,-0.07117,0.12053,-0.02575,0.00036,0.03138,-0.0249,0.03967,0.00657,-0.01026,-0.01232,-0.02083,0.01413,-0.00515,0.0159,0.01452,-0.04521,0.02103,0.01256,-0.01099,0.01709,-0.02295,0.00897,0.01788,0.03983,0.05271,0.01256,-0.00127,0.00166,0.04344,0.04694,0.00509,0.05131,0.0408,0.02073,-0.05241,-0.00678,0.00053,0.01145,0.00566,-0.01188,0.00792,0.06075,-0.03559,0.00757,0.0139,-0.03706,-0.00217,0.07948,0.01897,0.03085,-0.02607,-0.01835,-0.02272,0.03837,-0.00907,-0.03854,-0.00707,0.02683,0.05278,0.05354,-0.06346,0.00053,-0.00054,-0.03976,-0.01509,0.11975,-0.01682,-0.11952,-0.02215,0.03878,0.00097,-0.00114,-0.01271,-0.00172,-0.02631,-0.01931,0.05236,-0.03434,-0.02987,0.02732,0.01154,0.01663,0.01163,-0.02212,-0.01279,0.03512,-0.00918,-0.03313,0.02004,-0.01803,-0.00285,0.01519,-0.04003,0.01236,-0.04262,0.00052,0.00008,-0.00521,0.00125,-0.02587,0.04386,-0.02432,0.04333,0.02145,-0.00247,0.00892,-0.01823,0.02,-0.02198,0.00932,0.04186,0.05129,-0.03911,-0.00468,0.06581,0.00203,0.00077,-0.00606,0.01041,0.05201,0.02039,0.06035,-0.01491,0.0311,-0.04544,-0.20184,0.00638,-0.01111,-0.00937,-0.00014,-0.03178,0.01943,0.0084,0.04545,0.07097,0.09122,-0.00302,-0.00442,-0.02305,-0.00278,0.00527,0.00975,0.01918,-0.0175,-0.01203,-0.0002,0.0073,-0.02185,-0.07449,0.05431,-0.00256,0.14047,0.02758,-0.00081,-0.0493,0.0339,0.00993,-0.00778,-0.13422,0.02279,0.01467,0.03655,-0.05025,0.02303,-0.01205,-0.03608,0.02734,0.00008,-0.08678,-0.03933,-0.0123,-0.03484,-0.0369,-0.03993,0.04059,0.01426,-0.02859,0.02927,0.01898,-0.0042,-0.00603,-0.04646,0.01509,-0.01743,0.04798,-0.01169,-0.02178,-0.00365,-0.00644,0.02613,-0.01752,0.01116,-0.01208,0.02021,-0.06486,-0.02101,0.0599,-0.01323,0.02108,-0.00606,-0.02404,0.01182,-0.01989,0.01119,0.00288,0.04311,-0.01651,0.04401,0.01531,0.02434,0.0415,0.01684,-0.01751,0.01232,0.00474,-0.01139,-0.00124,-0.0723,-0.04926,0.01826,0.02403,-0.21562,0.00555,0.00483,0.01461,-0.03073,0.0077,0.03874,-0.02645,-0.04158,0.03266,-0.00361,0.0347,-0.00128,-0.00625,0.04866,0.01659,0.02421,-0.00907,0.02487,-0.05567,-0.00231,0.02585,0.18884,0.01006,0.01556,0.03797,-0.02864,0.00804,0.0317,-0.00554,-0.01678,0.0058,0.0868,-0.03237,-0.00412,0.02016,-0.00976,0.0133,0.00542,0.00538,0.01717,-0.01275,-0.00971,0.03361,0.06837,-0.02613,-0.02367,-0.05781,-0.01107,-0.01159,-0.03079,-0.04871,0.00044,0.00849,0.01054,0.03693,0.00314,-0.03143,-0.04887,-0.04366,-0.00351,0.01065,0.02526,0.05645,0.00678]
export const PCA_COMPONENT_1: number[] = [-0.07437,-0.03765,-0.02518,0.04143,0.00198,-0.02547,-0.14652,0.00917,0.05523,0.00234,-0.01744,0.08,-0.00274,0.01714,-0.00671,-0.00013,0.02088,0.07937,-0.00993,0.04518,-0.07175,-0.01355,-0.02221,-0.0349,-0.06375,0.01773,-0.0112,0.01977,0.02407,-0.14228,0.00859,-0.01166,-0.0163,0.01319,0.07888,-0.0165,-0.00928,-0.04735,-0.10582,0.06086,0.01166,0.05503,-0.03767,-0.02629,0.02037,-0.04012,0.02776,-0.04687,-0.03223,0.10318,0.03208,-0.00482,0.02276,0.00811,-0.0111,0.0223,-0.04265,0.08888,-0.02388,-0.04899,0.01879,-0.06139,0.06519,0.02456,0.07898,0.08896,-0.00239,0.0565,0.02193,0.05858,-0.04976,0.00729,0.07245,-0.03746,0.01936,0.05798,0.06989,-0.06164,0.09092,-0.03132,-0.04628,-0.13583,-0.07746,0.01451,0.02952,0.0546,-0.02929,0.0013,-0.00206,0.03469,-0.10043,-0.01319,0.06039,0.03111,0.06665,0.01367,0.0192,0.00256,0.03639,-0.01797,0.10821,-0.02294,0.04311,-0.00995,0.03275,-0.04097,-0.04544,0.02226,-0.01253,-0.03076,0.03822,0.00514,-0.00498,-0.02498,0.00968,-0.05131,-0.09047,-0.00925,0.02716,0.0623,0.00565,-0.03001,-0.02333,-0.05104,0.01166,0.05716,0.10619,-0.04668,-0.03812,0.00155,-0.05102,0.08455,0.05998,0.00331,-0.00086,-0.0307,-0.00568,-0.02848,0.06014,0.09261,-0.09378,0.14445,0.04825,-0.03811,0.04014,0.04421,0.0535,0.04842,-0.07898,0.01492,-0.00151,-0.01336,-0.07716,0.03478,-0.01685,-0.02386,0.01806,0.05881,-0.00479,0.00364,0.02541,0.05708,0.01346,0.02751,-0.05301,0.00494,-0.03604,-0.00605,-0.01706,-0.06505,-0.08958,-0.03314,-0.0192,-0.01979,-0.012,-0.00108,-0.16386,-0.05952,-0.01031,-0.01033,-0.00903,-0.00699,-0.03018,0.01294,-0.06835,-0.02638,0.05554,-0.06448,-0.03607,0.08237,0.02456,0.00649,0.06982,0.03869,-0.00787,0.04199,0.01046,-0.01944,-0.02062,0.00439,-0.04822,-0.01487,0.04988,-0.06043,-0.04067,0.01658,-0.06097,-0.04357,0.12321,0.01831,-0.05476,0.05331,-0.08459,0.01225,0.0482,-0.02374,0.04261,0.06165,-0.04796,0.02589,0.01344,-0.0124,-0.13031,-0.04278,-0.04507,-0.03288,0.14195,0.02982,-0.04186,-0.03242,-0.01527,-0.09854,-0.01454,-0.07909,-0.01854,-0.04881,-0.05922,-0.05158,0.02572,-0.01096,-0.07269,-0.07187,0.04977,-0.05636,-0.00518,0.0338,-0.07791,-0.06168,-0.0508,0.05504,-0.00348,0.01017,0.04225,0.04494,-0.03582,-0.03374,0.06122,-0.02788,0.02582,0.09604,0.05932,0.04013,0.01662,-0.07168,-0.05962,0.02986,-0.1135,0.00086,0.05386,-0.01571,-0.04384,-0.04709,-0.04595,0.03975,0.01424,0.0673,-0.01893,-0.06196,0.04913,-0.01988,0.04677,0.01276,-0.07263,0.08627,0.00459,0.08157,-0.03022,0.10652,-0.02804,0.07087,-0.00126,0.07441,-0.01327,-0.07804,0.06892,-0.04935,0.0145,-0.01009,0.04824,0.01921,-0.11006,-0.00536,0.04795,0.04814,0.04309,-0.07703,-0.06308,-0.02187,0.0382,-0.04015,-0.05024,0.00871,-0.0174,0.04045,-0.06982,-0.06598,-0.00421,0.04528,0.04914,0.02267,-0.03039,0.03043,0.06633,-0.07971,-0.016,-0.01107,-0.0385,-0.03277,0.02984,0.00765,-0.06563,0.00711,-0.02631,-0.04496,0.01006,0.0683,0.00855,0.08279,0.01817,-0.02575,0.02313,0.05585,0.00881,-0.11742,0.02214,-0.00663,-0.01329,0.05517,0.02782,-0.04635,0.02535,0.01488,0.04345,0.01259,-0.00196,-0.01267,-0.01944,0.01187,0.01209,0.08716,-0.01965,0.09515,-0.00243,-0.02455,-0.07241,0.13121,0.00304,-0.09001,0.04032,0.00109,-0.05127,-0.03075,-0.04623,0.0485,0.00861,0.03474,0.07325,0.03633,0.0906,0.09912,-0.03868,0.08178,0.04038,-0.04796]
export const PCA_COMPONENT_2: number[] = [0.05703,-0.01005,0.07538,-0.03143,0.001,0.03968,-0.02595,0.00257,-0.00549,0.1071,0.03014,0.11675,0.00729,-0.00113,0.01947,-0.02726,0.01679,-0.09842,-0.10939,-0.02753,0.00248,0.00586,-0.05094,-0.04181,-0.03706,0.0316,-0.04801,-0.01268,0.03846,0.08188,-0.09096,0.02583,-0.10883,-0.02429,0.02415,-0.00281,-0.06236,-0.05667,-0.02902,0.03317,0.03928,0.02805,-0.02998,0.00001,-0.01163,-0.03243,-0.07346,-0.02558,0.02518,0.00025,0.02959,-0.06995,0.00356,0.0278,-0.01249,0.03554,-0.05517,0.02933,-0.03982,0.03195,0.00265,-0.07688,-0.01304,-0.01648,0.03854,0.01716,-0.07479,-0.03111,-0.04852,-0.09747,0.01113,0.03454,-0.01116,0.05009,0.05633,0.04203,0.05323,-0.01362,0.04619,-0.00322,0.11929,-0.00445,-0.0144,0.05529,-0.04374,-0.04353,-0.03125,0.01597,-0.0247,0.05295,-0.08052,0.01604,-0.0244,-0.07006,-0.04429,-0.04726,0.07678,0.02186,0.02568,0.02545,0.01231,-0.05735,0.04169,-0.01203,0.04265,0.055,0.0286,0.0384,0.01456,-0.00417,-0.0754,-0.04443,0.03629,0.02028,-0.05789,0.02015,-0.09871,0.03776,0.06342,0.03708,0.08586,-0.00186,0.03327,0.0677,-0.06127,0.07575,0.05743,-0.04547,0.00412,0.11283,0.02576,0.15497,0.09489,0.03223,-0.02547,-0.02823,-0.01331,0.03096,0.0015,0.05128,-0.04974,0.02394,0.01102,-0.0055,0.00586,-0.06389,0.01379,0.03392,0.01343,0.03201,-0.04771,0.08505,0.04243,-0.02146,-0.05698,0.04921,0.10333,-0.05261,-0.0087,-0.02119,0.03334,0.03664,0.0737,-0.13191,-0.01941,-0.05891,0.03546,0.07726,0.04503,0.01198,-0.03227,-0.08993,0.03984,-0.0743,0.01675,-0.00432,0.01876,0.07887,0.09986,-0.01462,-0.04678,0.06004,0.03497,0.01221,-0.07574,0.01371,0.11142,0.08169,0.01178,0.00264,0.06755,-0.02866,-0.08267,0.02807,0.06192,0.01463,-0.10641,-0.01035,0.03085,-0.028,0.03661,0.01918,-0.00264,-0.00504,0.06449,0.0424,-0.05121,0.08958,-0.08415,-0.03927,-0.037,0.09767,0.08076,-0.05915,0.10946,0.06697,-0.04653,0.08152,-0.01221,0.05802,-0.00226,-0.12437,-0.02685,-0.02252,-0.05262,-0.00614,-0.03913,-0.00341,0.04822,-0.00602,-0.04162,-0.01776,-0.04534,-0.00677,-0.00906,-0.00585,-0.01659,0.00762,-0.02644,0.14823,-0.02578,-0.01969,-0.08155,0.01717,-0.04759,-0.07855,0.03673,0.00613,0.07123,0.00724,0.01429,-0.05434,-0.09206,0.12653,-0.10247,0.05718,-0.05473,0.02089,0.00489,0.03888,-0.13537,-0.10157,0.07882,0.11025,0.01875,0.07556,-0.01537,-0.03248,-0.00519,-0.06342,-0.05083,0.00304,-0.04221,0.0398,-0.05514,-0.02186,0.00953,-0.0226,0.06331,-0.00065,0.01494,-0.04732,0.05975,-0.07105,-0.06738,-0.05616,0.05593,0.00024,0.02037,0.01456,-0.01206,0.03598,-0.14984,-0.03686,-0.02768,-0.01684,-0.02255,0.00652,-0.10138,-0.0588,0.03936,0.03163,0.04645,0.01932,-0.05036,-0.01046,-0.03961,0.01141,-0.07671,0.00265,-0.00637,0.0069,0.01611,0.01557,0.04207,-0.00848,-0.01934,-0.00626,0.02691,-0.0153,-0.01583,-0.06777,-0.04647,-0.03424,-0.04332,0.0825,0.01372,0.00698,0.00129,0.00106,-0.01912,0.05164,0.07603,0.05976,0.07394,-0.05017,-0.01007,0.02664,-0.13021,0.03182,-0.0156,-0.00897,0.02013,0.03315,0.03694,0.01699,0.03396,-0.02257,-0.01184,-0.03526,0.03124,-0.01037,-0.00133,-0.02837,-0.01924,-0.00497,-0.00152,-0.02815,-0.05907,0.0646,-0.03248,0.03391,-0.01413,-0.01588,-0.07529,-0.04459,-0.0808,0.00886,-0.01579,0.02444,0.08254,0.08069,-0.03242,-0.05907,-0.01895,0.03036,0.03419,-0.02626,-0.04301,-0.01253,-0.04582,-0.05907,0.05503,-0.01182]

/** Ordered merge table. The order IS the model — rank decides which pair a
    word collapses first, so this array must not be sorted or de-duplicated. */
export const BPE_MERGES: [string, string][] = [["i","n"],["e","r"],["*","*"],["e","n"],[" ","a"],["o","n"],["r","e"],[" ","t"],["o","r"],["t","i"],[" ","p"],["e","d"],[" ","s"],[" ","c"],["i","t"],["r","o"],["a","n"],["in","g"],[" ","**"],[":","**"],["d","e"],[" ","-"],["h","e"],["l","i"],["c","t"],["en","t"],["a","t"],["e","s"],[" a","n"],[" ","A"],[" ","in"],[" ","w"],["a","l"],["e","m"],[" ","("],[" ","R"],[" ","f"],["i","l"],[" ","—"],["c","e"],["s","s"],["s","t"],["ti","on"],[" ","de"],[" an","d"],["o","m"],[" t","he"],["a","r"],["i","s"],[" ","C"],[" ","W"],[" ","m"],["r","i"],["v","e"],["s",","],["a","c"],["u","s"],[" p","ro"],["a","g"],["en","d"],["e","ct"],[" ","b"],[" ","re"],[" ","L"],[" ","d"],["v","er"],[" ","M"],[" ","h"],[" w","it"],[" wit","h"],["e","t"],["l","o"],[" ","D"],["e","b"],[" ","o"],[" s","t"],["a","m"],["ac","k"],["c","h"],["e","l"],[" ","e"],[" ","on"],["a","tion"],["u","n"],[" ","E"],["#","#"],["L","M"],["f","or"],["u","r"],["e","a"],["for","m"],["h","at"],["i","g"],["in","e"],["re","ss"],["x","p"],[" ","F"],[" t","o"],["u","l"],[" ","H"],[" ","P"],["S","t"],["li","ent"],["u","il"],["u","re"],[" ","1"],[" ","I"],[" ","U"],[" ","n"],[" ","→"],[" W","eb"],[" c","lient"],["2","0"],["er","s"],["h","o"],["l","e"],["om","p"],["on","g"],[" A","P"],[" AP","I"],[" pro","j"],["'","s"],[".","j"],["a","b"],["a","il"],["e","p"],["l","y"],["o","t"],["u","t"],[" ","T"],[" ","r"],[" proj","ect"],["a","s"],["an","ce"],["an","d"],["i","p"],["m","e"],["o","w"],["on","t"],["or","k"],["us","e"],[" ","em"],[" ","v"],[" **","P"],[" L","LM"],[" o","f"],["a","in"],["an","ag"],["ar","d"],["e","v"],["i","de"],["t","o"],[" ","+"],[" ","y"],[" R","ea"],[" Rea","ct"],[" e","xp"],[" p","er"],[" t","r"],["0","0"],["ag","e"],["d","ing"],["d","u"],["em","ent"],["en","ce"],["f","er"],["g","ine"],["li","ver"],["o","l"],["o","st"],["s",":**"],[" ","G"],[" ","end"],[" **","A"],[" **","M"],[" R","E"],[" a","c"],[" b","uil"],[" f","or"],[" h","and"],[" m","o"],[" pro","du"],["20","2"],["G","P"],["a","j"],["an","s"],["b","l"],["ch","it"],["chit","ect"],["chitect","ure"],["d","a"],["er","aj"],["er","ing"],["es","t"],["et","ri"],["h","t"],["he","eraj"],["i","f"],["k","e"],["l","a"],["li","ve"],["lo","p"],["m","er"],["or","d"],["r","chitecture"],["ti","me"],["ve","lop"],[" ","B"],[" ","N"],[" ","it"],[" **","St"],[" **A","rchitecture"],[" **Architecture",":**"],[" **M","etri"],[" **Metri","c"],[" **Metric","s:**"],[" **P","ro"],[" **Pro","bl"],[" **Probl","em"],[" **Problem",":**"],[" A","I"],[" D","e"],[" RE","S"],[" RES","T"],[" W","ord"],[" Word","P"],[" WordP","ress"],[" ac","ro"],[" acro","ss"],[" c","omp"],[" de","liver"],[" em","b"],[" emb","ed"],[" project","s"],[" r","un"],[" s","p"],[" t","h"],[" w","ork"],["-","s"],[".j","s"],["D","B"],["L","LM"],["a","ti"],["b","o"],["c","om"],["c","tion"],["e","ar"],["ea","d"],["en","c"],["hat","'s"],["i","r"],["in","t"],["l","ing"],["mer","ce"],["or","t"],["p","p"],["p","t"],["q","u"],["re","am"],["s","er"],["s","it"],["t","er"],["t","ri"],["ul","l"],["y",","],[" ","\""],[" ","S"],[" ","V"],[" ","en"],[" ","g"],[" ","l"],[" **","W"],[" E","xp"],[" Exp","ress"],[" M","ong"],[" Mong","o"],[" Mongo","DB"],[" a","g"],[" c","ont"],[" client","s"],[" end","-"],[" end-","to"],[" end-to","-"],[" end-to-","end"],[" f","re"],[" f","ro"],[" fro","m"],[" m","anag"],[" n","o"],[" p","age"],["0","+"],["A","G"],["GP","U"],["ar","y"],["as","h"],["ash","bo"],["ashbo","ard"],["c","ri"],["e","ed"],["e","x"]]

/** Every character the training corpus contained. Anything outside this set
    is out-of-vocabulary and the tokeniser says so rather than pretending. */
export const BPE_BASE_CHARS: string[] = [" ","\"","#","%","&","'","(",")","*","+",",","-",".","/","0","1","2","3","4","5","6","7","8","9",":",";","?","@","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","Y","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","~","–","—","→"]

/** Base characters followed by every merged token, in learning order. */
export const BPE_VOCAB: string[] = [" ","\"","#","%","&","'","(",")","*","+",",","-",".","/","0","1","2","3","4","5","6","7","8","9",":",";","?","@","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","Y","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","~","–","—","→","in","er","**","en"," a","on","re"," t","or","ti"," p","ed"," s"," c","it","ro","an","ing"," **",":**","de"," -","he","li","ct","ent","at","es"," an"," A"," in"," w","al","em"," ("," R"," f","il"," —","ce","ss","st","tion"," de"," and","om"," the","ar","is"," C"," W"," m","ri","ve","s,","ac","us"," pro","ag","end","ect"," b"," re"," L"," d","ver"," M"," h"," wit"," with","et","lo"," D","eb"," o"," st","am","ack","ch","el"," e"," on","ation","un"," E","##","LM","for","ur","ea","form","hat","ig","ine","ress","xp"," F"," to","ul"," H"," P","St","lient","uil","ure"," 1"," I"," U"," n"," →"," Web"," client","20","ers","ho","le","omp","ong"," AP"," API"," proj","'s",".j","ab","ail","ep","ly","ot","ut"," T"," r"," project","as","ance","and","ip","me","ow","ont","ork","use"," em"," v"," **P"," LLM"," of","ain","anag","ard","ev","ide","to"," +"," y"," Rea"," React"," exp"," per"," tr","00","age","ding","du","ement","ence","fer","gine","liver","ol","ost","s:**"," G"," end"," **A"," **M"," RE"," ac"," buil"," for"," hand"," mo"," produ","202","GP","aj","ans","bl","chit","chitect","chitecture","da","eraj","ering","est","etri","ht","heeraj","if","ke","la","live","lop","mer","ord","rchitecture","time","velop"," B"," N"," it"," **St"," **Architecture"," **Architecture:**"," **Metri"," **Metric"," **Metrics:**"," **Pro"," **Probl"," **Problem"," **Problem:**"," AI"," De"," RES"," REST"," Word"," WordP"," WordPress"," acro"," across"," comp"," deliver"," emb"," embed"," projects"," run"," sp"," th"," work","-s",".js","DB","LLM","ati","bo","com","ction","ear","ead","enc","hat's","ir","int","ling","merce","ort","pp","pt","qu","ream","ser","sit","ter","tri","ull","y,"," \""," S"," V"," en"," g"," l"," **W"," Exp"," Express"," Mong"," Mongo"," MongoDB"," ag"," cont"," clients"," end-"," end-to"," end-to-"," end-to-end"," fre"," fro"," from"," manag"," no"," page","0+","AG","GPU","ary","ash","ashbo","ashboard","cri","eed","ex"]

/** Measured on the training corpus at build time, for the instrument to cite. */
export const BPE_STATS = {
  chunks: 23,
  merges: 300,
  vocabSize: 382,
  corpusChars: 10444,
  corpusTokens: 4896,
  charsPerToken: 2.133,
} as const
