import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useFlags } from 'src/hooks/useFlags';

interface Props {
  disabled?: boolean;
  error?: string;
  onBlur: (e: any) => void;
  onChange: (value: string) => void;
  required?: boolean;
  selectedRegion: string | undefined;
}

export const ObjectStorageRegionSelect = (props: Props) => {
  const { disabled, error, onBlur, onChange, required, selectedRegion } = props;

  const { error: regionsErrors, data: regions } = useRegionsQuery();

  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  // Error could be: 1. General Regions error, 2. Field error, 3. Nothing
  const errorText = error || regionsErrors?.[0]?.reason;

  return (
    <RegionSelect
      currentCapability="Object Storage"
      disableClearable
      disabled={disabled}
      errorText={errorText}
      isGeckoLAEnabled={isGeckoLAEnabled}
      label="Region"
      onBlur={onBlur}
      onChange={(e, region) => onChange(region.id)}
      placeholder="Select a Region"
      regions={regions ?? []}
      required={required}
      value={selectedRegion ?? null}
    />
  );
};
