import { APIError } from 'linode-js-sdk/lib/types';

export default (
  errorMap: { [index: string]: string },
  arr: APIError[] = []
) => (field: string): undefined | string => {
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
