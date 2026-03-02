import { isNilOrEmpty } from '@linode/utilities';

import { getAPIErrorOrDefault } from './errorUtils';

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
export const set = <T>(
  obj: FormikErrors<T>,
  path: string,
  value: string
): FormikErrors<T> => {
  const parts = path.split(/\.|\[|\]/).filter(Boolean);

  // ensure that obj is not an array and that the path is prototype pollution safe
  if (Array.isArray(obj) || !isPrototypePollutionSafe(parts)) {
    return obj;
  }

  parts.reduce((acc: Record<string, unknown>, part: string, index: number) => {
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
  const mappedFieldErrors = [...fieldErrors]
    .reverse()
    .reduce(
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

  const generalError = _apiErrors
    .reduce(
      (result, { field, reason }) => (field ? result : [...result, reason]),
      []
    )
    .join(',');

  if (!isNilOrEmpty(generalError)) {
    return callback(generalError);
  }
};

/**
 * This function checks if the parent field from the APIError object is included
 * in parentFields list and returns true if if it's found.
 * This check will determine whether to provide the full key (parent.child) or just the translated key
 * in the handleAPIErrors function.
 */
const keepParentChildFieldKey = (
  error: APIError,
  parentFields: string[]
): boolean => {
  const key = error.field?.split('.')[0];
  return parentFields.includes(key ?? '');
};

export const handleAPIErrors = (
  errors: APIError[],
  setFieldError: (field: string, message: string) => void,
  setError?: (message: string) => void,
  parentFields?: string[]
) => {
  errors.forEach((error: APIError) => {
    if (error.field) {
      /**
       * The line below gets the field name because the API returns something like this...
       * {"errors": [{"reason": "Invalid credit card number", "field": "data.card_number"}]}
       * It takes 'data.card_number' and translates it to 'card_number'
       * If parentFields is provided, then it will provide the full field key for those fields without translation
       * ie. In the example above, if parentFields was ['data'] then the field key would continue to be 'data.card_number'.
       * This will be useful for when we want to set error messages for the nested fields of a parent.
       */
      const key = keepParentChildFieldKey(error, parentFields ?? [])
        ? error.field
        : error.field.split('.')[error.field.split('.').length - 1];

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
