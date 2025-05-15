import { useIsGeckoEnabled } from '@linode/shared';
import * as React from 'react';

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

  const { allRegionsError, availableStorageRegions } =
    useObjectStorageRegions();

  const { isObjectStorageGen2Enabled } = useIsObjectStorageGen2Enabled();

  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  // Error could be: 1. General Regions error, 2. Field error, 3. Nothing
  const errorText = error || allRegionsError?.[0]?.reason;

  return (
    <RegionSelect
      currentCapability="Object Storage"
      disableClearable
      disabled={disabled}
      errorText={errorText}
      forcefullyShownRegionIds={
        isObjectStorageGen2Enabled ? WHITELISTED_REGIONS : undefined
      }
      isGeckoLAEnabled={isGeckoLAEnabled}
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
