import type { MockPreset } from '../../mockPreset';
import { http, passthrough } from 'msw';
import { makeErrorResponse } from 'src/mocks/utilities/response';

/**
 * The rate at which API responses will randomly fail.
 */
const FAILURE_RATE = 0.75;

/**
 * Mock all requests to Linode API v4 to mock HTTP request failure.
 */
const respondWithFailure = () => {
  return [
    http.all('*/v4*/*', () => {
      const shouldFail = Math.random() <= FAILURE_RATE;
      const statusCode = Math.random() <= 0.5 ? 500 : 502;

      if (shouldFail) {
        return makeErrorResponse('An unknown error occurred.', statusCode);
      }

      return passthrough();
    }),
  ];
};

export const baselineApiUnstablePreset: MockPreset = {
  label: 'API Unstable',
  id: 'baseline-api-unstable',
  group: 'API State',
  handlers: [respondWithFailure],
};
