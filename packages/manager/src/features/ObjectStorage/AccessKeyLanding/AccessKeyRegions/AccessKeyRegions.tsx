import * as React from 'react';

import { RegionMultiSelect } from 'src/components/RegionSelect/RegionMultiSelect';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { sortByString } from 'src/utilities/sort-by';

import { SelectedRegionsList } from './SelectedRegionsList';

import type { RegionSelectOption } from 'src/components/RegionSelect/RegionSelect.types';

interface Props {
  disabled?: boolean;
  error?: string;
  name: string;
  onBlur: (e: any) => void;
  onChange: (value: string[]) => void;
  required?: boolean;
  selectedRegion: string[];
}

const sortRegionOptions = (a: RegionSelectOption, b: RegionSelectOption) => {
  return sortByString(a.label, b.label, 'asc');
};

export const AccessKeyRegions = (props: Props) => {
  const { disabled, error, onBlur, onChange, required, selectedRegion } = props;

  const { data: regions, error: regionsError } = useRegionsQuery();

  // Error could be: 1. General Regions error, 2. Field error, 3. Nothing
  const errorText = error || regionsError?.[0]?.reason;

  return (
    <RegionMultiSelect
      handleSelection={(ids) => {
        onChange(ids);
      }}
      SelectedRegionsList={SelectedRegionsList}
      currentCapability="Object Storage"
      disabled={disabled}
      errorText={errorText}
      isClearable={false}
      label="Regions"
      onBlur={onBlur}
      placeholder="Select Regions or type to search"
      regions={regions ?? []}
      required={required}
      selectedIds={selectedRegion}
      sortRegionOptions={sortRegionOptions}
    />
  );
};
