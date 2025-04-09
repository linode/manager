import type { APIError } from '@linode/api-v4';
import type { AxiosError } from 'axios';
import { timeout } from 'support/util/backoff';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';

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
const isValidationError = (e: any): e is APIError[] => {
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
const isAxiosError = (e: any): e is AxiosError => {
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
const isLinodeApiError = (e: any): e is AxiosError<LinodeApiV4Error> => {
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
const enhanceError = (e: Error) => {
  // Check for most specific error types first.
  if (isLinodeApiError(e)) {
    // If `e` is a Linode APIv4 error response, show the status code, error messages,
    // and request URL when applicable.
    const summary = !!e.response?.status
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
    const summary = !!e.response?.status
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
 * Describes an object which can contain a label.
 */
export interface Labelable {
  label: string;
}

/**
 * Yields a Cypress Promise that can be used in place of a native Promise.
 *
 * @param promise - Promise with result to await.
 * @param options - Defer options.
 *
 * @returns Promise result.
 */
Cypress.Commands.add(
  'defer',
  { prevSubject: false },
  <T>(
    promiseGenerator: () => Promise<T>,
    labelOrOptions?:
      | Partial<Cypress.Loggable & Cypress.Timeoutable & Labelable>
      | string
  ) => {
    // Gets the label that will used as the description for Cypress's log.
    const commandLabel = (() => {
      if (typeof labelOrOptions === 'string') {
        return labelOrOptions;
      }
      return labelOrOptions?.label ?? 'waiting for promise';
    })();

    // Gets the options object that will be passed to `cy.wrap`.
    const wrapOptions = (() => {
      if (typeof labelOrOptions !== 'string') {
        return {
          ...(labelOrOptions ?? {}),
          log: false,
        };
      }
      return { log: false };
    })();

    const timeoutLength = (() => {
      if (typeof labelOrOptions !== 'string') {
        return labelOrOptions?.timeout ?? LINODE_CREATE_TIMEOUT;
      }
      return LINODE_CREATE_TIMEOUT;
    })();

    const commandLog = Cypress.log({
      autoEnd: false,
      end: false,
      message: commandLabel,
      name: 'defer',
      timeout: timeoutLength,
    });

    // Wraps the given promise in order to update Cypress's log on completion.
    const wrapPromise = async (): Promise<T> => {
      let result: T;
      try {
        result = await promiseGenerator();
      } catch (e: any) {
        commandLog.error(e);
        // If we're getting rate limited, timeout for 15 seconds so that
        // test reattempts do not immediately trigger more 429 responses.
        if (isAxiosError(e) && e.response?.status === 429) {
          await timeout(15000);
        }
        throw enhanceError(e);
      }
      commandLog.end();
      return result;
    };

    return cy.wrap<Promise<T>, T>(wrapPromise(), wrapOptions);
  }
);
