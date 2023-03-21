import {
  deleteAppToken,
  deletePersonalAccessToken,
  getAppTokens,
  getPersonalAccessTokens,
  updatePersonalAccessToken,
} from '@linode/api-v4/lib/profile';
import { Token, TokenRequest } from '@linode/api-v4/lib/profile/types';
import { Event } from '@linode/api-v4';
import { useMutation, useQuery } from 'react-query';
import { queryClient, updateInPaginatedStore } from './base';
import { queryKey } from './profile';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';

export const useAppTokensQuery = (params?: Params, filter?: Filter) => {
  return useQuery<ResourcePage<Token>, APIError[]>({
    queryKey: [queryKey, 'app-tokens', params, filter],
    queryFn: () => getAppTokens(params, filter),
    keepPreviousData: true,
  });
};

export const usePersonalAccessTokensQuery = (
  params?: Params,
  filter?: Filter
) => {
  return useQuery<ResourcePage<Token>, APIError[]>({
    queryKey: [queryKey, 'personal-access-tokens', params, filter],
    queryFn: () => getPersonalAccessTokens(params, filter),
    keepPreviousData: true,
  });
};

export const useUpdatePersonalAccessTokenMutation = (id: number) => {
  return useMutation<Token, APIError[], Partial<TokenRequest>>(
    (data) => updatePersonalAccessToken(id, data),
    {
      onSuccess: (token) => {
        updateInPaginatedStore([queryKey, 'personal-access-tokens'], id, token);
      },
    }
  );
};

export const useRevokePersonalAccessTokenMutation = (id: number) => {
  return useMutation<{}, APIError[]>(() => deletePersonalAccessToken(id), {
    onSuccess() {
      // Wait 1 second to invalidate cache after deletion because API needs time
      setTimeout(
        () =>
          queryClient.invalidateQueries([queryKey, 'personal-access-tokens']),
        1000
      );
    },
  });
};

export const useRevokeAppAccessTokenMutation = (id: number) => {
  return useMutation<{}, APIError[]>(() => deleteAppToken(id), {
    onSuccess() {
      // Wait 1 second to invalidate cache after deletion because API needs time
      setTimeout(
        () => queryClient.invalidateQueries([queryKey, 'app-tokens']),
        1000
      );
    },
  });
};

export function tokenEventHandler(event: Event) {
  queryClient.invalidateQueries([queryKey, 'personal-access-tokens']);
}
