import * as React from 'react';

import { RegionsMultiSelect } from 'src/components/RegionSelect/RegionsMultiSelect';
import { useRegionsQuery } from 'src/queries/regions';

interface Props {
  disabled?: boolean;
  error?: string;
  onBlur: (e: any) => void;
  onChange: (value: string[]) => void;
  required?: boolean;
  selectedRegion: string[];
}

export const AccessRegions = (props: Props) => {
  const { disabled, error, onBlur, onChange, required, selectedRegion } = props;

  const { data: regions, error: regionsError } = useRegionsQuery();

  // Error could be: 1. General Regions error, 2. Field error, 3. Nothing
  const errorText = error || regionsError?.[0]?.reason;

  return (
    <RegionsMultiSelect
      handleSelection={(ids) => {
        onChange(ids);
      }}
      currentCapability="Object Storage"
      disabled={disabled}
      errorText={errorText}
      isClearable={false}
      label="Region"
      onBlur={onBlur}
      placeholder="Select a Region"
      regions={regions ?? []}
      required={required}
      selectedIds={selectedRegion}
    />
  );
};
