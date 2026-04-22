#!/usr/bin/env node
/**
 * CI Vitest runner — scoped via `vitest related <changed-src-files>`.
 *
 * Strategy:
 *  1. Compute git diff (merge-base vs HEAD) to find changed source files.
 *  2. Ignore non-source paths (CI configs, lockfiles, docs, etc.).
 *  3. Group changed source files by workspace package (packages/manager, packages/ui, …).
 *  4. For each affected package, run `vitest related <files>` from that package's cwd
 *     so Vitest only walks the import graph for those files — precise and fast.
 *  5. If a file that can affect ALL tests changes (root vitest.config.ts, testSetup.ts,
 *     or the Vitest / Vite config for a package), fall back to that package's full run.
 *  6. If diff is empty or only infra/CI paths → skip Vitest, write stub JUnit.
 *  7. develop / nightly (no PR env vars and VITEST_CI_MODE != 'changed') → full root run.
 *
 * Env:
 *   VITEST_CI_MODE         — 'full' | 'changed' (default: auto-detected from PR vars)
 *   VITEST_CHANGED_SINCE   — explicit git ref; skips merge-base fetch
 *   CHANGE_TARGET          — target branch for merge-base (default: develop)
 *   BITBUCKET_PR_DESTINATION_BRANCH — same, Bitbucket style
 *   CHANGE_ID / BITBUCKET_PR_ID / BITBUCKET_PULL_REQUEST_ID — signals PR mode
 *   VITEST_JUNIT_OUT       — JUnit XML path (default: <repo>/reports/vitest-junit.xml)
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const accDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(accDir, '..');

// ---------------------------------------------------------------------------
// Package manifest — keep in sync with root vitest.config.ts `projects`.
// ---------------------------------------------------------------------------
const PACKAGES = [
  'packages/api-v4',
  'packages/manager',
  'packages/search',
  'packages/shared',
  'packages/ui',
  'packages/utilities',
];

/** Relative paths (from package root) that invalidate the whole package's test suite
 *  when changed — trigger `vitest run` (full) instead of `vitest related`. */
