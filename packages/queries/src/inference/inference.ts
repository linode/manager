import {
  createApiKey,
  deleteApiKey,
  getApiKeys,
  getInferenceModels,
  getInferenceUsage,
  revokeApiKey,
  updateApiKey,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';
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
  InferenceModelsResponse,
  InferenceUsage,
  InferenceUsageRequest,
  Params,
  ResourcePage,
  UpdateApiKeyPayload,
} from '@linode/api-v4';

/**
 * Fetches all API keys by paginating through all pages.
 */
const getAllApiKeys = (passedParams: Params = {}, passedFilter: Filter = {}) =>
  getAll<ApiKey>((params, filter) =>
    getApiKeys({ ...params, ...passedParams }, { ...filter, ...passedFilter }),
  )().then((data) => data.data);

export const inferenceQueries = createQueryKeys('inference', {
  allApiKeys: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAllApiKeys(params, filter),
    queryKey: ['all', params, filter],
  }),
  apiKeys: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getApiKeys(params, filter),
    queryKey: [params, filter],
  }),
  models: {
    queryFn: getInferenceModels,
    queryKey: null,
  },
  usage: (data?: InferenceUsageRequest) => ({
    queryFn: () => getInferenceUsage(data),
    queryKey: [data],
  }),
});

/**
 * Hook to fetch all API keys for the Inference Platform.
 * Uses pagination to fetch all pages and returns all keys.
 */
export const useAllInferenceApiKeysQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled = true,
) =>
  useQuery<ApiKey[], APIError[]>({
    ...inferenceQueries.allApiKeys(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

/**
 * Hook to fetch a single page of API keys for the Inference Platform.
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
 * Hook to fetch available inference models.
 */
export const useInferenceModelsQuery = (enabled = true) =>
  useQuery<InferenceModelsResponse, APIError[]>({
    ...inferenceQueries.models,
    enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

/**
 * Hook to fetch usage statistics for the Inference Platform.
 */
export const useInferenceUsageQuery = (
  data?: InferenceUsageRequest,
  enabled = true,
) =>
  useQuery<InferenceUsage, APIError[]>({
    ...inferenceQueries.usage(data),
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
      queryClient.invalidateQueries({
        queryKey: inferenceQueries.allApiKeys._def,
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
      queryClient.invalidateQueries({
        queryKey: inferenceQueries.allApiKeys._def,
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
      queryClient.invalidateQueries({
        queryKey: inferenceQueries.allApiKeys._def,
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
      queryClient.invalidateQueries({
        queryKey: inferenceQueries.allApiKeys._def,
      });
    },
  });
};
