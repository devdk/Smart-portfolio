'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Container,
  Meta,
  Section,
  SectionHeading,
  Surface,
  cx,
} from '@/components/primitives'
import { EmbeddingMap } from '@/components/lab/EmbeddingMap'
import { Sampling } from '@/components/lab/Sampling'
import { Tokenizer } from '@/components/lab/Tokenizer'

/* ==========================================================================
   THE MACHINE — three live instruments, in three acts

   Anyone can bolt a chatbot onto a website. The claim this section makes is
   narrower and harder to fake: that the person who built the site understands
   what happens between a sentence going in and a sentence coming out. So the
   three acts are the three steps — text becomes tokens, tokens become
   vectors, vectors become a choice — and each one is a working instrument
   rather than a diagram of one.

   ── WHY STICKY AND NOT A SCROLL PIN ────────────────────────────────────────
   The obvious build is GSAP ScrollTrigger with `pin: true`. That means a
   library in the bundle, a wrapper element injected around the section, a
   scroll listener holding the panel in place every frame, and a pin that has
   to be refreshed on resize, on font load, and whenever the sticky nav
   changes height. `position: sticky` is four lines of CSS that the compositor
   handles, survives resize with no refresh, and cannot desynchronise from the
   scrollbar because it IS the scrollbar.

   JavaScript is then left with the one job CSS genuinely cannot do: deciding
   which act is showing. That is a single getBoundingClientRect, throttled to
   one animation frame, on a passive listener — and it is skipped entirely
   when the section is not pinned.

   ── WHY THERE IS ONLY ONE DOM TREE ─────────────────────────────────────────
   Below 1024px, or for anyone who has asked for reduced motion, this is not
   pinned: it is the same tablist pattern as components/sections/Process.tsx
   (role=tablist / tab / tabpanel, arrow keys, Home and End, focus following
   selection). Rather than render a pinned tree and a tabbed tree and hide one,
   the tablist semantics are written once and the pinning is layered on top by
   the media query in styles/theme.css. One tree means one set of ids, one
   instance of each instrument, and no possibility of the two layouts drifting
   apart.

   The section id is `chapter-machine` so lib/chapters.ts re-tints the whole
   interface violet while you are in here — including the dots on the
   embedding map, which read the live accent from computed style.
   ========================================================================== */

/** The one definition of "pinned". styles/theme.css contains the identical
    condition; if one changes, change both. */
const PINNED_QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

type Act = {
  id: string
  label: string
  title: string
  blurb: string
  instrument: ReactNode
}

const ACTS: Act[] = [
  {
    id: 'tokens',
    label: 'Tokens',
    title: 'First, your sentence stops being a sentence.',
    blurb:
      'A model never sees words. It sees integers from a vocabulary that was learned, not designed — and what that vocabulary happens to contain decides what your text costs.',
    instrument: <Tokenizer />,
  },
  {
    id: 'embeddings',
    label: 'Vectors',
    title: 'Then meaning becomes geometry.',
    blurb:
      'Every chunk of this site is a point in 384 dimensions, positioned so that things which mean similar things sit near each other. Retrieval is just measuring that distance.',
    instrument: <EmbeddingMap />,
  },
  {
    id: 'sampling',
    label: 'Choice',
    title: 'And then it picks one.',
    blurb:
      'The model does not produce a word, it produces a distribution over every word. Temperature and top-p are the two dials that turn that distribution into a decision.',
    instrument: <Sampling />,
  },
]

