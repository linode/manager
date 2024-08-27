import { reverse } from 'ramda';

import { getAPIErrorOrDefault } from './errorUtils';
import { isNilOrEmpty } from './isNilOrEmpty';

import type { APIError } from '@linode/api-v4/lib/types';
import type { FormikErrors } from 'formik';

export const getFormikErrorsFromAPIErrors = <T>(
  errors: APIError[],
  prefixToRemoveFromFields?: string
): FormikErrors<T> => {
  return errors.reduce((acc: FormikErrors<T>, error: APIError) => {
    if (error.field) {
      const field = prefixToRemoveFromFields
        ? error.field.replace(prefixToRemoveFromFields, '')
        : error.field;

      set(acc, field, error.reason);
    }
    return acc;
  }, {});
};

// regex used in the below set function
const onlyDigitsRegex = /^\d+$/;

/**
 * Helper for getFormikErrorsFromAPIErrors, sets the given value at a specified path of the given object.
 * Note that while we are using this function in place of lodash's set, it is not an exact replacement.
 * This method both mutates the passed in object and returns it.
 *
 * @param object — The object to modify.
 * @param path — The path of the property to set.
 * @param value — The value to set.
 * @return — Returns object.
 */
export const set = (obj: object, path: string, value: any): object => {
  const parts = path.split(/\.|\[|\]/).filter(Boolean);

  // ensure that obj is not an array and that the path is prototype pollution safe
  if (Array.isArray(obj) || !isPrototypePollutionSafe(parts)) {
    return obj;
  }

  parts.reduce((acc: any, part: string, index: number) => {
    if (index === parts.length - 1) {
      // Last part, set the value
      acc[part] = value;
    } else if (part.match(onlyDigitsRegex)) {
      // Handle array indices
      const arrayIndex = parseInt(part, 10);
      acc[arrayIndex] =
        acc[arrayIndex] ?? (parts[index + 1].match(onlyDigitsRegex) ? [] : {});
    } else {
      // Handle nested objects
      const potentialNextVal = parts[index + 1].match(onlyDigitsRegex)
        ? []
        : {};
      acc[part] = typeof acc[part] === 'object' ? acc[part] : potentialNextVal;
    }
    return acc[part];
  }, obj);

  return obj;
};

/**
 * Ensures a path cannot lead to a prototype pollution issue.
 *
 * @param path - The path to check
 * @return - boolean depending on whether the path is safe or not
 */
const isPrototypePollutionSafe = (path: string[]): boolean => {
  return path.reduce((safeSoFar, val) => {
    const isCurKeySafe =
      val !== '__proto__' && val !== 'prototype' && val !== 'constructor';
    return safeSoFar && isCurKeySafe;
  }, true);
};

export const handleFieldErrors = (
  callback: (error: unknown) => void,
  fieldErrors: APIError[] = []
) => {
  const mappedFieldErrors = reverse(fieldErrors).reduce(
    (result, { field, reason }) =>
      field ? { ...result, [field]: reason } : result,
    {}
  );

  if (!isNilOrEmpty(mappedFieldErrors)) {
    return callback(mappedFieldErrors);
  }
};

export const handleGeneralErrors = (
  callback: (error: unknown) => void,
  apiErrors: APIError[],
  defaultMessage: string = 'An error has occurred.'
) => {
  if (!apiErrors) {
    return callback(defaultMessage);
  }

  const _apiErrors = getAPIErrorOrDefault(apiErrors, defaultMessage);

  const generalError =
    typeof _apiErrors[0].reason !== 'string'
      ? _apiErrors[0].reason
      : _apiErrors
          .reduce(
            (result, { field, reason }) =>
              field ? result : [...result, reason],
            []
          )
          .join(',');

  if (!isNilOrEmpty(generalError)) {
    return callback(generalError);
  }
};

export const handleAPIErrors = (
  errors: APIError[],
  setFieldError: (field: string, message: string) => void,
  setError?: (message: string) => void
) => {
  errors.forEach((error: APIError) => {
    if (error.field) {
      /**
       * The line below gets the field name because the API returns something like this...
       * {"errors": [{"reason": "Invalid credit card number", "field": "data.card_number"}]}
       * It takes 'data.card_number' and translates it to 'card_number'
       */
      const key = error.field.split('.')[error.field.split('.').length - 1];
      if (key) {
        setFieldError(key, error.reason);
      }
    } else {
      // Put any general API errors into a <Notice />
      if (setError) {
        setError(error.reason);
      }
    }
  });
};

export interface SubnetError {
  ipv4?: string;
  ipv6?: string;
  label?: string;
}

/**
 * Handles given API errors and converts any specific subnet related errors into a usable format;
 * Returns a map of subnets' indexes to their @interface SubnetError
 * Example: errors = [{ reason: 'error1', field: 'subnets[1].label' },
 *                    { reason: 'error2', field: 'subnets[1].ipv4' },
 *                    { reason: 'not a subnet error so will not appear in return obj', field: 'label'},
 *                    { reason: 'error3', field: 'subnets[4].ipv4' }]
 * returns: {
 *            1: { label: 'error1', ipv4: 'error2' },
 *            4: { ipv4: 'error3'}
 *          }
 *
 * @param errors the errors from the API
 * @param setFieldError function to set non-subnet related field errors
 * @param setError function to set (non-subnet related) general API errors
 */
export const handleVPCAndSubnetErrors = (
  errors: APIError[],
  setFieldError: (field: string, message: string) => void,
  setError?: (message: string) => void
) => {
  const subnetErrors: Record<number, SubnetError> = {};
  const nonSubnetErrors: APIError[] = [];

  errors.forEach((error) => {
    if (error.field && error.field.includes('subnets[')) {
      const [subnetIdx, field] = error.field.split('.');
      const idx = parseInt(
        subnetIdx.substring(subnetIdx.indexOf('[') + 1, subnetIdx.indexOf(']')),
        10
      );

      // if there already exists some previous error for the subnet at index idx, we
      // just add the current error. Otherwise, we create a new entry for the subnet.
      if (subnetErrors[idx]) {
        subnetErrors[idx] = { ...subnetErrors[idx], [field]: error.reason };
      } else {
        subnetErrors[idx] = { [field]: error.reason };
      }
    } else {
      nonSubnetErrors.push(error);
    }
  });

  handleAPIErrors(nonSubnetErrors, setFieldError, setError);
  return subnetErrors;
};
