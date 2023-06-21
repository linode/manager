import {
  createPersonalAccessToken,
  deleteAppToken,
  deletePersonalAccessToken,
  getAppTokens,
  getPersonalAccessTokens,
  updatePersonalAccessToken,
} from '@linode/api-v4/lib/profile';
import { Token, TokenRequest } from '@linode/api-v4/lib/profile/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { updateInPaginatedStore } from './base';
import { queryKey } from './profile';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { AppEventHandler } from 'src/hooks/useAppEventHandlers';

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

export const useCreatePersonalAccessTokenMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Token, APIError[], TokenRequest>(
    createPersonalAccessToken,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKey, 'personal-access-tokens']);
      },
    }
  );
};

export const useUpdatePersonalAccessTokenMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Token, APIError[], Partial<TokenRequest>>(
    (data) => updatePersonalAccessToken(id, data),
    {
      onSuccess: (token) => {
        updateInPaginatedStore(
          [queryKey, 'personal-access-tokens'],
          id,
          token,
          queryClient
        );
      },
    }
  );
};

export const useRevokePersonalAccessTokenMutation = (id: number) => {
  const queryClient = useQueryClient();
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
  const queryClient = useQueryClient();
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

export const tokenEventHandler: AppEventHandler = (_, queryClient) => {
  queryClient.invalidateQueries([queryKey, 'personal-access-tokens']);
};
