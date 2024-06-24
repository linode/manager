import * as React from 'react';

import { RegionMultiSelect } from 'src/components/RegionSelect/RegionMultiSelect';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { sortByString } from 'src/utilities/sort-by';

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

  const { data: regions, error: regionsError } = useRegionsQuery();

  // Error could be: 1. General Regions error, 2. Field error, 3. Nothing
  const errorText = error || regionsError?.[0]?.reason;

  return (
    <RegionMultiSelect
      onChange={onChange}
      currentCapability="Object Storage"
      disabled={disabled}
      errorText={errorText}
      isClearable={false}
      label="Regions"
      placeholder="Select Regions or type to search"
      regions={regions ?? []}
      required={required}
      selectedIds={selectedRegion}
      sortRegionOptions={sortRegionOptions}
    />
  );
};
