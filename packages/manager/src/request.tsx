import { AxiosError, AxiosResponse } from 'axios';
import { baseRequest } from '@linode/api-v4/lib/request';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';

import { ACCESS_TOKEN, DEFAULT_ERROR_MESSAGE } from 'src/constants';
import { interceptErrors } from 'src/utilities/interceptAPIError';

import { AccountActivationError } from 'src/components/AccountActivation';
import { MigrateError } from 'src/components/MigrateError';
import { VerificationError } from 'src/components/VerificationError';

import store from 'src/store';
import { handleLogout } from 'src/store/authentication/authentication.actions';
import { setErrors } from 'src/store/globalErrors/globalErrors.actions';

import { API_ROOT, LOGIN_ROOT } from 'src/constants';

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
    !!error.config?.headers['x-maintenance-mode'] ||
    (error.response && error.response.status === 401)
  ) {
    /**
     * this will blow out redux state and the componentDidUpdate in the
     * AuthenticationWrapper.tsx will be responsible for redirecting to Login
     */
    store.dispatch(handleLogout());
  }
  const config = error.response?.config ?? {};
  const url = config.url ?? '';
  const status: number = error.response?.status ?? 0;
  const errors: APIError[] = error.response?.data?.errors ?? [
    { reason: DEFAULT_ERROR_MESSAGE }
  ];

  /** AxiosError contains the original POST data as stringified JSON */
  let requestData;
  try {
    requestData = JSON.parse(error.config?.data ?? '');
  } catch {
    requestData = {};
  }
  const requestedLinodeType = requestData?.type ?? '';

  const interceptedErrors = interceptErrors(errors, [
    {
      replacementText: (
        <VerificationError
          title={
            requestedLinodeType.match(/gpu/i)
              ? 'GPU Request'
              : 'Verification Request'
          }
        />
      ),
      condition: e => !!e.reason.match(/verification is required/i)
    },
    {
      /**
       * this component when rendered will set an account activation
       * error in the globalErrors Redux state. The only issue here
       * is that if a component is not rendering the actual error message
       * that comes down, the Redux state will never be set.
       *
       * This means that we have 2 options
       *
       * 1. Dispatch the globalError Redux action somewhere in the interceptor.
       * 2. Fix the Landing page components to display the actual error being passed.
       */
      replacementText: <AccountActivationError errors={errors} />,
      condition: e =>
        !!e.reason.match(/account must be activated/i) && status === 403,
      callback: () => {
        if (store && !store.getState().globalErrors.account_unactivated) {
          store.dispatch(
            setErrors({
              account_unactivated: true
            })
          );
        }
      }
    },
    {
      replacementText: <MigrateError />,
      condition: e => {
        return (
          !!e.reason.match(/migrations are currently disabled/i) &&
          !!url.match(/migrate/i)
        );
      }
    }
  ]);

  // Downstream components should only have to handle ApiFieldErrors, not AxiosErrors.
  return Promise.reject(interceptedErrors);
};

// Enforce read-only mode while logged in as a customer.
baseRequest.interceptors.request.use(config => {
  const token: string = config.headers?.Authorization ?? '';
  const isLoggedInAsCustomer = token.startsWith('Admin');

  if (isLoggedInAsCustomer && config.method !== 'get') {
    return Promise.reject({
      response: {
        data: {
          errors: [
            {
              reason:
                'Only GET requests are available while logged in as a customer.'
            }
          ]
        }
      }
    });
  }
  return config;
});

baseRequest.interceptors.request.use(config => {
  const state = store.getState();
  /** Will end up being "Admin: 1234" or "Bearer 1234" */
  const token = ACCESS_TOKEN || (state.authentication?.token ?? '');

  let finalUrl = '';

  /**
   * override the base URL with the one we have defined in the .env file
   */
  if (config.url && config.baseURL) {
    finalUrl = config.baseURL.includes('login')
      ? config.url.replace(config.baseURL, LOGIN_ROOT)
      : config.url.replace(config.baseURL, API_ROOT);
  }

  return {
    ...config,
    url: finalUrl || config.url,
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
