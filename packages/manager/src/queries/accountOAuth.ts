import {
  APIError,
  Filter,
  OAuthClient,
  OAuthClientRequest,
  Params,
  createOAuthClient,
  deleteOAuthClient,
  getOAuthClients,
  resetOAuthClientSecret,
  updateOAuthClient,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { EventHandlerData } from 'src/hooks/useEventHandlers';

import { queryKey as accountQueryKey } from './account';

const queryKey = [accountQueryKey, 'oauth'];

export const useOAuthClientsQuery = (params?: Params, filter?: Filter) =>
  useQuery(
    [...queryKey, 'paginated', params, filter],
    () => getOAuthClients(params, filter),
    {
      keepPreviousData: true,
    }
  );

export const useResetOAuthClientMutation = (id: string) =>
  useMutation<OAuthClient & { secret: string }, APIError[]>(() =>
    resetOAuthClientSecret(id)
  );

export const useDeleteOAuthClientMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteOAuthClient(id), {
    onSuccess() {
      queryClient.invalidateQueries(queryKey);
    },
  });
};

export const useCreateOAuthClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    OAuthClient & { secret: string },
    APIError[],
    OAuthClientRequest
  >(createOAuthClient, {
    onSuccess() {
      queryClient.invalidateQueries(queryKey);
    },
  });
};

export const useUpdateOAuthClientMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<OAuthClient, APIError[], Partial<OAuthClientRequest>>(
    (data) => updateOAuthClient(id, data),
    {
      onSuccess() {
        queryClient.invalidateQueries(queryKey);
      },
    }
  );
};

export const oauthClientsEventHandler = ({ queryClient }: EventHandlerData) => {
  // We may over-fetch because on `onSuccess` also invalidates, but this will be
  // good for UX because Cloud will always be up to date
  queryClient.invalidateQueries(queryKey);
};
