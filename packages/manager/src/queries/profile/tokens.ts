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

import { EventHandlerData } from 'src/hooks/useEventHandlers';

import { profileQueries } from './profile';

export const useAppTokensQuery = (params?: Params, filter?: Filter) => {
  return useQuery<ResourcePage<Token>, APIError[]>({
    ...profileQueries.appTokens(params, filter),
    keepPreviousData: true,
  });
};

export const usePersonalAccessTokensQuery = (
  params?: Params,
  filter?: Filter,
  enabled = true
) => {
  return useQuery<ResourcePage<Token>, APIError[]>({
    enabled,
    keepPreviousData: true,
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
  return useMutation<{}, APIError[]>(() => deletePersonalAccessToken(id), {
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
  return useMutation<{}, APIError[]>(() => deleteAppToken(id), {
    onSuccess() {
      // Wait 1 second to invalidate cache after deletion because API needs time
      setTimeout(
        () =>
          queryClient.invalidateQueries({
            queryKey: profileQueries.appTokens._def,
          }),
        1000
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
