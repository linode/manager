import { AxiosError, AxiosResponse } from 'axios';
import { pathOr } from 'ramda';

import { ACCESS_TOKEN, DEFAULT_ERROR_MESSAGE } from 'src/constants';
import { interceptGPUErrors } from 'src/utilities/interceptGPUError';

import { baseRequest } from 'linode-js-sdk/lib/request';

import store from 'src/store';
import { handleLogout } from 'src/store/authentication/authentication.actions';

const handleSuccess: <T extends AxiosResponse<any>>(
  response: T
) => T | T = response => {
  if (!!response.headers['x-maintenance-mode']) {
    store.dispatch(handleLogout());
    Promise.reject(response);
  }

  return response;
};

export const handleError = (error: AxiosError) => {
  if (
    !!error.config.headers['x-maintenance-mode'] ||
    (error.response && error.response.status === 401)
  ) {
    /**
     * this will blow out redux state and the componentDidUpdate in the
     * AuthenticationWrapper.tsx will be responsible for redirecting to Login
     */
    store.dispatch(handleLogout());
  }

  if (error.response && error.response.status === 403) {
    const action =
      !error.config.method ||
      (error.config.method && error.config.method.match(/get/i))
        ? 'view this feature'
        : 'take this action';
    return Promise.reject([
      {
        reason: `You are not authorized to ${action}.`
      }
    ]);
  }

  /**
   * In one special case (trying to create a GPU Linode
   * and failing because your account's reputation
   * is insufficient), we want to replace the error
   * message from the API with a link to an open,
   * pre-filled Support ticket. This is hacky and horrible,
   * apologies.
   */
  const errors = pathOr(
    [{ reason: DEFAULT_ERROR_MESSAGE }],
    ['response', 'data', 'errors'],
    error
  );

  /** AxiosError contains the original POST data as stringified JSON */
  let requestData;
  try {
    requestData = JSON.parse(pathOr('', ['config', 'data'], error));
  } catch {
    requestData = {};
  }
  const requestedLinodeType = pathOr('', ['type'], requestData);
  /** If any of this fails we'll just return the errors unchanged. */
  const interceptedErrors = interceptGPUErrors(requestedLinodeType, errors);

  // Downstream components should only have to handle ApiFieldErrors, not AxiosErrors.
  return Promise.reject(interceptedErrors);
};

baseRequest.interceptors.request.use(config => {
  const state = store.getState();
  /** Will end up being "Admin: 1234" or "Bearer 1234" */
  const token = ACCESS_TOKEN || pathOr('', ['authentication', 'token'], state);

  return {
    ...config,
    headers: {
      ...config.headers,
      ...(token && { Authorization: `${token}` })
    }
  };
});

/*
Interceptor that initiates re-authentication if:
  * The response is HTTP 401 "Unauthorized"
  * The API is in Maintenance mode
Also rejects non-error responses if the API is in Maintenance mode
*/
baseRequest.interceptors.response.use(handleSuccess, handleError);
