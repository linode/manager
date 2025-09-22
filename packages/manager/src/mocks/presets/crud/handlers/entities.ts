import { http } from 'msw';

import { mswDB } from 'src/mocks/indexedDB';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { Entity } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getEntities = () => [
  http.get(
    '*/v4*/entities',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Entity>>
    > => {
      const entities = await mswDB.getAll('entities');

      if (!entities) {
        return makeNotFoundResponse();
      }
      return makePaginatedResponse({
        data: entities,
        request,
      });
    }
  ),

  http.get(
    '*/v4*/entities/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Entity>> => {
      const id = Number(params.id);
      const entity = await mswDB.get('entities', id);

      if (!entity) {
        return makeNotFoundResponse();
      }

      return makeResponse(entity);
    }
  ),
];
