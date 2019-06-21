import * as React from 'react';
import { GPUError } from 'src/components/GPUError';

export const interceptGPUErrors = (
  selectedTypeID?: Linode.LinodeTypeClass,
  errors?: Linode.ApiFieldError[]
) => {
  if (!errors) {
    return [];
  } // this will never happen
  if (!selectedTypeID) {
    return errors;
  } // Also shouldn't happen
  /**
   * We don't have a good way of identifying this specific error
   * (which needs to be treated specially with a link to an open,
   * pre-filled support ticket). Checking the text of the error
   * and the type string of the plan is the best we can do.
   *
   * Passing JSX to an APIFieldError.reason doesn't seem to break anything,
   * but if we do this anywhere else we'll have to update the typings.
   */
  return errors.map(thisError => {
    if (!thisError.reason) {
      return thisError;
    }
    if (
      thisError.reason.match(/verification is required/) &&
      selectedTypeID.match(/gpu/)
    ) {
      return { reason: <GPUError /> };
    }

    return thisError;
  });
};
