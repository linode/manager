import { http } from 'msw';

import { mswDB } from 'src/mocks/indexedDB';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { User } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getUsers = () => [
  http.get(
    '*/v4*/account/users',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<User>>
    > => {
      const users = await mswDB.getAll('users');

      if (!users) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: users,
        request,
      });
    }
  ),

  http.get(
    '*/v4*/account/users/:username',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | User>> => {
      const username = params.username as string;
      const users = await mswDB.getAll('users');

      const user = users?.find((user) => user.username === username);

      if (!user) {
        return makeNotFoundResponse();
      }

      return makeResponse(user);
    }
  ),
];
