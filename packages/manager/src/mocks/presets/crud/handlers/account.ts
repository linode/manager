import { http } from 'msw';

import { makeResponse } from 'src/mocks/utilities/response';

import type { CancelAccount } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';

/**
 * MSW Handlers for Account operations
 *
 * This module provides mock handlers for the Account API endpoints.
 */

export const cancelAccount = (mockState: MockState) => [
  http.post(
    '*/account/cancel',
    async ({ request }): Promise<StrictResponse<CancelAccount>> => {
      // The payload contains { comments: string } but we don't need to do anything with it for mocking
      const response: CancelAccount = {
        survey_link:
          'https://akamaisurveys.eu.qualtrics.com/jfe/form/abcd?SURVEY_KEY=12345',
      };

      return makeResponse(response);
    }
  ),
];
