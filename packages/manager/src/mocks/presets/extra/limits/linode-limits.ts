import { http } from 'msw';

import { makeErrorResponse } from 'src/mocks/utilities/response';

import type { MockPresetExtra } from 'src/mocks/types';

const errorResponse =
  'You’ve reached the limit for the number of active vCPUs in this Linode plan. Please contact Support to request an increase and specify the total number of resources you may need.';

const mockLinodeLimits = () => {
  return [
    http.post('*/v4/linode/instances', () => {
      return makeErrorResponse(errorResponse);
    }),

    http.post('*/v4/linode/instances/:id/resize', () => {
      return makeErrorResponse(errorResponse);
    }),

    http.post('*/v4/linode/instances/:id/rebuild', () => {
      return makeErrorResponse(errorResponse);
    }),

    http.post('*/v4/linode/instances/:id/migrate', () => {
      return makeErrorResponse(errorResponse);
    }),

    http.post('*/v4/linode/instances/:id/clone', () => {
      return makeErrorResponse(errorResponse);
    }),

    http.post('*/v4/linode/instances/:id/mutate', () => {
      return makeErrorResponse(errorResponse);
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
