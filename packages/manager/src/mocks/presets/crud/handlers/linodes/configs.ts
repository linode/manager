import { DateTime } from 'luxon';
import { http } from 'msw';

import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../../indexedDB';
import { addFirewallDevice } from './linodes';

import type {
  Config,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const appendConfigInterface = (mockState: MockState) => [
  http.post(
    '*/v4*/linode/instances/:id/configs/:configId/interfaces',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Interface>> => {
      const linodeId = Number(params.id);
      const linode = await mswDB.get('linodes', linodeId);
      const configId = Number(params.configId);
      const config = await mswDB.get('linodeConfigs', configId);

      if (!linode || !config) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();
      let configInterface;
    }
  ),
];