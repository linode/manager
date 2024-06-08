import type { MockPreset } from '../../mockPreset';
import { http, HttpResponse } from 'msw';

/**
 * Mock all requests to Linode API v4 to mock HTTP request failure.
 */
const respondWithFailure = () => {
  return [
    http.all('*/v4*/*', () => {
      return HttpResponse.error();
    }),
  ];
};

export const baselineApiOfflinePreset: MockPreset = {
  label: 'API Offline',
  id: 'baseline-api-offline',
  group: 'API State',
  handlers: [respondWithFailure],
};
