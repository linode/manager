import { BETA_API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL } from '../request';

import type { ChatRequestBody, ChatResponseBody } from './types';

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
