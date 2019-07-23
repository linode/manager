import { isEmpty, isNil } from 'ramda';

export const isNilOrEmpty = (v: any) => isNil(v) || isEmpty(v);

export const maybeCastToNumber = (v: string | number) =>
  isNilOrEmpty(v) ? undefined : Number(v);

export const handleFieldErrors = (
  callback: Function,
  fieldErrors: Linode.ApiFieldError[]
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
  apiErrors: Linode.ApiFieldError[],
  defaultMessage: string = 'An error has occurred.'
) => {
  if (!apiErrors) {
    return callback(defaultMessage);
  }

  const generalError = apiErrors
    .reduce(
      (result, { field, reason }) => (field ? result : [...result, reason]),
      []
    )
    .join(',');

  if (!isNilOrEmpty(generalError)) {
    return callback(generalError);
  }
};
