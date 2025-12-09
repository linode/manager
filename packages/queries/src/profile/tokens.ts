import {
  createPersonalAccessToken,
  deleteAppToken,
  deletePersonalAccessToken,
  updatePersonalAccessToken,
} from '@linode/api-v4';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { profileQueries } from './profile';

import type { EventHandlerData } from '../eventHandlers';
import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
  Token,
  TokenRequest,
} from '@linode/api-v4';

export const useAppTokensQuery = (params?: Params, filter?: Filter) => {
  return useQuery<ResourcePage<Token>, APIError[]>({
    ...profileQueries.appTokens(params, filter),
    placeholderData: keepPreviousData,
  });
};

export const usePersonalAccessTokensQuery = (
  params?: Params,
  filter?: Filter,
  enabled = true,
) => {
  return useQuery<ResourcePage<Token>, APIError[]>({
    enabled,
    placeholderData: keepPreviousData,
    ...profileQueries.personalAccessTokens(params, filter),
  });
};

export const useCreatePersonalAccessTokenMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Token, APIError[], TokenRequest>({
    mutationFn: createPersonalAccessToken,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: profileQueries.personalAccessTokens._def,
      });
    },
  });
};

export const useUpdatePersonalAccessTokenMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Token, APIError[], Partial<TokenRequest>>({
    mutationFn: (data) => updatePersonalAccessToken(id, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: profileQueries.personalAccessTokens._def,
      });
    },
  });
};

export const useRevokePersonalAccessTokenMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deletePersonalAccessToken(id),
    onSuccess() {
      // Wait 1 second to invalidate cache after deletion because API needs time
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: profileQueries.personalAccessTokens._def,
        });
      }, 1000);
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
        () =>
          queryClient.invalidateQueries({
            queryKey: profileQueries.appTokens._def,
          }),
        1000,
      );
    },
  });
};

export function tokenEventHandler({ invalidateQueries }: EventHandlerData) {
  invalidateQueries({
    queryKey: profileQueries.appTokens._def,
  });
  invalidateQueries({
    queryKey: profileQueries.personalAccessTokens._def,
  });
}
