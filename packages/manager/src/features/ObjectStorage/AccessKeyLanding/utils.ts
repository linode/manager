import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';

import { areArraysEqual } from 'src/utilities/areArraysEqual';
import { sortByString } from 'src/utilities/sort-by';

import { FormState } from './OMC_AccessKeyDrawer';

export const generateUpdatePayload = (
  updatedValues: FormState,
  initialValues: FormState
) => {
  let updatePayload = {};

  const sortRegionOptions = (a: string, b: string) => {
    return sortByString(a, b, 'asc');
  };

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

export const hasLabelOrRegionsChanged = (
  updatedValues: FormState,
  initialValues: ObjectStorageKey
) => {
  const sortRegionOptions = (a: string, b: string) => {
    return sortByString(a, b, 'asc');
  };

  const regionsChanged = !areArraysEqual(
    [...updatedValues.regions].sort(sortRegionOptions),
    [...initialValues.regions?.map((region) => region.id)].sort(
      sortRegionOptions
    )
  );

  const labelChanged = updatedValues.label !== initialValues.label;

  return labelChanged || regionsChanged;
};
