import { baseRequest } from '@linode/api-v4/lib/request';
import { APIError } from '@linode/api-v4/lib/types';
import {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import * as React from 'react';

import { AccountActivationError } from 'src/components/AccountActivation';
import { MigrateError } from 'src/components/MigrateError';
import { VerificationError } from 'src/components/VerificationError';
import { ACCESS_TOKEN, API_ROOT, DEFAULT_ERROR_MESSAGE } from 'src/constants';
import { handleLogout } from 'src/store/authentication/authentication.actions';
import { setErrors } from 'src/store/globalErrors/globalErrors.actions';
import { interceptErrors } from 'src/utilities/interceptAPIError';

import { SupportError } from './components/SupportError';
import { ApplicationStore } from './store';
import { getEnvLocalStorageOverrides } from './utilities/storage';

const handleSuccess: <T extends AxiosResponse<any>>(response: T) => T | T = (
  response
) => {
  if (!!response.headers['x-maintenance-mode']) {
    Promise.reject(response);
  }

  return response;
};

// All errors returned by the actual Linode API are in this shape.
export type LinodeError = { errors: APIError[] };

export const handleError = (
  error: AxiosError<LinodeError>,
  store: ApplicationStore
) => {
  if (error.response && error.response.status === 401) {
    /**
     * this will blow out redux state and the componentDidUpdate in the
     * AuthenticationWrapper.tsx will be responsible for redirecting to Login
     */
    // store.dispatch(handleLogout());
  }

  const config = error.response?.config;
  const url = config?.url ?? '';
  const status: number = error.response?.status ?? 0;
  const errors: APIError[] = error.response?.data?.errors ?? [
    { reason: DEFAULT_ERROR_MESSAGE },
  ];

  const apiInMaintenanceMode = !!error.response?.headers['x-maintenance-mode'];

  if (apiInMaintenanceMode) {
    store.dispatch(
      setErrors({
        api_maintenance_mode: true,
      })
    );
  }

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
      condition: (e) => !!e.reason.match(/verification is required/i),
      replacementText: (
        <VerificationError
          title={
            requestedLinodeType.match(/gpu/i)
              ? 'GPU Request'
              : 'Verification Request'
          }
        />
      ),
    },
    {
      callback: () => {
        if (store && !store.getState().globalErrors.account_unactivated) {
          store.dispatch(
            setErrors({
              account_unactivated: true,
            })
          );
        }
      },
      condition: (e) =>
        !!e.reason.match(/account must be activated/i) && status === 403,
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
    },
    {
      condition: (e) => {
        return (
          !!e.reason.match(/migrations are currently disabled/i) &&
          !!url.match(/migrate/i)
        );
      },
      replacementText: <MigrateError />,
    },
    {
      condition: (e) => {
        return (
          (!!e.reason.match(/.*open a support ticket/i) ||
            !!e.reason.match(/contact Support/i)) &&
          !e.field
        );
      },
      replacementText: <SupportError errors={errors} />,
    },
  ]);

  // Downstream components should only have to handle ApiFieldErrors, not AxiosErrors.
  return Promise.reject(interceptedErrors);
};

export const getURL = ({ baseURL, url }: AxiosRequestConfig) => {
  if (!url || !baseURL) {
    return;
  }

  const localStorageOverrides = getEnvLocalStorageOverrides();

  const apiRoot = localStorageOverrides?.apiRoot ?? API_ROOT;

  // If we have environment overrides in local storage, use those. Otherwise,
  // override the baseURL (from @linode/api-v4) with the one we have defined
  // in the environment (via .env file).
  return url.replace(baseURL, apiRoot);
};

// A user's external UUID can be found on the response to /account.
// Since that endpoint is not available to restricted users, the API also
// returns it as an HTTP header ("X-Customer-Uuid"). This middleware injects
// the value of the header to the GET /profile response so it can be added to
// the Redux store and used throughout the app.
export const injectEuuidToProfile = (
  response: AxiosResponse
): AxiosResponse => {
  if (isSuccessfulGETProfileResponse(response)) {
    const xCustomerUuidHeader = getXCustomerUuidHeader(response);
    if (xCustomerUuidHeader) {
      const profileWithEuuid = {
        ...response.data,
        _euuidFromHttpHeader: xCustomerUuidHeader,
      };

      return {
        ...response,
        data: profileWithEuuid,
      };
    }
  }
  return response;
};

export const isSuccessfulGETProfileResponse = (response: AxiosResponse) => {
  const { config, status } = response;

  const method = config.method?.toLowerCase();
  const url = config.url?.toLowerCase();

  return method === 'get' && status === 200 && url?.endsWith('/profile');
};

export const getXCustomerUuidHeader = (
  response: AxiosResponse
): string | undefined => {
  return response.headers['x-customer-uuid'];
};

export const setupInterceptors = (store: ApplicationStore) => {
  baseRequest.interceptors.request.use((config) => {
    const state = store.getState();
    /** Will end up being "Admin 1234" or "Bearer 1234" */
    const token = ACCESS_TOKEN || (state.authentication?.token ?? '');

    const url = getURL(config);

    const headers = new AxiosHeaders(config.headers);

    // If headers are explicitly passed to our endpoint via
    // setHeaders(), we don't want this overridden.
    const hasExplicitAuthToken = headers.hasAuthorization();

    const bearer = hasExplicitAuthToken ? headers.getAuthorization() : token;

    headers.setAuthorization(bearer);

    return {
      ...config,
      headers,
      url,
    };
  });

  /*
  Interceptor that:
    * initiates re-authentication if the response is HTTP 401 "Unauthorized"
    * displays a Maintenance view if the API is in Maintenance mode
  Also rejects non-error responses if the API is in Maintenance mode
  */
  baseRequest.interceptors.response.use(
    handleSuccess,
    (error: AxiosError<LinodeError>) => handleError(error, store)
  );

  baseRequest.interceptors.response.use(injectEuuidToProfile);
};
