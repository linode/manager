import { AxiosError } from 'axios';
import { pathOr } from 'ramda';

export const getAPIErrorOrDefault = (
  errorResponse: Linode.ApiFieldError[] | AxiosError,
  defaultError: string = 'An unexpected error occurred.',
  field?: string
): Linode.ApiFieldError[] => {
  const _defaultError = field
    ? [{ reason: defaultError, field }]
    : [{ reason: defaultError }];

  return pathOr(_defaultError, ['response', 'data', 'errors'], errorResponse);
};

export const getErrorStringOrDefault = (
  errors: Linode.ApiFieldError[],
  defaultError: string = 'An unexpected error occurred.'
): string => {
  return pathOr<string>(defaultError, [0, 'reason'], errors);
};

const tagRegEx = new RegExp(/tags/);

export const getTagErrors = (errors?: Linode.ApiFieldError[]): string[] => {
  if (!errors) {
    return [];
  }
  return errors
    .filter(error => Boolean(error.field) && tagRegEx.test(error.field!))
    .map(error => error.reason);
};
