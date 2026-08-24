/* One-shot verification runner.

   Starts the production server as a child process, waits for it to actually
   answer, runs every check against it, then tears it down. Doing this in a
   single process avoids the flakiness of starting a detached server in one
   shell and hoping it is still alive in the next. */

import { spawn } from 'node:child_process'
import { once } from 'node:events'

const PORT = process.env.PORT ?? '3000'
const BASE = `http://localhost:${PORT}`

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(3000) })
      if (response.ok) return true
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

function run(command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: { ...process.env, BASE },
  })
  return once(child, 'exit').then(([code]) => code ?? 1)
}

/* Refuse to run against a server this script did not start.

   `npm start` on an occupied port either fails or — worse — the port is held
   by a stale server from an earlier, crashed run, and every check then
   silently grades the OLD build. That produced a genuinely misleading hour:
   contrast violations that were a missing stylesheet, and a palette timeout
   that was a build from twenty minutes earlier. A check that measures the
   wrong artifact is worse than a check that fails. */
try {
  const probe = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(2000) })
  if (probe.ok || probe.status > 0) {
    console.error(
      `✗ something is already serving ${BASE}.\n` +
        `  This script must start its own server, or the checks may grade a stale build.\n` +
        `  Stop it first:  kill $(pgrep -f 'nex[t]-server')\n` +
        `  Or run on another port:  PORT=3400 node scripts/verify.mjs`,
    )
    process.exit(1)
  }
} catch {
  // Nothing listening — which is what we want.
}

/* detached:true puts the server in its own process group. `npm start` spawns
   a shell which spawns next-server, and a SIGTERM to npm does not reliably
   reach the grandchild — which is exactly how the stale servers above got
   orphaned in the first place. Killing the group kills the tree. */
const server = spawn('npm', ['start'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, PORT },
  detached: true,
})

let serverLog = ''
server.stdout.on('data', (d) => {
  serverLog += d.toString()
})
server.stderr.on('data', (d) => {
  serverLog += d.toString()
})

let failures = 0

try {
  const up = await waitForServer()
  if (!up) {
    console.error('✗ server never became ready. Output:\n' + serverLog.slice(-2000))
    process.exit(1)
  }
  console.log(`server ready on ${BASE}\n`)

  const steps = [
    ['budget', 'npx', ['tsx', 'scripts/check-budget.ts']],
    ['a11y + keyboard', 'node', ['scripts/a11y.mjs']],
  ]

  for (const [label, command, args] of steps) {
    console.log(`\n${'='.repeat(66)}\n${label}\n${'='.repeat(66)}`)
    const code = await run(command, args)
    if (code !== 0) {
      failures += 1
      console.error(`✗ ${label} failed (exit ${code})`)
    }
  }
} finally {
  /* Kill the group, not the child. The negative pid is the whole point. */
  const stop = (signal) => {
    try {
      if (server.pid !== undefined) process.kill(-server.pid, signal)
    } catch {
      // already gone
    }
  }
  stop('SIGTERM')
  await new Promise((r) => setTimeout(r, 700))
  stop('SIGKILL')
}

console.log(`\n${failures === 0 ? '✓ all checks passed' : `✗ ${failures} check(s) failed`}`)
process.exit(failures === 0 ? 0 : 1)
