import { z } from 'zod'
import { NextResponse } from 'next/server'

/* ==========================================================================
   CONTACT ENDPOINT  (spec §53)

   Security posture for a public, unauthenticated write endpoint:

   1. VALIDATED — Zod parses the body. Anything unexpected is rejected with
      400 before it reaches any downstream service.
   2. RATE LIMITED — a fixed window per IP. This is an in-memory limiter,
      which is correct for a single-region deployment and honest about its
      limitation: it does not survive a cold start and does not coordinate
      across instances. If this site ever runs multi-region, swap the store
      for Upstash/Redis — the interface below is deliberately small so that
      is a one-function change.
   3. LENGTH CAPPED — every string has a max, so a large body cannot be used
      to exhaust memory.
   4. HONEYPOT — a field real users never fill.
   5. NO SECRETS IN CODE — delivery uses an env var, and the route degrades
      to logging rather than crashing if it is absent.

   Note: this deliberately does not echo submitted content back in the
   response, and never includes the raw body in an error message.
   ========================================================================== */

const submissionSchema = z.object({
  productType: z.string().max(80).optional().default(''),
  challenge: z.string().max(80).optional().default(''),
  stage: z.string().max(80).optional().default(''),
  timeline: z.string().max(80).optional().default(''),
  description: z.string().max(4000).optional().default(''),
  email: z.string().email().max(200).optional(),
  /** Honeypot. Must be empty. */
  company: z.string().max(0).optional(),
})

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_PER_WINDOW = 5

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

function rateLimit(key: string): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || now > existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true, retryAfterSeconds: 0 }
  }

  existing.count += 1
  if (existing.count > MAX_PER_WINDOW) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    }
  }
  return { ok: true, retryAfterSeconds: 0 }
}

/* Opportunistic cleanup so the Map cannot grow without bound on a
   long-lived instance. Cheap: runs only on request, only past the window. */
let lastSweep = 0
function sweep(): void {
  const now = Date.now()
  if (now - lastSweep < WINDOW_MS) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key)
  }
}

function clientKey(request: Request): string {
  // Vercel sets x-forwarded-for; the left-most entry is the client.
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim()
  return ip || request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: Request) {
  sweep()

  const limit = rateLimit(clientKey(request))
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many messages from this address. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = submissionSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'That did not look right. Check the email address and try again.' },
      { status: 400 },
    )
  }

  const submission = parsed.data

  // Honeypot tripped: respond 200 so a bot learns nothing, but do not deliver.
  if (submission.company) {
    return NextResponse.json({ ok: true })
  }

  if (!submission.email) {
    return NextResponse.json({ error: 'An email address is required.' }, { status: 400 })
  }

  /* Delivery. Intentionally provider-agnostic: set CONTACT_WEBHOOK_URL to a
     Resend/Formspark/Zapier endpoint. Without it the route still succeeds and
     logs, so a missing env var in preview does not look like a broken form to
     whoever is testing it. */
  const webhook = process.env.CONTACT_WEBHOOK_URL

  if (!webhook) {
    console.info('[contact] no CONTACT_WEBHOOK_URL set; submission not delivered', {
      hasEmail: Boolean(submission.email),
      productType: submission.productType,
      challenge: submission.challenge,
    })
    return NextResponse.json({ ok: true, delivered: false })
  }

  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'portfolio/build-with-me',
        receivedAt: new Date().toISOString(),
        ...submission,
      }),
    })
    if (!response.ok) throw new Error(`Webhook responded ${response.status}`)
  } catch (cause) {
    // Log server-side; never leak the reason to the client.
    console.error('[contact] delivery failed', cause)
    return NextResponse.json(
      { error: 'Could not send that just now. Please email me directly.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true, delivered: true })
}

/** Reject everything else explicitly rather than returning a confusing 405 body. */
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 })
}
