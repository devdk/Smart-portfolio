/* ==========================================================================
   REVEAL — IntersectionObserver, ~1 KB, no animation library

   WHY NOT GSAP: measurement. GSAP core + ScrollTrigger cost 43.5 KB gzip in
   the first-load bundle of EVERY route, and the only thing V1 asked of them
   was fade-up-on-scroll, a hero entrance and a breathing SVG. All three are
   CSS keyframes with an IntersectionObserver to trigger them. The saving is
   roughly a third of the page's JavaScript for a visually identical result.

   The project's own rule was "if a fancy animation makes the site slower or
   harder to understand, remove the animation". The corollary is that if a
   library is not earning its bytes, remove the library. GSAP stays in
   package.json for the V2 pinned Work transition and the interactive
   architecture diagram, where the timeline API genuinely pays for itself —
   and it will be dynamically imported there so it never re-enters the
   critical path.

   This module is written so it can never hide content:
     - elements are pre-hidden by CSS only under `html.js` AND
       (prefers-reduced-motion: no-preference)
     - if IntersectionObserver is missing, everything is revealed immediately
     - the observer disconnects after firing, so there is no persistent
       scroll listener
   ========================================================================== */

const REVEALED = 'is-revealed'

export function initReveals(root: ParentNode = document): () => void {
  const groups = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal-group]'))
  const singles = Array.from(
    root.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal-group] [data-reveal])'),
  )

  const targets: HTMLElement[] = [...groups, ...singles]
  if (!targets.length) return () => {}

  // No IntersectionObserver (or a very old browser): show everything now.
  if (typeof IntersectionObserver === 'undefined') {
    for (const el of targets) {
      el.classList.add(REVEALED)
      el.querySelectorAll<HTMLElement>('[data-reveal]').forEach((child) =>
        child.classList.add(REVEALED),
      )
    }
    return () => {}
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement

        // A group staggers its children via --reveal-index; a standalone
        // element just reveals itself.
        const children = el.hasAttribute('data-reveal-group')
          ? Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'))
          : []

        if (children.length) {
          children.forEach((child, i) => {
            // Stagger capped at 60ms over 6 items — beyond that it reads as
            // slow rather than choreographed.
            child.style.setProperty(
              '--reveal-delay',
              `${Math.min(i, 6) * Math.min(60, 360 / children.length)}ms`,
            )
            child.classList.add(REVEALED)
          })
        } else {
          el.classList.add(REVEALED)
        }

        observer.unobserve(el)
      }
    },
    // Fire slightly before the element is fully in view so the animation
    // completes around the time the reader arrives at it.
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  )

  for (const el of targets) observer.observe(el)

  /* SAFETY NET.

     Hiding content behind an animation is the one failure mode that is never
     acceptable, and an IntersectionObserver has more ways to not fire than it
     looks: an ancestor with `overflow: hidden` and no height, a browser quirk,
     a layout that settles after the observation was registered.

     After 1.2s this reveals anything the visitor should ALREADY be able to
     see — elements whose top edge is at or above the bottom of the viewport —
     and nothing else. Revealing the whole document instead would fix the bug
     and destroy the effect, since everything further down would be visible
     before it was ever scrolled to. Elements below the fold stay with the
     observer and behave normally.

     In the healthy case this finds nothing, because those elements were
     revealed and unobserved within a frame of load. */
  const failsafe = window.setTimeout(() => {
    const viewportBottom = window.innerHeight

    const rescue = (el: HTMLElement) => {
      if (el.classList.contains(REVEALED)) return
      if (el.getBoundingClientRect().top <= viewportBottom) {
        el.classList.add(REVEALED)
      }
    }

    for (const el of targets) {
      rescue(el)
      el.querySelectorAll<HTMLElement>('[data-reveal]').forEach(rescue)
    }
  }, 1200)

  return () => {
    observer.disconnect()
    window.clearTimeout(failsafe)
  }
}

/* --------------------------------------------------------------------------
   MAGNETIC BUTTON — vanilla, transform-only.

   Replaces gsap.quickTo() with a small rAF lerp. Pointer-fine only, and it
   drops will-change on leave so we are not permanently promoting a layer we
   are not animating.
   -------------------------------------------------------------------------- */

export function attachMagnetic(el: HTMLElement, strength = 0.2): () => void {
  if (typeof window === 'undefined') return () => {}
  if (!window.matchMedia('(pointer: fine)').matches) return () => {}
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  let raf = 0
  let targetX = 0
  let targetY = 0
  let x = 0
  let y = 0
  let running = false

  function tick() {
    x += (targetX - x) * 0.18
    y += (targetY - y) * 0.18
    el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`

    // Stop the loop once settled at rest — no idle rAF burning frames.
    if (Math.abs(targetX - x) < 0.05 && Math.abs(targetY - y) < 0.05 && targetX === 0 && targetY === 0) {
      el.style.transform = ''
      el.style.willChange = 'auto'
      running = false
      return
    }
    raf = requestAnimationFrame(tick)
  }

  function start() {
    if (running) return
    running = true
    el.style.willChange = 'transform'
    raf = requestAnimationFrame(tick)
  }

  function onMove(event: PointerEvent) {
    const rect = el.getBoundingClientRect()
    targetX = (event.clientX - (rect.left + rect.width / 2)) * strength
    targetY = (event.clientY - (rect.top + rect.height / 2)) * strength
    start()
  }

  function onLeave() {
    targetX = 0
    targetY = 0
    start()
  }

  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)

  return () => {
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
    cancelAnimationFrame(raf)
    el.style.transform = ''
    el.style.willChange = 'auto'
  }
}
