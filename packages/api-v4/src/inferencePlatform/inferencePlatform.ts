import { BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, Params, ResourcePage } from '../types';
import type {
  ApiKey,
  ChatRequestBody,
  ChatResponseBody,
  CreateApiKeyPayload,
  CreateApiKeyResponse,
  UpdateApiKeyPayload,
} from './types';

/**
 * createChatCompletion
 *
 * Sends a chat completion request to the Inference Platform API.
 *
 * @param data { ChatRequestBody } the request payload including model, provider, and messages.
 */
export const createChatCompletion = (data: ChatRequestBody) =>
  Request<ChatResponseBody>(
    setURL(`${BETA_API_ROOT}/inference/chat/completions`),
    setMethod('POST'),
    setData(data),
  );

/**
 * getApiKeys
 *
 * Returns a paginated list of API keys for the Inference Platform.
 */
export const getApiKeys = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<ApiKey>>(
    setURL(`${BETA_API_ROOT}/inference/api-keys`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * createApiKey
 *
 * Creates a new API key for the Inference Platform.
 * Returns the full API key (only shown once on creation).
 */
export const createApiKey = (data: CreateApiKeyPayload) =>
  Request<CreateApiKeyResponse>(
    setURL(`${BETA_API_ROOT}/inference/api-keys`),
    setMethod('POST'),
    setData(data),
  );

/**
 * revokeApiKey
 *
 * Revokes an Inference API key.
 * The key remains in the list but can no longer be used.
 */
export const revokeApiKey = (keyId: number) =>
  Request<ApiKey>(
    setURL(`${BETA_API_ROOT}/inference/api-keys/${keyId}/revoke`),
    setMethod('POST'),
  );

/**
 * deleteApiKey
 *
 * Permanently deletes an Inference API key.
 */
export const deleteApiKey = (keyId: number) =>
  Request<object>(
    setURL(`${BETA_API_ROOT}/inference/api-keys/${keyId}`),
    setMethod('DELETE'),
  );

/**
 * updateApiKey
 *
 * Updates an Inference API key.
 */
export const updateApiKey = (keyId: number, data: UpdateApiKeyPayload) =>
  Request<ApiKey>(
    setURL(`${BETA_API_ROOT}/inference/api-keys/${keyId}`),
    setMethod('PUT'),
    setData(data),
  );
