import { isEmpty, isNil, path } from 'ramda';
import { tagRegEx } from 'src/utilities/errorUtils';

export const isNilOrEmpty = (v: any) => isNil(v) || isEmpty(v);

export const maybeCastToNumber = (v: string | number) =>
  isNilOrEmpty(v) ? undefined : Number(v);

export const handleFieldErrors = (callback: Function, response: any) => {
  const fieldErrors = path<Linode.ApiFieldError[]>(
    ['response', 'data', 'errors'],
    response
  );

  if (!fieldErrors) {
    return;
  }

  const mappedFieldErrors = fieldErrors.reduce(
    (result, { field, reason }) =>
      field
        ? // Tags have a field of 'tags[0]', so need to handle them separately:
          tagRegEx.test(field)
          ? { ...result, tags: reason }
          : { ...result, [field]: reason }
        : result,
    {}
  );

  if (!isNilOrEmpty(mappedFieldErrors)) {
    return callback(mappedFieldErrors);
  }
};

export const handleGeneralErrors = (
  callback: Function,
  errors: any,
  defaultMessage: string = 'An error has occured.'
) => {
  const apiErrors = path<Linode.ApiFieldError[]>(
    ['response', 'data', 'errors'],
    errors
  );

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
