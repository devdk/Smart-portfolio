import { HeroFlowParallax } from './HeroFlowParallax'

/* ==========================================================================
   HERO FLOW  (spec §10)

   The one interactive visual on the site. It represents the pipeline the
   whole portfolio is arguing about:

     Idea -> Strategy -> Design -> Code -> Product -> Users

   Why this and not a particle field or a 3D scene: it says something. The
   brief itself warned against "a giant particle system that destroys
   performance" and against adding 3D "merely because it is technically
   possible". A labelled pipeline communicates the positioning — I take an
   idea and return a product people use. A particle cloud communicates only
   that the author can install a library.

   This is a SERVER component. The breathing nodes and travelling pulses are
   CSS keyframes (see theme.css), so the entire visual costs zero JavaScript
   and renders identically without it. Only the optional cursor parallax is a
   client island, and it is a single transform on a single group.
   ========================================================================== */

const STAGES = [
  { id: 'idea', label: 'Idea' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'design', label: 'Design' },
  { id: 'code', label: 'Code' },
  { id: 'product', label: 'Product' },
  { id: 'users', label: 'Users' },
] as const

const W = 900
const H = 260
const PAD = 70
const STEP = (W - PAD * 2) / (STAGES.length - 1)

export function HeroFlow() {
  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="How I work: an idea becomes strategy, then design, then code, then a product, then something people use."
      >
        <defs>
          <linearGradient id="flow-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00E2E4" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#00E2E4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00E2E4" stopOpacity="0.05" />
          </linearGradient>
          <radialGradient id="node-fill">
            <stop offset="0%" stopColor="#00E2E4" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#00E2E4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00E2E4" stopOpacity="0" />
          </radialGradient>
        </defs>

        <HeroFlowParallax>
          <line
            x1={PAD}
            y1={H / 2}
            x2={W - PAD}
            y2={H / 2}
            stroke="url(#flow-line)"
            strokeWidth="1.5"
          />

          {/* Travelling pulses. Each animates `translateX` by exactly one
              segment via a CSS custom property, staggered so a single packet
              appears to move down the whole pipeline. */}
          {STAGES.slice(0, -1).map((stage, i) => (
            <circle
              key={`pulse-${stage.id}`}
              data-pulse
              cx={PAD + i * STEP}
              cy={H / 2}
              r="2.5"
              fill="#00E2E4"
              opacity="0"
              style={
                {
                  '--pulse-index': i,
                  '--pulse-distance': `${STEP}px`,
                } as React.CSSProperties
              }
            />
          ))}

          {STAGES.map((stage, i) => {
            const x = PAD + i * STEP
            const y = H / 2
            const isEnd = i === 0 || i === STAGES.length - 1
            return (
              <g key={stage.id}>
                <circle cx={x} cy={y} r="26" fill="url(#node-fill)" opacity="0.28" />
                <circle
                  data-node
                  cx={x}
                  cy={y}
                  r={isEnd ? 9 : 6.5}
                  fill="#08090A"
                  stroke="#00E2E4"
                  strokeWidth={isEnd ? 1.6 : 1.2}
                  opacity="0.75"
                  style={{ '--node-index': i } as React.CSSProperties}
                />
                {isEnd ? <circle cx={x} cy={y} r="3" fill="#00E2E4" /> : null}

                <text
                  x={x}
                  y={y + 44}
                  textAnchor="middle"
                  className="fill-[#8A9299] font-mono"
                  style={{ fontSize: '13px', letterSpacing: '0.08em' }}
                >
                  {stage.label.toUpperCase()}
                </text>
              </g>
            )
          })}
        </HeroFlowParallax>
      </svg>
    </div>
  )
}
