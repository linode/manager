import { http } from 'msw';

import { mswDB } from 'src/mocks/indexedDB';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { ChildAccount } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getChildAccounts = () => [
  http.get(
    '*/v4*/iam/delegation/child-accounts*',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<ChildAccount>>
    > => {
      const childAccounts = await mswDB.getAll('childAccounts');

      if (!childAccounts) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: childAccounts,
        request,
      });
    }
  ),

  http.get(
    '*/v4*/iam/delegation/child-accounts/:id',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | ChildAccount>> => {
      const id = Number(params.id);
      const entity = await mswDB.get('childAccounts', id);

      if (!entity) {
        return makeNotFoundResponse();
      }

      return makeResponse(entity);
    }
  ),
];
