import { sortByString } from '@linode/utilities';
import * as React from 'react';

import { RegionMultiSelect } from 'src/components/RegionSelect/RegionMultiSelect';
import { useObjectStorageRegions } from 'src/features/ObjectStorage/hooks/useObjectStorageRegions';
import { useFlags } from 'src/hooks/useFlags';

import { useIsObjectStorageGen2Enabled } from '../../hooks/useIsObjectStorageGen2Enabled';
import { WHITELISTED_REGIONS } from '../../utilities';

import type { Region } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  error?: string;
  name: string;
  onChange: (value: string[]) => void;
  required?: boolean;
  selectedRegion: string[];
}

const sortRegionOptions = (a: Region, b: Region) => {
  return sortByString(a.label, b.label, 'asc');
};

export const AccessKeyRegions = (props: Props) => {
  const { disabled, error, onChange, required, selectedRegion } = props;

  const flags = useFlags();
  const {
    allRegionsError,
    availableStorageRegions,
  } = useObjectStorageRegions();

  const { isObjectStorageGen2Enabled } = useIsObjectStorageGen2Enabled();

  // Error could be: 1. General Regions error, 2. Field error, 3. Nothing
  const errorText = error || allRegionsError?.[0]?.reason;

  return (
    <RegionMultiSelect
      forcefullyShownRegionIds={
        isObjectStorageGen2Enabled ? WHITELISTED_REGIONS : undefined
      }
      placeholder={
        selectedRegion.length > 0 ? '' : 'Select regions or type to search'
      }
      currentCapability="Object Storage"
      disabled={disabled}
      errorText={errorText}
      flags={flags}
      isClearable={false}
      label="Regions"
      onChange={onChange}
      regions={availableStorageRegions ?? []}
      required={required}
      selectedIds={selectedRegion}
      sortRegionOptions={sortRegionOptions}
    />
  );
};
