import { DEFAULT_ERROR_MESSAGE } from 'src/constants';

import type { APIError } from '@linode/api-v4/lib/types';

export const getAPIErrorFor =
  (errorMap: { [index: string]: string }, arr: APIError[] = []) =>
  (field: string): string | undefined => {
    // Safeguard in case this function isn't called with an array.
    if (!Array.isArray(arr)) {
      return field === 'none' ? DEFAULT_ERROR_MESSAGE : undefined;
    }

    let err;

    if (field === 'none') {
      err = arr.find((e) => !Object.prototype.hasOwnProperty.call(e, 'field'));
    } else {
      err = arr.find((e) => e.field === field);
    }

    if (!err) {
      return;
    }

    return err.field && errorMap[err.field]
      ? err.reason.replace(err.field, errorMap[err.field])
      : err.reason;
  };
