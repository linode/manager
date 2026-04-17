#!/usr/bin/env node
/**
 * Test entry for CI vs local vs distributed shards:
 *
 * - Extra CLI args → always a single Vitest process (`vitest run ...args`), e.g.
 *     pnpm test -- packages/manager/src/utilities/linodes.test.ts
 *     pnpm test -- linodes.test.ts
 *   (Use `--` so the path is passed to this script; without it, pnpm may swallow args.)
 *
 * - VITEST_SHARD=i/n → `vitest run --shard=i/n` (optional; combine with args above)
 *
 * - CI=true, no argv args, no VITEST_SHARD → four Vitest shards in parallel on this machine
 *
 * - Otherwise → one full `vitest run` (local default)
 */
import { spawnSync } from 'node:child_process';
import process from 'node:process';

/** `pnpm test -- foo` → argv `['--', 'foo']`; drop the pnpm separator so Vitest gets the path filter */
let forwardedArgs = process.argv.slice(2);
if (forwardedArgs[0] === '--') {
  forwardedArgs = forwardedArgs.slice(1);
}
const shard = process.env.VITEST_SHARD?.trim();

const run = (command, args) => {
  const result = spawnSync(command, args, {
    env: process.env,
    shell: false,
    stdio: 'inherit',
  });
  const code = result.status === null ? 1 : result.status;
  process.exit(code);
};

/** Targeted or custom Vitest CLI: never use multi-shard concurrently here */
if (forwardedArgs.length > 0) {
  const vitestArgs = ['exec', 'vitest', 'run'];
  if (shard) {
    vitestArgs.push(`--shard=${shard}`);
  }
  vitestArgs.push(...forwardedArgs);
  run('pnpm', vitestArgs);
}

if (shard) {
  run('pnpm', ['exec', 'vitest', 'run', `--shard=${shard}`]);
}

if (process.env.CI === 'true') {
  run('pnpm', [
    'exec',
    'concurrently',
    '--group',
    'pnpm exec vitest run --shard=1/4',
    'pnpm exec vitest run --shard=2/4',
    'pnpm exec vitest run --shard=3/4',
    'pnpm exec vitest run --shard=4/4',
  ]);
}

run('pnpm', ['exec', 'vitest', 'run']);
