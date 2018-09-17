import { AxiosError } from 'axios';
import { lensPath, over, path } from 'ramda';

/**
 * Helper function to aide in creating consistently shaped error objects like those returned
 * from the API.
 */
export const createAPIError: (reason: string, field?: string) => Linode.ApiFieldError
  = (reason, field) => ({
    reason,
    ...(field && { field }),
  });

/**
 * Maps a Linode.APIFieldError to an object where the field are the keys and the reasons are
 * the values. In the case of a "general" error, where there is no field, the field will be set to
 * __general.
 */
export const mapErrorToObject = (e: Linode.ApiFieldError): { [idx: string]: string } => {
  const key = e.field ? e.field : '__general';
  const value = e.reason;

  return { [key]: value };
};

/**
 * Reduce a list of Linode.ApiFieldError to an object.
 */
export const mapAPIErrorsToObject: (e?: Linode.ApiFieldError[]) => { [key: string]: string } =
  (e = []) =>
    e.reduce((obj, error) => ({ ...obj, ...mapErrorToObject(error) }), {});

export const updateAPIFieldError = (field: string, reason: string) => (err: any) =>
  err.field && err.field === field
    ? { field, reason }
    : err;


export const isAxiosError = (err: AxiosError | Error): err is AxiosError => {
  return (err as AxiosError).hasOwnProperty('config');
};

export const isResponse = (err: AxiosError) => {
  return err.hasOwnProperty('response');
};

type MapErrors = (e: Linode.ApiFieldError[]) => Linode.ApiFieldError[];

export const updateAPIErrorResponse = (fn: MapErrors) => (error: any) => {
  const hasErrors = path(['response', 'data', 'errors'], error);
  if (hasErrors) {
    return updateErrors(fn, error);
  }

  return error;
};

const updateErrors = over(lensPath(['response', 'data', 'errors']));

