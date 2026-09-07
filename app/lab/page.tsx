import type { Metadata } from 'next'
import { Container, ButtonLink, Meta, Section, Surface } from '@/components/primitives'
import { EmbeddingMap } from '@/components/lab/EmbeddingMap'
import { Sampling } from '@/components/lab/Sampling'
import { Tokenizer } from '@/components/lab/Tokenizer'
import { LAB_POINTS, BPE_STATS, PCA_EXPLAINED_VARIANCE } from '@/content/lab-data'

/* ==========================================================================
   LAB

   This page used to be an honest "not open yet", which was the right call
   while there was nothing real to put here. There is now: three instruments
   that run genuine computation on this site's own content.

   ── WHY THIS IS INDEXED AND THE PLACEHOLDER WAS NOT ────────────────────────
   The placeholder was `noindex` because an empty page in the primary
   navigation dilutes a small site's search presence. That reasoning inverts
   the moment the page carries something no other page has. It is now the most
   distinctive URL on the domain, so it is indexed.

   ── WHY STACKED AND NOT PINNED ─────────────────────────────────────────────
   These three were also a pinned, tab-switched block on the homepage until
   three acts, because there they are one argument told in order. Here they are
   three tools someone arrived to use, quite possibly from a search result
   aimed at one of them. Three headings and three panels means every instrument
   is linkable, all of them are on screen for Cmd-F, and none of them is behind
   a scroll gesture. The interaction should follow the intent, and the intent
   on this URL is different.
   ========================================================================== */

export const metadata: Metadata = {
  title: 'Lab',
  description:
    'Three live instruments: a byte-pair tokeniser trained on this site, a PCA projection of its real embeddings, and softmax sampling with temperature and top-p. Real computation, no wrapper.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/lab' },
}

const INSTRUMENTS = [
  {
    id: 'tokenizer',
    index: '01',
    heading: 'Tokenisation',
    lead: 'A model never sees your sentence. It sees integers from a learned vocabulary — and this one learned from nothing but the 23 chunks of content on this website.',
    node: <Tokenizer />,
  },
  {
    id: 'embeddings',
    index: '02',
    heading: 'Embedding space',
    lead: `Every chunk of this site as a point in 384 dimensions, flattened to two by principal component analysis. The two axes hold ${(
      PCA_EXPLAINED_VARIANCE * 100
    ).toFixed(1)}% of the variance, and the instrument says so rather than implying the picture is the whole truth.`,
    node: <EmbeddingMap />,
  },
  {
    id: 'sampling',
    index: '03',
    heading: 'Sampling',
    lead: 'Temperature and top-p, over a fixed set of logits. The distribution, the nucleus, the entropy and the draw are all real — only the logits are hand-set.',
    node: <Sampling />,
  },
]

export default function LabPage() {
  return (
    <Section className="pt-32 sm:pt-40">
      <Container>
        <Meta className="mb-6 block">Lab</Meta>
        <h1 className="text-h1 max-w-3xl font-medium text-ink">
          Anyone can bolt a chatbot onto a website.
        </h1>
        <p className="text-body-lg mt-6 max-w-2xl text-ink-2">
          Understanding what happens inside one is a different job. These three instruments run
          the real arithmetic — the same tokeniser, the same projection and the same sampling a
          language model does — on this site's own {LAB_POINTS.length} chunks of content. Where
          something is approximated, it says so on screen.
        </p>

        <div className="mt-16 space-y-14">
          {INSTRUMENTS.map((instrument) => (
            <section key={instrument.id} aria-labelledby={`${instrument.id}-heading`}>
              <div className="mb-6">
                <Meta className="mb-3 block">{instrument.index}</Meta>
                <h2
                  id={`${instrument.id}-heading`}
                  className="text-h3 font-medium text-ink"
                >
                  {instrument.heading}
                </h2>
                <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-2">
                  {instrument.lead}
                </p>
              </div>
              <Surface level={2} className="p-5 sm:p-7">
                {instrument.node}
              </Surface>
            </section>
          ))}
        </div>

        <Surface level={1} className="mt-16 max-w-2xl p-6 sm:p-8">
          <h2 className="text-[1.0625rem] font-medium text-ink">How this was built</h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">
            The embeddings are real bge-small-en-v1.5 vectors from this site's retrieval index.
            The projection is principal component analysis implemented from scratch — power
            iteration on the {LAB_POINTS.length}×{LAB_POINTS.length} Gram matrix, then
            deflation — and the byte-pair merge table was trained here too:{' '}
            {BPE_STATS.merges} merges over {BPE_STATS.corpusChars.toLocaleString('en-GB')}{' '}
            characters. No machine-learning library, no tokeniser package, and nothing on this
            page fetched at runtime.
          </p>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-2">
            What is not real: nothing embeds your typed query, because doing that in the browser
            means a model download measured in tens of megabytes. The map places your text
            lexically and labels the fact plainly. The reasoning behind decisions like that one
            lives in the decision log.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/thinking">Read the decision log</ButtonLink>
            <ButtonLink href="/work" variant="ghost">
              See the work
            </ButtonLink>
          </div>
        </Surface>
      </Container>
    </Section>
  )
}
