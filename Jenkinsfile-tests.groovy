library 'ui-builder'

// Unit tests: root `pnpm test` runs 4 Vitest shards in parallel when CI=true.
// For faster distributed runs, configure your pipeline to set VITEST_SHARD (e.g. 1/4 … 4/4)
// on separate agents and call `pnpm test` (see scripts/run-vitest.mjs).

testManager()
