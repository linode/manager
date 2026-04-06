import { http, passthrough } from 'msw';

import { makeErrorResponse } from 'src/mocks/utilities/response';

import type { MockPresetBaseline } from 'src/mocks/types';

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

export const baselineApiUnstablePreset: MockPresetBaseline = {
  group: { id: 'API State' },
  handlers: [respondWithFailure],
  id: 'baseline:api-unstable',
  label: 'API Unstable',
};
