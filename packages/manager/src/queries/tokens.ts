import {
  createPersonalAccessToken,
  deleteAppToken,
  deletePersonalAccessToken,
  updatePersonalAccessToken,
} from '@linode/api-v4/lib/profile';
import { Token, TokenRequest } from '@linode/api-v4/lib/profile/types';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EventWithStore } from 'src/events';

import { profileQueries } from './profile';

export const useAppTokensQuery = (params?: Params, filter?: Filter) => {
  return useQuery<ResourcePage<Token>, APIError[]>({
    keepPreviousData: true,
    ...profileQueries.appTokens(params, filter),
  });
};

export const usePersonalAccessTokensQuery = (
  params?: Params,
  filter?: Filter
) => {
  return useQuery<ResourcePage<Token>, APIError[]>({
    keepPreviousData: true,
    ...profileQueries.personalAccessTokens(params, filter),
  });
};

export const useCreatePersonalAccessTokenMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Token, APIError[], TokenRequest>({
    mutationFn: createPersonalAccessToken,
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.personalAccessTokens._def);
    },
  });
};

export const useUpdatePersonalAccessTokenMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Token, APIError[], Partial<TokenRequest>>({
    mutationFn: (data) => updatePersonalAccessToken(id, data),
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.personalAccessTokens._def);
    },
  });
};

export const useRevokePersonalAccessTokenMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deletePersonalAccessToken(id),
    onSuccess() {
      // Wait 1 second to invalidate cache after deletion because API needs time
      setTimeout(
        () =>
          queryClient.invalidateQueries(
            profileQueries.personalAccessTokens._def
          ),
        1000
      );
    },
  });
};

export const useRevokeAppAccessTokenMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteAppToken(id),
    onSuccess() {
      // Wait 1 second to invalidate cache after deletion because API needs time
      setTimeout(
        () => queryClient.invalidateQueries(profileQueries.appTokens._def),
        1000
      );
    },
  });
};

export function tokenEventHandler({ queryClient }: EventWithStore) {
  queryClient.invalidateQueries(profileQueries.personalAccessTokens._def);
}
