import { APIError } from 'linode-js-sdk/lib/types';
import { DEFAULT_ERROR_MESSAGE } from 'src/constants';

export default (
  errorMap: { [index: string]: string },
  arr: APIError[] = []
) => (field: string): undefined | string => {
  // One time during a sprint review I was showing off the new RDNS for routed
  // ranges feature. When attempting to update the RDNS, the application
  // crashed. Either something went wrong in then `.then()` handler (more
  // likely), or we received an error response from the API we weren't prepared
  // to handle (less likely). I was not able to reproduce this issue without
  // manually throwing an error. Either way, this represents a chink in our
  // armor, as we always assume `.catch()`s will be called with an API error
  // response. This is an old error handling utility, but I wanted to add it
  // as a safeguard so that this particular bug wouldn't happen again.
  if (!Array.isArray(arr)) {
    return field === 'none' ? DEFAULT_ERROR_MESSAGE : undefined;
  }

  let err;

  if (field === 'none') {
    err = arr.find(e => !e.hasOwnProperty('field'));
  } else {
    err = arr.find(e => e.field === field);
  }

  if (!err) {
    return;
  }

  return err.field && errorMap[err.field]
    ? err.reason.replace(err.field, errorMap[err.field])
    : err.reason;
};
