import { LDClient } from 'launchdarkly-js-client-sdk';

const client: LDClient = {
  allFlags: jest.fn(),
  close: jest.fn(),
  flush: jest.fn(),
  getContext: jest.fn(),
  identify: jest.fn(),
  off: jest.fn(),
  on: jest.fn(),
  setStreaming: jest.fn(),
  track: jest.fn(),
  variation: jest.fn(),
  variationDetail: jest.fn(),
  waitForInitialization: jest.fn(),
  waitUntilGoalsReady: jest.fn(),
  waitUntilReady: jest.fn(),
};

export default client;
