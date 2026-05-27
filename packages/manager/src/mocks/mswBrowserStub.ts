/**
 * Stub for msw/browser used in test environments.
 *
 * `vitest related` scans the entire source tree to build a module graph before
 * running tests. `mswWorkers.ts` statically imports `msw/browser`, which Vite 7
 * cannot resolve under Node conditions (the subpath export map requires a
 * `browser` condition that isn't active during SSR/Node resolution).
 *
 * This stub replaces `msw/browser` during tests via a `resolve.alias` in
 * `vite.config.ts`. It is never executed — the browser worker is not used in
 * unit tests (tests use `msw/node` via `testServer.ts`).
 */
export const setupWorker = () => ({
  start: async () => {},
  stop: async () => {},
  use: () => {},
  resetHandlers: () => {},
  restoreHandlers: () => {},
});
