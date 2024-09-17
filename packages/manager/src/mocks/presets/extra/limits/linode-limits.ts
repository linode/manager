import { http } from 'msw';

import { makeErrorResponse } from 'src/mocks/utilities/response';

import type { MockPresetExtra } from 'src/mocks/types';

const errorResponse = makeErrorResponse(
  'You’ve reached the limit for the number of active vCPUs in this Linode plan. Please contact Support to request an increase and specify the total number of resources you may need.'
);

const mockLinodeLimits = () => {
  return [
    http.post('*/v4/linode/instances', async () => {
      return errorResponse;
    }),

    http.post('*/v4/linode/instances/:id/resize', async () => {
      return errorResponse;
    }),

    http.post('*/v4/linode/instances/:id/rebuild', async () => {
      return errorResponse;
    }),

    http.post('*/v4/linode/instances/:id/migrate', async () => {
      return errorResponse;
    }),

    http.post('*/v4/linode/instances/:id/clone', async () => {
      return errorResponse;
    }),
  ];
};

export const linodeLimitsPreset: MockPresetExtra = {
  desc: 'Mock an API error for Linode quota limit',
  group: { id: 'Limits', type: 'select' },
  handlers: [mockLinodeLimits],
  id: 'limits:linode-limits',
  label: 'Linode Limits',
};
