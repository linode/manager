import { baseRequest } from '@linode/api-v4/lib/request';
import { AxiosHeaders } from 'axios';

import { ACCESS_TOKEN, API_ROOT, DEFAULT_ERROR_MESSAGE } from 'src/constants';
import { setErrors } from 'src/store/globalErrors/globalErrors.actions';
import { sendCustomerUuidEvent } from 'src/utilities/analytics/utils';

import { clearAuthDataFromLocalStorage, redirectToLogin } from './OAuth/oauth';
import { getEnvLocalStorageOverrides, storage } from './utilities/storage';

import type { ApplicationStore } from './store';
import type { APIError, Profile } from '@linode/api-v4';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const handleSuccess: <T extends AxiosResponse<any>>(response: T) => T | T = (
  response
) => {
  if (response.headers['x-maintenance-mode']) {
    Promise.reject(response);
  }

  return response;
};

// All errors returned by the actual Linode API are in this shape.
export type LinodeError = { errors: APIError[] };

/**
 * Exists to prevent the async `redirectToLogin` function from being called many times
 * when many 401 API errors are handled at the same time.
 *
 * Without this, `redirectToLogin` may be invoked many times before navigation to login actually happens,
 * which results in the nonce and code verifier being re-generated, leading to authentication race conditions.
 */
let isRedirectingToLogin = false;

export const handleError = (
  error: AxiosError<LinodeError>,
  store: ApplicationStore
) => {
  if (
    error.response &&
    error.response.status === 401 &&
    !store.getState().pendingUpload &&
    !isRedirectingToLogin &&
    window.location.pathname !== '/oauth/callback'
  ) {
    isRedirectingToLogin = true;
    clearAuthDataFromLocalStorage();
    redirectToLogin();
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

/**
 * Flag to ensure we only send the EUUID to Adobe Analytics once per session.
 * The EUUID doesn't change during a session, so we only need to track it once.
 */
let hasTrackedCustomerUuid = false;

/**
 * Extracts the X-Customer-Uuid header from API responses and sends it to Adobe Analytics.
 * This header contains the EUUID (Enterprise UUID) which identifies customers,
 * including those with restricted billing access who may not have access to account info.
 *
 * The EUUID is only tracked once per session to avoid duplicate analytics events.
 */
export const extractAndTrackCustomerUuid = (
  response: AxiosResponse
): AxiosResponse => {
  const customerUuidHeader = 'x-customer-uuid';

  if (!hasTrackedCustomerUuid && customerUuidHeader in response.headers) {
    const euuid = response.headers[customerUuidHeader];
    if (euuid && typeof euuid === 'string') {
      sendCustomerUuidEvent(euuid);
      hasTrackedCustomerUuid = true;
    }
  }

  return response;
};

export const setupInterceptors = (store: ApplicationStore) => {
  baseRequest.interceptors.request.use(async (config) => {
    if (
      window.location.pathname === '/oauth/callback' ||
      window.location.pathname === '/admin/callback'
    ) {
      throw new Error(
        'API calls blocked during authentication callback processing'
      );
    }

    const url = getURL(config);

    const headers = new AxiosHeaders(config.headers);

    // If headers are explicitly passed to our endpoint via
    // setHeaders(), we don't want this overridden.
    const hasExplicitAuthToken = headers.hasAuthorization();

    const token = ACCESS_TOKEN ?? storage.authentication.token.get() ?? null;
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

  // Extract the EUUID (Enterprise UUID) from the X-Customer-Uuid header
  // and send it to Adobe Analytics. This header is returned on authenticated
  // API requests and identifies customers, including those with restricted billing access.
  baseRequest.interceptors.response.use(extractAndTrackCustomerUuid);
};
