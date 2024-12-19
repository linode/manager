import { http } from 'msw';

import { makeErrorResponse } from 'src/mocks/utilities/response';

import type { MockPresetBaseline } from 'src/mocks/types';

const respondWithAccountActivation = () => {
  return [
    // @TODO Add handlers for support-related endpoints that are still accessible to accounts under review.
    http.all('*/v4*/*', () => {
      const errorMessage =
        'Your account must be activated before you can use this endpoint';
      return makeErrorResponse(errorMessage, 403);
    }),
  ];
};

export const baselineAccountActivationPreset: MockPresetBaseline = {
  group: { id: 'Account State' },
  handlers: [respondWithAccountActivation],
  id: 'baseline:account-activation',
  label: 'Account Activation Required',
};
