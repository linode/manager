import { http } from 'msw';

import { makeErrorResponse } from 'src/mocks/utilities/response';

import type { MockPresetExtra } from 'src/mocks/types';

const errorResponse =
  'You’ve reached the limit for the number of active vCPUs in this Linode plan. Please contact Support to request an increase and specify the total number of resources you may need.';

const mockLKELimits = () => {
  return [
    http.post('*/v4/lke/clusters', () => {
      return makeErrorResponse(errorResponse);
    }),

    http.post('*/v4/lke/clusters/:id/pools', () => {
      return makeErrorResponse(errorResponse);
    }),

    http.put('*/v4/lke/clusters/:id/pools/:poolId', () => {
      return makeErrorResponse(errorResponse);
    }),
  ];
};

export const lkeLimitsPreset: MockPresetExtra = {
  desc: 'Mock an API error for LKE quota limit',
  group: { id: 'Limits', type: 'select' },
  handlers: [mockLKELimits],
  id: 'limits:lke-limits',
  label: 'LKE Limits',
};
