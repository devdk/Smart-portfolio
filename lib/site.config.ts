/* ==========================================================================
   SINGLE SOURCE OF TRUTH FOR ALL PERSONAL DATA (spec §48)

   Everything a human needs to change lives in this file. No component
   hardcodes a name, a URL, a headline or a contact detail.

   Anything wrapped in [SQUARE BRACKETS] is an unfilled placeholder.
   `npm run check:content` fails the build if any remain, so placeholders
   cannot reach production by accident.
   ========================================================================== */

export const site = {
  name: 'Dheeraj Kumar',
  shortName: 'Dheeraj',
  /** Positioning. Deliberately NOT "Full Stack Developer". */
  role: 'Web & Software Developer',

  /* The hero statement. The master prompt's own suggestion, which was also
     the strongest of the options considered. Three lines, present tense,
     no hedging. */
  heroLines: ['I build', 'digital', 'products.'],
  heroSupport:
    'Websites, e-commerce experiences and custom software built around real problems.',

  /** One sentence, used in metadata and the AI-readable summary. */
  positioning:
    'I turn ideas, problems and business requirements into working digital products.',

  location: 'Gurgaon, India',
  timezone: 'Asia/Kolkata',
  timezoneLabel: 'IST',

  availability: 'Available for new projects',

  /* ---- Contact. -------------------------------------------------------- */
  email: 'okkdheeraj@gmail.com',
  links: {
    /* The CV lists no GitHub profile, so this sat as a placeholder rather than
       being inferred from the repo link on the Studio project — guessing a
       profile URL from a repo URL is still guessing. Confirmed directly when
       Dheeraj pushed this codebase to github.com/devdk, which also matches the
       Voiceover-Video-Generator repo already linked from that case study. */
    github: 'https://github.com/devdk',
    linkedin: 'https://linkedin.com/in/dheerajheree',
    resume: '/dheeraj-kumar-cv.pdf',
  },

  /* ---- Deployment. Affects canonicals, OG, sitemap and schema. ---------- */
  url: 'https://dheerajdrive.com',

  /* ---- Capabilities. Categorised, never percentages (spec §21). --------- */
  capabilities: [
    {
      title: 'Websites',
      description:
        'Marketing sites and content platforms that load fast and are easy to edit.',
      tech: ['Next.js', 'WordPress', 'React'],
    },
    {
      title: 'E-commerce',
      description:
        'Storefronts and checkout flows built to convert, on Shopify or custom.',
      tech: ['Shopify', 'Liquid', 'WooCommerce'],
    },
    {
      title: 'Web applications',
      description:
        'Custom software with real data models, auth and third-party integrations.',
      tech: ['React', 'Node.js', 'TypeScript', 'APIs'],
    },
    {
      title: 'AI & automation',
      description:
        'Practical integrations that remove manual work rather than demo well.',
      tech: ['LLM APIs', 'Webhooks', 'Automation'],
    },
  ],

  /* ---- Process (spec §25). Client-facing, so written in their terms. ---- */
  process: [
    {
      stage: 'Discover',
      what: 'Understand the business, the users and the actual problem.',
      deliverable: 'Written problem statement and success criteria.',
      clientSees: 'A call, then a short document you can disagree with.',
      mistake: 'Starting from a feature list instead of a problem.',
    },
    {
      stage: 'Define',
      what: 'Decide scope, constraints and what we are deliberately not doing.',
      deliverable: 'Scope, timeline, technology recommendation.',
      clientSees: 'A plan with trade-offs made explicit.',
      mistake: 'Leaving scope open so it can quietly grow.',
    },
    {
      stage: 'Design',
      what: 'Structure, then interface. Content and hierarchy before visuals.',
      deliverable: 'Key screens and the system behind them.',
      clientSees: 'Real layouts with real content, not lorem ipsum.',
      mistake: 'Designing screens that the data model cannot support.',
    },
    {
      stage: 'Build',
      what: 'Implement in reviewable slices, deployed continuously.',
      deliverable: 'Working software on a preview URL from week one.',
      clientSees: 'A link that updates, not a status report.',
      mistake: 'Disappearing for six weeks and returning with a reveal.',
    },
    {
      stage: 'Test',
      what: 'Real devices, real network conditions, keyboard, screen reader.',
      deliverable: 'Performance and accessibility results.',
      clientSees: 'Numbers, before and after.',
      mistake: 'Testing only on the machine it was built on.',
    },
    {
      stage: 'Ship',
      what: 'Deploy, verify, hand over documentation and access.',
      deliverable: 'Live site, docs, credentials you own.',
      clientSees: 'Launch, and everything needed to not depend on me.',
      mistake: 'Handover as an afterthought.',
    },
    {
      stage: 'Iterate',
      what: 'Measure what happened, fix what the data shows.',
      deliverable: 'Findings and a prioritised next round.',
      clientSees: 'Evidence about what to do next.',
      mistake: 'Treating launch as the finish line.',
    },
  ],

  /* ---- About (spec §30). Concrete story, no "passionate developer". ----- */
  about: {
    intro:
      'I build digital products — websites, stores and custom software. Mostly for people who have a business problem rather than a technical specification.',
    sections: [
      {
        heading: 'Where I started',
        body: 'I started in Patna in 2022, shipping websites to clients three time zones away — WordPress, WooCommerce and Shopify, mostly for people in Canada, the US and the UK. No team and no safety net, which meant scoping, building, deploying and supporting each project myself. That is also where I learned performance properly, because a slow page loses a client money and they tell you about it.',
      },
      {
        heading: 'What I build now',
        body: 'Products with real users. I moved to Gurgaon in 2023 for an MCA and spent those years building MERN products at night — dashboards, REST APIs and asset flows at Virtuoso.live, handling over a thousand requests a day. Since April 2025 I have been at Mirasphere Digital doing agency delivery in React, PHP and WordPress, and building software of my own alongside it: a practice CRM that Fordham Finance Group now runs its business on, a lead engine that reads the entire UK company register, and a pipeline that turns a script into a finished voiceover video.',
      },
      {
        heading: 'What I have learned',
        body: 'Two things, both the expensive way. First, a rule that has to be remembered in every handler will eventually be forgotten — a security audit on my own CRM code found an insecure direct object reference, and the real fix was not the handler but asserting tenant scoping structurally on all 197 routes. Second, for anything that touches historical data, the failure mode to design against is not an error but a silent success: the BrightManager importer defaults to a dry run because a migration that looks like it worked is far more dangerous than one that stops.',
      },
      {
        heading: 'What I am exploring',
        body: 'LLM engineering, from the practical end: RAG pipelines, embeddings with transformers.js, and in-browser inference with WebLLM and WebGPU. What interests me is the judgement rather than the novelty — my Meta ads analyser is deliberately rule-based, because at a few hundred ads deterministic clustering beats a model on cost, speed and being able to explain the answer. Alongside that, TypeScript and Next.js in depth, which is what this site is built in.',
      },
    ],
    timeline: [
      {
        year: '2022',
        event: 'Patna. First freelance clients — WordPress, WooCommerce, Shopify — for businesses in Canada, the US and the UK.',
      },
      {
        year: '2023',
        event: 'Gurgaon. Started an MCA at K.R. Mangalam University while continuing to deliver freelance and agency work.',
      },
      {
        year: '2024',
        event: 'Frontend developer intern at Virtuoso.live — three dashboards and five REST endpoints handling 1,000+ requests a day.',
      },
      {
        year: '2025',
        event: 'Website developer at Mirasphere Digital, and the start of building products of my own.',
      },
    ],
  },

  /* ---- CV (spec §28). Served as a real route at /cv, not a mode. -------- */
  cv: {
    summary:
      'Full-stack developer with 3+ years across freelance and agency work — WordPress, WooCommerce, Shopify and the MERN stack. Delivered 16+ freelance and 12+ agency projects for clients in Canada, the USA and the UK. Strong performance-engineering track record: raised multiple sites from Lighthouse ~40 to 85+. Currently building client-side LLM applications — RAG, and in-browser inference with WebGPU.',
    experience: [
      {
        role: 'Website Developer',
        org: 'Mirasphere Digital — onsite, Gurgaon',
        period: 'Apr 2025 — Present',
        points: [
          'Delivered 7+ end-to-end web projects spanning ReactJS, PHP and WordPress — UI development through deployment and post-launch support.',
          'Built custom WordPress solutions with custom PHP, Advanced Custom Fields and Elementor.',
          'Developed ReactJS interfaces with a reusable component architecture used across multiple client projects.',
          'Worked with designers and PMs in an agency environment, maintaining delivery timelines across simultaneous projects.',
        ],
      },
      {
        role: 'Freelance Full-Stack Developer',
        org: 'Independent — remote',
        period: 'Jun 2022 — Apr 2025',
        points: [
          'Managed 16+ end-to-end freelance projects and 12+ agency collaborations for clients in Canada, the USA and the UK, using WordPress, WooCommerce, Shopify and Bootstrap.',
          'Improved page speed by 60% through asset optimisation and LCP/CLS work, measured in GTmetrix and Lighthouse.',
          'Maintained domain, DNS and hosting for 20+ client websites at 99.9% uptime.',
        ],
      },
      {
        role: 'Frontend Developer Intern',
        org: 'Virtuoso.live — remote',
        period: 'Jul 2024 — Apr 2025',
        points: [
          'Engineered 3 interactive dashboards — artists, assets and event management — with React, Express and MongoDB.',
          'Built and deployed 5 RESTful API endpoints handling 1,000+ requests a day, covering asset creation, purchase and profile management.',
          'Contributed to 4 Agile sprint cycles and resolved 10+ live production bugs found in post-event trials.',
        ],
      },
    ],
    education: [
      {
        qualification: 'MCA — 7.2/10 CGPA',
        org: 'K.R. Mangalam University, Gurugram',
        period: '2023 — 2025',
      },
      {
        qualification: 'BCA — 8.2/10 CGPA',
        org: 'Aryabhatta Knowledge University, Patna',
        period: '2020 — 2023',
      },
    ],
    skillGroups: [
      {
        group: 'Expert',
        items: [
          'JavaScript',
          'React',
          'HTML/CSS',
          'WordPress (custom PHP, ACF, Elementor)',
          'Performance optimisation (Lighthouse, Core Web Vitals)',
        ],
      },
      {
        group: 'Working',
        items: [
          'Node.js',
          'Express',
          'MongoDB',
          'PHP',
          'Tailwind CSS',
          'Shopify',
          'WooCommerce',
          'Strapi',
          'REST API design',
        ],
      },
      {
        group: 'Current focus',
        items: [
          'TypeScript',
          'Next.js',
          'LLM engineering',
          'RAG pipelines',
          'In-browser inference (WebLLM/WebGPU)',
          'Embeddings (transformers.js)',
        ],
      },
      { group: 'Tools', items: ['Git', 'GitHub', 'Figma', 'Postman'] },
    ],

    /* ---- Logistics ------------------------------------------------------
       The questions a recruiter asks first, and the only part of this file
       that cannot be answered from evidence. Location is a fact; work
       preference, visa status, notice period and role focus are Dheeraj's
       to state, so they stay as bracketed placeholders and
       `npm run check:content` keeps reporting them until he does.

       These are deliberately NOT rendered anywhere yet — the /cv route is
       out of scope for this content pass. Wire them into a Block on
       app/cv/page.tsx once the values are real. */
    logistics: [
      { label: 'Current location', value: 'Gurgaon, India' },
      { label: 'Work preference', value: '[TO CONFIRM — REMOTE / HYBRID / ONSITE / RELOCATION]' },
      { label: 'Open to roles in', value: '[TO CONFIRM — INDIA ONLY, OR UK/US REMOTE]' },
      { label: 'Visa / work authorisation', value: '[TO CONFIRM]' },
      { label: 'Notice period', value: '[TO CONFIRM]' },
      {
        label: 'Salary expectations',
        value: 'Discussed at offer stage. [TO CONFIRM THIS IS THE STANCE]',
      },
      { label: 'Preferred roles', value: '[TO CONFIRM — FRONTEND, FULL-STACK OR AI PRODUCT]' },
    ],
  },

  /* ---- Build With Me qualifier (spec §26) ------------------------------- */
  qualifier: {
    productTypes: [
      'Website',
      'E-commerce',
      'Web application',
      'Shopify',
      'WordPress',
      'AI product',
      'Automation',
      'Something else',
    ],
    challenges: [
      'Speed',
      'Design',
      'Conversion',
      'Scalability',
      'Development capacity',
      'A legacy system',
      'Not sure yet',
    ],
    stages: ['An idea', 'Planning', 'An existing product', 'A redesign', 'Broken, needs fixing'],
    timelines: ['As soon as possible', '1–2 months', '3–6 months', 'Flexible'],
  },
} as const

export type Site = typeof site

/* Build stamp. This is what makes staleness VISIBLE, which is the mitigation
   for the single highest-likelihood risk on this project.

   Every value is a build-time constant inlined by next.config.ts. Nothing
   here calls `new Date()` at render time — under Cache Components that would
   be an unstable value and would (correctly) fail the prerender. */
export const build = {
  sha: (process.env.COMMIT_SHA || 'local').slice(0, 7),
  ref: process.env.COMMIT_REF || 'dev',
  /** ISO string, stamped when the bundle was built. */
  builtAt: process.env.BUILD_TIME ?? '',
  /** Copyright year, from the build. */
  year: process.env.BUILD_YEAR ?? '',

  /* The origin this build is actually served from. Falls back to the
     production domain, so a local build behaves exactly as production does. */
  origin: (process.env.SITE_ORIGIN || site.url).replace(/\/$/, ''),

  /* False when this build was allowed to ship with [BRACKETED] placeholders.
     Every indexing signal on the site derives from this one flag rather than
     each being remembered separately — robots.txt, the sitemap and the root
     metadata all read it, so they cannot disagree with each other. */
  indexable: process.env.ALLOW_PLACEHOLDERS !== '1',
} as const
