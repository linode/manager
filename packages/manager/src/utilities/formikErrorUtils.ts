import { APIError } from '@linode/api-v4/lib/types';
import { reverse } from 'ramda';

import { getAPIErrorOrDefault } from './errorUtils';
import { isNilOrEmpty } from './isNilOrEmpty';

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
  label?: string;
  ipv4?: string;
  ipv6?: string;
}

/**
 * Handles given API errors and converts any specific subnet related errors into a usable format;
 * Returns a map of subnets to their @interface SubnetError, using known indexes
 * Example: errors = [{ reason: 'error1', field: 'subnets[1].label' },
 *                    { reason: 'error2', field: 'subnets[1].ipv4' },
 *                    { reason: 'not a subnet error', field: 'label'},
 *                    { reason: 'error3', field: 'subnets[4].ipv4' }]
 * returns: {
 *            0: {},
 *            1: { label: 'error1', ipv4: 'error2' },
 *            4: { ipv4: 'error3'}
 *          }
 *
 * ** Note: if the errors passed in contain subnet specific errors (ex: a field with value subnets[some-idx].some_subnet_field),
 * and there is no subnet[0] with an error, this function will insert an empty object for index 0 in the
 * return object. This does not cause any issues
 *
 * @param errors the errors from the API
 *        ex: numSubnets = 10, then the highest indexed subnet in errors should be at most subnet[9]
 * @param setFieldError function to set non subnet related field errors
 * @param setError function to set (non subnet related) general API errors
 */
export const handleVPCAndSubnetErrors = (
  errors: APIError[],
  setFieldError: (field: string, message: string) => void,
  setError?: (message: string) => void
) => {
  const subnetErrors = {};
  let subnetErrorBuilder: SubnetError = {};
  let curSubnetIndex = 0;
  let idx;

  for (let i = 0; i < errors.length; i++) {
    const error: APIError = errors[i];
    if (error.field && error.field.includes('subnets[')) {
      const [subnetIdx, field] = error.field.split('.');
      idx = parseInt(
        subnetIdx.substring(subnetIdx.indexOf('[') + 1, subnetIdx.indexOf(']')),
        10
      );
      // now that we're on a new idx, we store the previous
      // SubnetError, and start building a new one
      if (idx !== curSubnetIndex) {
        subnetErrors[curSubnetIndex] = subnetErrorBuilder;
        curSubnetIndex = idx;
        subnetErrorBuilder = {};
      }
      subnetErrorBuilder[field] = error.reason;
    } else {
      handleAPIErrors([error], setFieldError, setError);
    }
  }

  // check to ensure that if a SubnetError was built but
  // wasn't added in the for loop above, it gets included
  if (idx !== undefined && !subnetErrors[idx]) {
    subnetErrors[idx] = subnetErrorBuilder;
  }

  return subnetErrors;
};
