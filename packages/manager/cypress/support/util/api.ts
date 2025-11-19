/**
 * @file Utilities to help configure @linode/api-v4 package.
 */

import { APIError, baseRequest } from '@linode/api-v4';
import { AxiosError, AxiosHeaders } from 'axios';

// Note: This file is imported by Cypress plugins, and indirectly by Cypress
// tests. Because Cypress has not been initiated when plugins are executed, we
// cannot use any Cypress functionality in this module without causing a crash
// at startup.

type LinodeApiV4Error = {
  errors: APIError[];
};

/**
 * Returns `true` if the given error is a Linode API schema validation error.
 *
 * Type guards `e` as an array of `APIError` objects.
 *
 * @param e - Error.
 *
 * @returns `true` if `e` is a Linode API schema validation error.
 */
export const isValidationError = (e: any): e is APIError[] => {
  // When a Linode APIv4 schema validation error occurs, an array of `APIError`
  // objects is thrown rather than a typical `Error` type.
  return (
    Array.isArray(e) &&
    e.every((item: any) => {
      return 'reason' in item;
    })
  );
};

/**
 * Returns `true` if the given error is an Axios error.
 *
 * Type guards `e` as an `AxiosError` instance.
 *
 * @param e - Error.
 *
 * @returns `true` if `e` is an `AxiosError`.
 */
export const isAxiosError = (e: any): e is AxiosError => {
  return !!e.isAxiosError;
};

/**
 * Returns `true` if the given error is a Linode API v4 request error.
 *
 * Type guards `e` as an `AxiosError<LinodeApiV4Error>` instance.
 *
 * @param e - Error.
 *
 * @returns `true` if `e` is a Linode API v4 request error.
 */
export const isLinodeApiError = (e: any): e is AxiosError<LinodeApiV4Error> => {
  if (isAxiosError(e)) {
    const responseData = e.response?.data as any;
    return (
      responseData.errors &&
      Array.isArray(responseData.errors) &&
      responseData.errors.every((item: any) => {
        return 'reason' in item;
      })
    );
  }
  return false;
};

/**
 * Detects known error types and returns a new Error with more detailed message.
 *
 * Unknown error types are returned without modification.
 *
 * @param e - Error.
 *
 * @returns A new error with added information in message, or `e`.
 */
export const enhanceError = (e: Error) => {
  // Check for most specific error types first.
  if (isLinodeApiError(e)) {
    // If `e` is a Linode APIv4 error response, show the status code, error messages,
    // and request URL when applicable.
    const summary = e.response?.status
      ? `Linode APIv4 request failed with status code ${e.response.status}`
      : `Linode APIv4 request failed`;

    const errorDetails = e.response!.data.errors.map((error: APIError) => {
      return error.field
        ? `- ${error.reason} (field '${error.field}')`
        : `- ${error.reason}`;
    });

    const requestInfo =
      !!e.request?.responseURL && !!e.config?.method
        ? `\nRequest: ${e.config.method.toUpperCase()} ${e.request.responseURL}`
        : '';

    return new Error(`${summary}\n${errorDetails.join('\n')}${requestInfo}`);
  }

  if (isAxiosError(e)) {
    // If `e` is an Axios error (but not a Linode API error specifically), show the
    // status code, error messages, and request URL when applicable.
    const summary = e.response?.status
      ? `Request failed with status code ${e.response.status}`
      : `Request failed`;

    const requestInfo =
      !!e.request?.responseURL && !!e.config?.method
        ? `\nRequest: ${e.config.method.toUpperCase()} ${e.request.responseURL}`
        : '';

    return new Error(`${summary}${requestInfo}`);
  }

  // Handle cases where a validation error is thrown.
  // These are arrays containing `APIError` objects; no additional request context
  // is included so we only have the validation error messages themselves to work with.
  if (isValidationError(e)) {
    // Validation errors do not contain any additional context (request URL, payload, etc.).
    // Show the validation error messages instead.
    const multipleErrors = e.length > 1;
    const summary = multipleErrors
      ? 'Request failed with Linode schema validation errors'
      : 'Request failed with Linode schema validation error';

    // Format, accounting for 0, 1, or more errors.
    const validationErrorMessage = multipleErrors
      ? e
          .map((error) =>
            error.field
              ? `- ${error.reason} (field '${error.field}')`
              : `- ${error.reason}`
          )
          .join('\n')
      : e
          .map((error) =>
            error.field
              ? `${error.reason} (field '${error.field}')`
              : `${error.reason}`
          )
          .join('\n');

    return new Error(`${summary}\n${validationErrorMessage}`);
  }
  // Return `e` unmodified if it's not handled by any of the above cases.
  return e;
};

/**
 * Default API root URL to use for replacement logic when using a URL override.
 *
 * This value is copied from the @linode/api-v4 package.
 *
 * @link https://github.com/linode/manager/blob/develop/packages/api-v4/src/request.ts
 */
export const defaultApiRoot = 'https://api.linode.com/v4';

/**
 * Configures and authenticates Linode API requests initiated by Cypress.
 *
 * @param accessToken - API access token with which to authenticate requests.
 * @param baseUrl - Optional Linode API base URL.
 */
export const configureLinodeApi = (accessToken: string, baseUrl?: string) => {
  baseRequest.interceptors.request.use((config) => {
    const headers = new AxiosHeaders(config.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);

    // If a base URL is provided, override the request URL
    // using the given base URL.
    if (baseUrl && config.url) {
      config.url = config.url.replace(defaultApiRoot, baseUrl);
    }

    return { ...config, headers };
  });
};
