import type { LDClient } from 'launchdarkly-js-client-sdk';

const client: LDClient = {
  allFlags: vi.fn(),
  close: vi.fn(),
  flush: vi.fn(),
  getContext: vi.fn(),
  identify: vi.fn(),
  off: vi.fn(),
  on: vi.fn(),
  setStreaming: vi.fn(),
  track: vi.fn(),
  variation: vi.fn(),
  variationDetail: vi.fn(),
  waitForInitialization: vi.fn(),
  waitUntilGoalsReady: vi.fn(),
  waitUntilReady: vi.fn(),
};

export default client;
