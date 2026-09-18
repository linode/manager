import {
  createApiKey,
  deleteApiKey,
  getApiKeys,
  getInferenceModelDetail,
  getInferenceModels,
  getInferenceUsage,
  getInferenceUsageCredits,
  revokeApiKey,
  updateApiKey,
} from '@linode/api-v4';
import { getInferenceModelsResourcePage } from '@linode/api-v4';
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
  InferenceModel,
  InferenceModelsResponse,
  InferenceUsage,
  InferenceUsageCredits,
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

export const getAllInferenceModels = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<InferenceModelsResponse>((params, filter) =>
    getInferenceModelsResourcePage(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
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
  modelDetail: (modelId: string) => ({
    queryFn: () => getInferenceModelDetail(modelId),
    queryKey: [modelId],
  }),
  models: {
    queryFn: getInferenceModels,
    queryKey: null,
  },
  usage: (data?: InferenceUsageRequest) => ({
    queryFn: () => getInferenceUsage(data),
    queryKey: [data],
  }),
  usageCredits: {
    queryFn: getInferenceUsageCredits,
    queryKey: null,
  },
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
 * Hook to fetch full details for a single inference model.
 */
export const useInferenceModelDetailQuery = (modelId: string, enabled = true) =>
  useQuery<InferenceModel, APIError[]>({
    ...inferenceQueries.modelDetail(modelId),
    enabled: enabled && Boolean(modelId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

/**
 * Hook to fetch usage statistics for the Inference Platform.
 * Polls every five minutes while the window is focused. Refocusing the window
 * also refetches unless the latest successful response is under 10 seconds old.
 */
export const useInferenceUsageQuery = (
  data?: InferenceUsageRequest,
  enabled = true,
) =>
  useQuery<InferenceUsage, APIError[]>({
    ...inferenceQueries.usage(data),
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: (query) =>
      Date.now() - query.state.dataUpdatedAt >= 10 * 1000 ? 'always' : false,
  });

/**
 * Hook to fetch the current credits summary for the Inference Platform
 * (total, used, and remaining credits for the current billing period).
 */
export const useInferenceUsageCreditsSummaryQuery = (enabled = true) =>
  useQuery<InferenceUsageCredits, APIError[]>({
    ...inferenceQueries.usageCredits,
    enabled,
    staleTime: 60 * 1000, // Cache for 1 minute
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
