import { useAllAccountAvailabilitiesQuery } from '@linode/queries';
import * as React from 'react';

import { Flag } from 'src/components/Flag';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useObjectStorageRegions } from 'src/features/ObjectStorage/hooks/useObjectStorageRegions';
import { useFlags } from 'src/hooks/useFlags';

import { useIsObjectStorageGen2Enabled } from '../hooks/useIsObjectStorageGen2Enabled';
import { WHITELISTED_REGIONS } from '../utilities';

interface Props {
  disabled?: boolean;
  error?: string;
  onBlur: (e: any) => void;
  onChange: (value: string) => void;
  required?: boolean;
  selectedRegion: string | undefined;
}

export const BucketRegions = (props: Props) => {
  const { disabled, error, onBlur, onChange, required, selectedRegion } = props;

  const {
    allRegionsError,
    availableStorageRegions,
  } = useObjectStorageRegions();

  const { isObjectStorageGen2Enabled } = useIsObjectStorageGen2Enabled();

  const {
    data: accountAvailabilityData,
    isLoading: accountAvailabilityLoading,
  } = useAllAccountAvailabilitiesQuery();

  const flags = useFlags();

  // Error could be: 1. General Regions error, 2. Field error, 3. Nothing
  const errorText = error || allRegionsError?.[0]?.reason;

  return (
    <RegionSelect
      forcefullyShownRegionIds={
        isObjectStorageGen2Enabled ? WHITELISTED_REGIONS : undefined
      }
      FlagComponent={Flag}
      accountAvailabilityData={accountAvailabilityData}
      accountAvailabilityLoading={accountAvailabilityLoading}
      currentCapability="Object Storage"
      disableClearable
      disabled={disabled}
      errorText={errorText}
      flags={flags}
      label="Region"
      onBlur={onBlur}
      onChange={(e, region) => onChange(region.id)}
      placeholder="Select a Region"
      regions={availableStorageRegions ?? []}
      required={required}
      value={selectedRegion}
    />
  );
};
