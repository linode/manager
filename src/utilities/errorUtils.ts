import { pathOr } from 'ramda';

  export const getAPIErrorOrDefault = (
     errorResponse: Linode.ApiFieldError[],
     defaultError: string = "An unexpected error occurred.",
     field?: string,
   ): Linode.ApiFieldError[] => {
     const _defaultError = field
       ? [{ 'reason': defaultError, field }]
       : [{ 'reason': defaultError }]

      return errorResponse.length === 0 ? _defaultError : errorResponse
   }

  export const getErrorStringOrDefault = (
     errors: Linode.ApiFieldError[],
     defaultError: string = "An unexpected error occurred."
   ): string => {
   return pathOr<string>(defaultError, [0, 'reason'], errors);
 }