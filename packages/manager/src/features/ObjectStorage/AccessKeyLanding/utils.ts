import { areArraysEqual, sortByString } from '@linode/utilities';

import type { DisplayedAccessKeyScope, FormState } from './OMC_AccessKeyDrawer';
import type { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';

type UpdatePayload =
  | { label: FormState['label']; regions: FormState['regions'] }
  | { label: FormState['label'] }
  | { regions: FormState['regions'] }
  | {};

const sortRegionOptions = (a: string, b: string) => {
  return sortByString(a, b, 'asc');
};

/**
 * Generates an update payload for edit access key based on changes in form values.
 *
 * @param {FormState} updatedValues - The current state of the form.
 * @param {FormState} initialValues - The initial state of the form for comparison.
 * @returns An object containing the fields that have changed.
 */
export const generateUpdatePayload = (
  updatedValues: FormState,
  initialValues: FormState
): UpdatePayload => {
  let updatePayload = {};

  const labelChanged = updatedValues.label !== initialValues.label;
  const regionsChanged = !areArraysEqual(
    [...updatedValues.regions].sort(sortRegionOptions),
    [...initialValues.regions].sort(sortRegionOptions)
  );

  if (labelChanged && regionsChanged) {
    updatePayload = {
      label: updatedValues.label,
      regions: updatedValues.regions,
    };
  } else if (labelChanged) {
    updatePayload = { label: updatedValues.label };
  } else if (regionsChanged) {
    updatePayload = { regions: updatedValues.regions };
  }

  return updatePayload;
};

/**
 * Determines if there have been any changes in the label or regions
 * between the updated form values and the initial values.
 *
 * @param {FormState} updatedValues - The current state of the form.
 * @param {ObjectStorageKey} initialValues - The initial values for comparison.
 * @returns {boolean} True if there are changes in label or regions, false otherwise.
 */
export const hasLabelOrRegionsChanged = (
  updatedValues: FormState,
  initialValues: ObjectStorageKey
): boolean => {
  const regionsChanged = !areArraysEqual(
    [...updatedValues.regions].sort(sortRegionOptions),
    [...initialValues.regions.map((region) => region.id)].sort(
      sortRegionOptions
    )
  );

  const labelChanged = updatedValues.label !== initialValues.label;

  return labelChanged || regionsChanged;
};

/**
 * Determines whether the selection of access key scopes has been made for every bucket,
 * since by default, the displayed permissions are set to null.
 *
 * @param bucketAccess - The array of bucket objects.
 * @returns {boolean} True if all buckets have permissions set to none/read_only/read_write or if there are no buckets, false otherwise.
 */
export const hasAccessBeenSelectedForAllBuckets = (
  bucketAccess: DisplayedAccessKeyScope[] | null
): boolean => {
  if (!bucketAccess) {
    return true;
  }
  return bucketAccess.every((bucket) => bucket.permissions !== null);
};
