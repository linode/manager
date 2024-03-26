import {
  APIError,
  Filter,
  OAuthClient,
  OAuthClientRequest,
  Params,
  createOAuthClient,
  deleteOAuthClient,
  resetOAuthClientSecret,
  updateOAuthClient,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EventHandlerData } from 'src/hooks/useEventHandlers';

import { accountQueries } from './queries';

export const useOAuthClientsQuery = (params?: Params, filter?: Filter) =>
  useQuery({
    ...accountQueries.oauthClients(params, filter),
    keepPreviousData: true,
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
      queryClient.invalidateQueries(accountQueries.oauthClients._def);
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
      queryClient.invalidateQueries(accountQueries.oauthClients._def);
    },
  });
};

export const useUpdateOAuthClientMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<OAuthClient, APIError[], Partial<OAuthClientRequest>>({
    mutationFn: (data) => updateOAuthClient(id, data),
    onSuccess() {
      queryClient.invalidateQueries(accountQueries.oauthClients._def);
    },
  });
};

export const oauthClientsEventHandler = ({ queryClient }: EventHandlerData) => {
  // We may over-fetch because on `onSuccess` also invalidates, but this will be
  // good for UX because Cloud will always be up to date
  queryClient.invalidateQueries(accountQueries.oauthClients._def);
};
