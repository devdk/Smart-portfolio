import { Hero } from '@/components/sections/Hero'
import { Capabilities } from '@/components/sections/Capabilities'
import { WorkShowcase } from '@/components/sections/WorkShowcase'
import { ThinkingTeaser } from '@/components/sections/ThinkingTeaser'
import { Process } from '@/components/sections/Process'
/* Not dynamically imported, unlike the two below, and deliberately: this
   section is a SERVER component whose only client code is one small island
   (components/sections/AskConsole.tsx). There is no bundle to defer here — the
   part worth deferring is the BM25 index, and the island fetches that on first
   use rather than on page load. Deferring the section as well would delay the
   server-rendered form for no saving. */
import { AskPortfolio } from '@/components/sections/AskPortfolio'
import dynamic from 'next/dynamic'


/* Below the fold and the largest client component on the page, so it is
   dynamically imported. `ssr: true` keeps it in the server-rendered HTML for
   crawlers and for anyone who lands with JS still loading. */
const BuildWithMe = dynamic(() =>
  import('@/components/sections/BuildWithMe').then((m) => ({ default: m.BuildWithMe })),
)

/* ==========================================================================
   HOME — the argument, in five moves.

   The order is LOCKED and identical for every visitor. The brief proposed an
   audience router that reordered sections from session state; that produces
   URLs which do not reproduce what the visitor saw, which breaks sharing,
   caching, SEO and testing. Audiences are served instead by persistent
   routes (/work, /thinking, /cv) and by the command palette.

     1. Hero            — what I build
     2. Capabilities    — what kind of problems
     3. Work            — could you solve mine?
     4. Thinking        — how do you think?      <- the differentiator
     5. Process         — what is it like to work with you?
     6. The machine     — do you understand what you are selling?
     7. Ask my portfolio— the same corpus, answering questions
     8. Build with me   — the terminal CTA

   The Lab was deliberately absent from V1: a teaser linking to an empty page
   is worse than no teaser. /lab now runs three real instruments, so the
   section earns its place — and it goes AFTER Process rather than after Work,
   because it is a credibility proof rather than a portfolio item. By the time
   a visitor reaches it they already know what gets built and how; this answers
   whether the person building it understands the machine underneath.

   Ask my portfolio follows it directly, and the order between those two is not
   arbitrary either. The Lab shows the mechanism — tokens, vectors, sampling —
   and only then does the site offer a box that looks like a chatbot. A visitor
   who has just watched the parts being explained is in a position to notice
   what this one is honest about NOT doing.
   ========================================================================== */

export default function Home() {
  return (
    <>
      <Hero />
      <Capabilities />
      <WorkShowcase />
      <ThinkingTeaser />
      <Process />
      <AskPortfolio />
      <BuildWithMe />
    </>
  )
}
