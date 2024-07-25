import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { useRegionsQuery } from 'src/queries/regions/regions';

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

  const { isGeckoGAEnabled } = useIsGeckoEnabled();
  const { data: regions, error: regionsError } = useRegionsQuery({
    transformRegionLabel: isGeckoGAEnabled,
  });

  // Error could be: 1. General Regions error, 2. Field error, 3. Nothing
  const errorText = error || regionsError?.[0]?.reason;

  return (
    <RegionSelect
      currentCapability="Object Storage"
      disableClearable
      disabled={disabled}
      errorText={errorText}
      label="Region"
      onBlur={onBlur}
      onChange={(e, region) => onChange(region.id)}
      placeholder="Select a Region"
      regions={regions ?? []}
      required={required}
      value={selectedRegion}
    />
  );
};
