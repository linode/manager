import { LDClient } from 'launchdarkly-js-client-sdk';

const client: LDClient = {
  waitForInitialization: jest.fn(),
  waitUntilGoalsReady: jest.fn(),
  waitUntilReady: jest.fn(),
  track: jest.fn(),
  getUser: jest.fn(),
  identify: jest.fn(),
  off: jest.fn(),
  on: jest.fn(),
  allFlags: jest.fn(),
  setStreaming: jest.fn(),
  flush: jest.fn(),
  variation: jest.fn(),
  variationDetail: jest.fn(),
  close: jest.fn()
};

export default client;
