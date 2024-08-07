import { http } from 'msw';

import { makeErrorResponse } from 'src/mocks/utilities/response';

import type { MockPresetBaseline } from 'src/mocks/types';

/**
 * Mock all requests to Linode API v4 to respond with maintenance mode status and header.
 */
const respondWithMaintenanceMode = () => {
  return [
    // Match against all APIv4 and APIv4 Beta API requests.
    http.all('*/v4*/*', () => {
      return makeErrorResponse('Currently in maintenance mode.', 503, {
        'x-maintenance-mode': 'all,All endpoints are temporarily unavailable.',
      });
    }),
  ];
};

export const baselineApiMaintenanceModePreset: MockPresetBaseline = {
  group: { id: 'API State' },
  handlers: [respondWithMaintenanceMode],
  id: 'baseline:api-maintenance',
  label: 'API Maintenance Mode',
};
