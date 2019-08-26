import { getAPIErrorOrDefault } from './errorUtils';
import isNilOrEmpty from './isNilOrEmpty';

export const handleFieldErrors = (
  callback: Function,
  fieldErrors: Linode.ApiFieldError[]
) => {
  if (!fieldErrors) {
    // Not sure what to return here, but there's a hot reloading
    // bug that crashes the app in this function sometimes.
    return;
  }

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
  apiErrors: Linode.ApiFieldError[],
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
