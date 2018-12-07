import { AxiosError } from 'axios';
import { pathOr } from 'ramda';

export const getAPIErrorOrDefault = (errorResponse: AxiosError, defaultError: string): Linode.ApiFieldError[] => {
  return pathOr<Linode.ApiFieldError[]>(
    [{'reason': defaultError}],
    ['response','data','errors'],
    errorResponse,
  )
}

export const getErrorStringOrDefault = (ApiError: Linode.ApiFieldError[], defaultError: string): string => {
  return pathOr<string>(
    defaultError,
    [0, 'reason'],
    ApiError
  )
}