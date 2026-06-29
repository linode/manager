import {
  createApiKey,
  deleteApiKey,
  getApiKeys,
  revokeApiKey,
  updateApiKey,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  APIError,
  ApiKey,
  CreateApiKeyPayload,
  CreateApiKeyResponse,
  Filter,
  Params,
  ResourcePage,
  UpdateApiKeyPayload,
} from '@linode/api-v4';

export const inferenceQueries = createQueryKeys('inference', {
  apiKeys: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getApiKeys(params, filter),
    queryKey: [params, filter],
  }),
});

/**
 * Hook to fetch all API keys for the Inference Platform.
 */
export const useInferenceApiKeysQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled = true,
) =>
  useQuery<ResourcePage<ApiKey>, APIError[]>({
    ...inferenceQueries.apiKeys(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

/**
 * Hook to create a new API key.
 */
export const useCreateInferenceApiKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateApiKeyResponse, APIError[], CreateApiKeyPayload>({
    mutationFn: createApiKey,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: inferenceQueries.apiKeys._def,
      });
    },
  });
};

/**
 * Hook to update an API key.
 * Pass keyId and data together to the mutation function.
 */
export const useUpdateInferenceApiKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiKey,
    APIError[],
    { data: UpdateApiKeyPayload; keyId: number }
  >({
    mutationFn: ({ data, keyId }) => updateApiKey(keyId, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: inferenceQueries.apiKeys._def,
      });
    },
  });
};

/**
 * Hook to revoke an API key.
 * The key will be marked as 'revoked' but will remain in the list.
 */
export const useRevokeInferenceApiKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiKey, APIError[], number>({
    mutationFn: revokeApiKey,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: inferenceQueries.apiKeys._def,
      });
    },
  });
};

/**
 * Hook to permanently delete an API key.
 */
export const useDeleteInferenceApiKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<object, APIError[], number>({
    mutationFn: deleteApiKey,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: inferenceQueries.apiKeys._def,
      });
    },
  });
};
