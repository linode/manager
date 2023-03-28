import { vi } from 'vitest';
import { LDClient } from 'launchdarkly-js-client-sdk';

const client: LDClient = {
  waitForInitialization: vi.fn(),
  waitUntilGoalsReady: vi.fn(),
  waitUntilReady: vi.fn(),
  track: vi.fn(),
  getUser: vi.fn(),
  identify: vi.fn(),
  off: vi.fn(),
  on: vi.fn(),
  allFlags: vi.fn(),
  setStreaming: vi.fn(),
  flush: vi.fn(),
  variation: vi.fn(),
  variationDetail: vi.fn(),
  close: vi.fn(),
  alias: vi.fn(),
};

export default client;
