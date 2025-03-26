import { baseRequest } from '@linode/api-v4/lib/request';
import { AxiosHeaders } from 'axios';

import { ACCESS_TOKEN, API_ROOT, DEFAULT_ERROR_MESSAGE } from 'src/constants';
import { handleLogout } from 'src/store/authentication/authentication.actions';
import { setErrors } from 'src/store/globalErrors/globalErrors.actions';

import { getEnvLocalStorageOverrides } from './utilities/storage';

import type { ApplicationStore } from './store';
import type { Profile } from '@linode/api-v4';
import type { APIError } from '@linode/api-v4/lib/types';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

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
    store.dispatch(handleLogout());
  }

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

  if (
    !!errors[0].reason.match(/account must be activated/i) &&
    status === 403
  ) {
    store.dispatch(
      setErrors({
        account_unactivated: true,
      })
    );
  }

  // Downstream components should only have to handle ApiFieldErrors, not AxiosErrors.
  return Promise.reject(errors);
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

// The API returns an HTTP header for all
// requests made by Akamai users. This middleware injects the value
// of this header to the GET /profile response so it can be used
// throughout the app.
export type ProfileWithAkamaiAccountHeader = Profile & {
  _akamaiAccount: boolean;
};

export const injectAkamaiAccountHeader = (
  response: AxiosResponse
): AxiosResponse => {
  const akamaiAccountHeader = 'akamai-internal-account';
  // NOTE: this won't work locally (only staging and prod allow this header)
  if (isSuccessfulGETProfileResponse(response)) {
    const modifiedData: ProfileWithAkamaiAccountHeader = {
      ...response.data,
      _akamaiAccount: akamaiAccountHeader in response.headers,
    };
    return {
      ...response,
      data: modifiedData,
    };
  }
  return response;
};

export const isSuccessfulGETProfileResponse = (
  response: AxiosResponse
): response is AxiosResponse<Profile> => {
  const { config, status } = response;

  const method = config.method?.toLowerCase();
  const url = config.url?.toLowerCase();

  return (
    (method === 'get' && status === 200 && url?.endsWith('/profile')) ?? false
  );
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

  baseRequest.interceptors.response.use(injectAkamaiAccountHeader);
};
