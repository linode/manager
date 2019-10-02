import { APIError } from 'linode-js-sdk/lib/types';
import { getAPIErrorOrDefault } from './errorUtils';
import isNilOrEmpty from './isNilOrEmpty';

export const handleFieldErrors = (
  callback: Function,
  fieldErrors: APIError[] = []
) => {
  const mappedFieldErrors = fieldErrors.reduce(
    (result, { field, reason }) =>
      field ? { ...result, [field]: reason } : result,
    {}
  );

  if (!isNilOrEmpty(mappedFieldErrors)) {
    return callback(mappedFieldErrors);
  }
};

export const handleGeneralErrors = (
  callback: Function,
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