const PKG_GLOBAL_PATTERNS = [
  /^vite\.config\.(ts|js|mjs)$/,
  /^vitest\.config\.(ts|js|mjs)$/,
  /^src\/testSetup\.(ts|js)$/,
  /^package\.json$/,
  /^tsconfig.*\.json$/,
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function norm(p) {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

/** Returns true if this file is infra/CI/config and does not require any Vitest run. */
function isInfraOnlyPath(rel) {
  const n = norm(rel);
  return (
    n === 'acc/publish.mjs' ||           // release script, no test impact
    n.startsWith('.github/') ||
    n.startsWith('.storybook/') ||
    n.startsWith('docs/') ||
    n === '.gitignore' ||
    n === '.gitattributes' ||
    n === '.eslintrc' ||
    n === '.eslintignore' ||
    n === 'lunabuild.json' ||
    n === 'pnpm-workspace.yaml' ||
    n === 'pnpm-lock.yaml' ||
    n === 'package.json' ||
    n === 'tsconfig.json' ||
    n === 'tsconfig.base.json' ||
    n === 'README.md' ||
    n.endsWith('.md')
  );
}

/** Returns true if this root-level file change forces a full workspace run. */
function isRootVitestInput(rel) {
  const n = norm(rel);
  // Root vitest config wires all workspace projects — must re-run everything.
  // Jenkinsfile / run-vitest-ci.mjs changes affect how tests execute — validate
  // with a full run so the new pipeline logic is exercised end-to-end.
  return (
    n === 'vitest.config.ts' ||
    n === 'vitest.config.js' ||
    n === 'acc/Jenkinsfile' ||
    n === 'acc/run-vitest-ci.mjs'
  );
}

function git(args) {
  return spawnSync('git', args, { cwd: repoRoot, encoding: 'utf-8' });
}

function changedFiles(mergeBase) {
  const r = git(['diff', '--name-only', mergeBase, 'HEAD']);
  if (r.status !== 0) return null;
  return r.stdout.split('\n').map((s) => s.trim()).filter(Boolean);
}

function resolveMergeBase() {
  const since = process.env.VITEST_CHANGED_SINCE?.trim();
  if (since) return since;

  const target =
    process.env.CHANGE_TARGET ||
    process.env.BITBUCKET_PR_DESTINATION_BRANCH ||
    'develop';

  const fetch = spawnSync('git', ['fetch', '--depth=2048', 'origin', target], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (fetch.status !== 0) {
    console.error('[run-vitest-ci] git fetch failed; will run full suite.');
    return null;
  }

  const mb = git(['merge-base', 'HEAD', `origin/${target}`]);
  if (mb.status !== 0 || !mb.stdout.trim()) {
    console.error('[run-vitest-ci] merge-base failed; will run full suite.');
    return null;
  }
  return mb.stdout.trim();
}

function detectMode() {
  const explicit = process.env.VITEST_CI_MODE;
  if (explicit === 'full' || explicit === 'changed') return explicit;
  if (
    process.env.CHANGE_ID ||
    process.env.BITBUCKET_PR_ID ||
    process.env.BITBUCKET_PULL_REQUEST_ID
  ) return 'changed';
  return 'full';
}

// ---------------------------------------------------------------------------
// JUnit stub for skipped runs
// ---------------------------------------------------------------------------
function writeStubJUnit(path, msg) {
  writeFileSync(
    path,
    `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="1" failures="0" errors="0" name="vitest">
  <testsuite name="skipped" tests="1" failures="0" errors="0" skipped="1" time="0">
    <testcase name="vitest-skipped" classname="acc.run-vitest-ci" time="0">
      <skipped message="${msg}"/>
    </testcase>
  </testsuite>
</testsuites>
`,
    'utf-8'
  );
}

// ---------------------------------------------------------------------------
// Plan builder — figures out what to run for each package
// ---------------------------------------------------------------------------
/**
 * @returns {{ pkg: string, mode: 'related'|'full', srcFiles: string[] }[]}
 *   pkg = e.g. 'packages/manager'
 *   mode = 'related' → run `vitest related <srcFiles>`
 *          'full'    → run `vitest run` (that package's full suite)
 */
function buildPlan(files) {
  // Group by package
  const byPkg = {};

  for (const f of files) {
    const n = norm(f);

    // Skip infra-only paths
    if (isInfraOnlyPath(n)) continue;

    // root-level vitest.config → full workspace run signal
    if (isRootVitestInput(n)) {
      return null; // null = run full workspace suite
    }

    // Map file → owning package
    let owningPkg = null;
    for (const pkg of PACKAGES) {
      if (n === pkg || n.startsWith(`${pkg}/`)) {
        owningPkg = pkg;
        break;
      }
    }

    // Files in packages/queries or packages/validation touch shared types —
    // safer to run full manager + api-v4 suites.
    if (!owningPkg) {
      if (n.startsWith('packages/queries/')) {
        for (const p of ['packages/manager', 'packages/api-v4']) {
          if (!byPkg[p]) byPkg[p] = { mode: 'full', srcFiles: [] };
          byPkg[p].mode = 'full';
        }
        continue;
      }
      if (n.startsWith('packages/validation/')) {
        for (const p of ['packages/api-v4', 'packages/manager']) {
          if (!byPkg[p]) byPkg[p] = { mode: 'full', srcFiles: [] };
          byPkg[p].mode = 'full';
        }
        continue;
      }
      // Not in any known package and not a vitest config — skip it.
      // (e.g. root package.json, pnpm-lock.yaml, tsconfig changes, README, etc.)
      continue;
    }

    if (!byPkg[owningPkg]) {
      byPkg[owningPkg] = { mode: 'related', srcFiles: [] };
    }

    // Check if the changed file is a package-level global (vitest/vite config, testSetup)
    const relToPkg = norm(relative(resolve(repoRoot, owningPkg), resolve(repoRoot, n)));
    if (PKG_GLOBAL_PATTERNS.some((re) => re.test(relToPkg))) {
      byPkg[owningPkg].mode = 'full';
    } else {
      byPkg[owningPkg].srcFiles.push(resolve(repoRoot, n));
    }
  }

  return Object.entries(byPkg).map(([pkg, info]) => ({ pkg, ...info }));
}

// ---------------------------------------------------------------------------
// Vitest runners
// ---------------------------------------------------------------------------
function runPnpm(args, cwd = repoRoot) {
  return spawnSync('pnpm', args, { cwd, stdio: 'inherit', env: process.env });
}

function junitFile(reportsDir, slug) {
  return resolve(reportsDir, `vitest-junit-${slug}.xml`);
}

function vitestRelatedArgs(srcFiles, junitPath) {
  return [
    'exec', 'vitest', 'related',
    ...srcFiles,
    '--passWithNoTests',
    '--reporter=default',
    '--reporter=junit',
    `--outputFile.junit=${junitPath}`,
  ];
}

function vitestFullArgs(junitPath) {
  return [
    'exec', 'vitest', 'run',
    '--reporter=default',
    '--reporter=junit',
    `--outputFile.junit=${junitPath}`,
  ];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const mode = detectMode();
const junitDefault =
  process.env.VITEST_JUNIT_OUT?.trim() ||
  resolve(repoRoot, 'reports/vitest-junit.xml');
const reportsDir = dirname(junitDefault);

mkdirSync(reportsDir, { recursive: true });

// ── Full suite (develop / nightly) ────────────────────────────────────────
if (mode === 'full') {
  console.log(`[run-vitest-ci] mode=full junit=${junitDefault}`);
  const r = runPnpm(vitestFullArgs(junitDefault));
  process.exit(r.status ?? 1);
}

// ── Changed / PR mode ─────────────────────────────────────────────────────
const mergeBase = resolveMergeBase();
if (!mergeBase) {
  // Can't determine base → full suite as safe fallback
  console.log('[run-vitest-ci] mode=full (no merge-base)');
  const r = runPnpm(vitestFullArgs(junitDefault));
  process.exit(r.status ?? 1);
}

const files = changedFiles(mergeBase);
if (files === null) {
  console.log('[run-vitest-ci] git diff failed; mode=full');
  const r = runPnpm(vitestFullArgs(junitDefault));
  process.exit(r.status ?? 1);
}

console.log(`[run-vitest-ci] diff vs ${mergeBase}:\n  ${files.join('\n  ') || '(none)'}`);

// Infra-only diff → stub + skip
if (files.length === 0 || files.every(isInfraOnlyPath)) {
  console.log('[run-vitest-ci] infra-only diff; skipping Vitest');
  writeStubJUnit(junitDefault, 'Infra-only diff; Vitest not run');
  process.exit(0);
}

const plan = buildPlan(files);

// null plan → something changed at root vitest level → full workspace run
if (!plan) {
  console.log('[run-vitest-ci] root vitest config changed; mode=full');
  const r = runPnpm(vitestFullArgs(junitDefault));
  process.exit(r.status ?? 1);
}

if (plan.length === 0) {
  console.log('[run-vitest-ci] no testable packages affected; skipping');
  writeStubJUnit(junitDefault, 'No testable packages in diff');
  process.exit(0);
}

// ── Per-package scoped run ────────────────────────────────────────────────
console.log(
  `[run-vitest-ci] scoped run: ${plan.map((p) => `${p.pkg}(${p.mode})`).join(', ')}`
);

let exitCode = 0;

for (const { pkg, mode: pkgMode, srcFiles } of plan) {
  const slug = basename(pkg);
  const junit = junitFile(reportsDir, slug);
  const cwd = resolve(repoRoot, pkg);

  if (pkgMode === 'full') {
    console.log(`[run-vitest-ci] ${pkg} → full suite junit=${junit}`);
    const r = runPnpm(vitestFullArgs(junit), cwd);
    if (r.status !== 0) exitCode = r.status ?? 1;
  } else {
    console.log(
      `[run-vitest-ci] ${pkg} → vitest related (${srcFiles.length} files) junit=${junit}`
    );
    const r = runPnpm(vitestRelatedArgs(srcFiles, junit), cwd);
    if (r.status !== 0) exitCode = r.status ?? 1;
  }
}

process.exit(exitCode);