export function Lab() {
  const [active, setActive] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  /* Scroll position selects the act — but only while pinned, and only ever one
     rect read per animation frame. */
  useEffect(() => {
    /* Bound to a const first: `if (!trackRef.current) return` does not narrow
       inside a nested function at all, and even a narrowed const does not stay
       narrowed inside a HOISTED `function` declaration — TypeScript cannot
       prove the guard ran before the call. Arrow consts declared after the
       guard do keep the narrowing, which is why these are written this way. */
    const track = trackRef.current
    if (!track) return

    const media = window.matchMedia(PINNED_QUERY)
    let pinned = media.matches
    let frame = 0

    const read = () => {
      frame = 0
      const rect = track.getBoundingClientRect()
      // How far the sticky panel travels before the track leaves the viewport.
      const travel = rect.height - window.innerHeight
      if (travel <= 0) return
      const progress = Math.min(Math.max(-rect.top / travel, 0), 1)
      // progress 1 must land on the last act, not one past it.
      const index = Math.min(ACTS.length - 1, Math.floor(progress * ACTS.length))
      setActive(index)
    }

    const onScroll = () => {
      if (!pinned || frame !== 0) return
      frame = requestAnimationFrame(read)
    }

    const onMediaChange = () => {
      pinned = media.matches
      // Leaving pinned mode leaves whichever act was showing selected, which
      // is the right thing: the visitor's place in the section is preserved.
      if (pinned) read()
    }

    media.addEventListener('change', onMediaChange)
    window.addEventListener('scroll', onScroll, { passive: true })
    if (pinned) read()

    return () => {
      media.removeEventListener('change', onMediaChange)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  /**
   * Selecting an act by click or keyboard. While pinned, scroll position is
   * the source of truth, so the window has to move too — otherwise the next
   * scroll event would immediately overrule the choice and the tabs would look
   * broken. `behavior: 'auto'` deliberately: this codebase does not hijack
   * scrolling with smooth behaviour.
   */
  function select(index: number) {
    setActive(index)
    const track = trackRef.current
    if (!track || !window.matchMedia(PINNED_QUERY).matches) return
    const travel = track.offsetHeight - window.innerHeight
    if (travel <= 0) return
    const top = track.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + travel * ((index + 0.5) / ACTS.length), behavior: 'auto' })
  }

  /* Lifted verbatim from Process.tsx, including handling both axes. The rail is
     a column at desktop widths and a row below them, so there is no single
     correct aria-orientation to declare — supporting both arrow pairs is the
     honest answer rather than lying about the layout. */
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    let next: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (active + 1) % ACTS.length
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      next = (active - 1 + ACTS.length) % ACTS.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = ACTS.length - 1

    if (next !== null) {
      event.preventDefault()
      select(next)
      const tabs = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      tabs[next]?.focus()
    }
  }

  return (
    <Section id="chapter-machine" aria-labelledby="lab-heading">
      <Container>
        <SectionHeading
          index="05 — The machine"
          id="lab-heading"
          title="Anyone can bolt a chatbot onto a website."
          lead="Understanding what happens inside one is a different job. These three instruments run the real arithmetic — on this site's own content — so you can see the parts a wrapper hides."
        />
      </Container>

      <div ref={trackRef} className="lab-track">
        <div className="lab-stage">
          <Container>
            <div className="grid gap-6 lg:grid-cols-[10rem_1fr] lg:gap-10">
              {/* The act rail. */}
              <div
                role="tablist"
                aria-label="Instruments"
                onKeyDown={onKeyDown}
                className="flex flex-wrap gap-2 lg:flex-col lg:gap-1 lg:pt-1"
              >
                {ACTS.map((act, index) => {
                  const selected = index === active
                  return (
                    <button
                      key={act.id}
                      role="tab"
                      id={`lab-tab-${act.id}`}
                      aria-selected={selected}
                      aria-controls={`lab-panel-${act.id}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => select(index)}
                      className={cx(
                        'flex items-center gap-2.5 rounded-full border px-4 py-2 font-mono text-[0.75rem] tracking-[0.06em] uppercase',
                        'transition-colors duration-[var(--duration-micro)] lg:rounded-[var(--radius-sm)]',
                        selected
                          ? 'border-accent/40 bg-accent/10 text-accent'
                          : 'border-hairline bg-white/[0.02] text-ink-3 hover:border-hairline-strong hover:text-ink-2',
                      )}
                    >
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <span>{act.label}</span>
                    </button>
                  )
                })}

                <Meta as="p" className="mt-3 hidden lg:block">
                  scroll to move
                </Meta>
              </div>

              {/* The stage. All three acts live here; the media query in
                  theme.css decides whether they stack into one grid cell and
                  cross-fade, or whether only the selected one is in flow. */}
              <div className="lab-stage-inner">
                {ACTS.map((act, index) => {
                  const selected = index === active
                  return (
                    <Surface
                      key={act.id}
                      level={2}
                      id={`lab-panel-${act.id}`}
                      role="tabpanel"
                      aria-labelledby={`lab-tab-${act.id}`}
                      tabIndex={selected ? 0 : -1}
                      data-active={selected ? 'true' : 'false'}
                      /* `inert` rather than aria-hidden: while an act is faded
                         out in pinned mode it must be unreachable by pointer,
                         by tab and by assistive technology at once, and inert
                         is the one attribute that means all three. aria-hidden
                         alone would leave its inputs tabbable. */
                      inert={!selected}
                      className="lab-act p-5 sm:p-7"
                    >
                      <Meta className="mb-2 block">
                        Act {String(index + 1).padStart(2, '0')}
                      </Meta>
                      <h3 className="text-h3 max-w-xl font-medium text-ink">{act.title}</h3>
                      <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-2">
                        {act.blurb}
                      </p>
                      <div className="mt-7 border-t border-hairline pt-7">{act.instrument}</div>
                    </Surface>
                  )
                })}
              </div>
            </div>
          </Container>
        </div>
      </div>
    </Section>
  )
}
