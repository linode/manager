import { AxiosError } from 'axios';
import { path, pathOr } from 'ramda';

export const getAPIErrorOrDefault = (
  errorResponse: AxiosError,
  defaultError: string = "An unexpected error occurred.",
  field?: string,
  ): Linode.ApiFieldError[] => {
  const _defaultError = field
    ? [{ 'reason': defaultError, field: 'field' }]
    : [{ 'reason': defaultError }]

  return pathOr<Linode.ApiFieldError[]>(
    _defaultError,
    ['response','data','errors'],
    errorResponse,
  )
  }

export const getErrorStringOrDefault = (error: AxiosError | Linode.ApiFieldError[], defaultError: string): string => {
  // This will be the default case after refactors
  const reason = path<string>([0, 'reason'], error);
  if (reason) { return reason; }
  // If passed an AxiosError, dive to the reason for the first error in the array (if any)
  return pathOr<string>(
    defaultError,
    ['response','data','errors', 0, 'reason'],
    error
  )
}