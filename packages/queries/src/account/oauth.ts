import {
  createOAuthClient,
  deleteOAuthClient,
  resetOAuthClientSecret,
  updateOAuthClient,
} from '@linode/api-v4';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { accountQueries } from './queries';

import type { EventHandlerData } from '../eventHandlers';
import type {
  APIError,
  Filter,
  OAuthClient,
  OAuthClientRequest,
  Params,
} from '@linode/api-v4';

export const useOAuthClientsQuery = (params?: Params, filter?: Filter) =>
  useQuery({
    ...accountQueries.oauthClients(params, filter),
    placeholderData: keepPreviousData,
  });

interface OAuthClientWithSecret extends OAuthClient {
  secret: string;
}

export const useResetOAuthClientMutation = (id: string) =>
  useMutation<OAuthClientWithSecret, APIError[]>({
    mutationFn: () => resetOAuthClientSecret(id),
  });

export const useDeleteOAuthClientMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteOAuthClient(id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: accountQueries.oauthClients._def,
      });
    },
  });
};

interface OAuthClientWithSecret extends OAuthClient {
  secret: string;
}

export const useCreateOAuthClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<OAuthClientWithSecret, APIError[], OAuthClientRequest>({
    mutationFn: createOAuthClient,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: accountQueries.oauthClients._def,
      });
    },
  });
};

export const useUpdateOAuthClientMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<OAuthClient, APIError[], Partial<OAuthClientRequest>>({
    mutationFn: (data) => updateOAuthClient(id, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: accountQueries.oauthClients._def,
      });
    },
  });
};

export const oauthClientsEventHandler = ({
  invalidateQueries,
}: EventHandlerData) => {
  // We may over-fetch because on `onSuccess` also invalidates, but this will be
  // good for UX because Cloud will always be up to date
  invalidateQueries({
    queryKey: accountQueries.oauthClients._def,
  });
};
