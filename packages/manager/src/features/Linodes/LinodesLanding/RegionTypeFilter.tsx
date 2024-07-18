import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { storage } from 'src/utilities/storage';

import type { RegionFilter } from 'src/utilities/storage';

interface RegionFilterOption {
  label: string;
  value: RegionFilter;
}

const regionFilterOptions: RegionFilterOption[] = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Core',
    value: 'core',
  },
  {
    label: 'Distributed',
    value: 'distributed',
  },
];

interface Props {
  handleRegionFilter: (regionFilter: RegionFilter) => void;
}

export const RegionTypeFilter = (props: Props) => {
  const { handleRegionFilter } = props;

  return (
    <label style={{ alignItems: 'center', display: 'flex' }}>
      <span style={{ marginLeft: 8, marginRight: 8 }}>Region Type:</span>{' '}
      <Autocomplete
        defaultValue={
          regionFilterOptions.find(
            (filter) => filter.value === storage.regionFilter.get()
          ) ?? regionFilterOptions[0]
        }
        onChange={(_, selectedOption) => {
          if (selectedOption?.value) {
            handleRegionFilter(selectedOption.value);
          }
        }}
        sx={{
          display: 'inline-block',
          width: 140,
        }}
        textFieldProps={{
          hideLabel: true,
        }}
        disableClearable
        label="Region Type"
        options={regionFilterOptions}
      />
    </label>
  );
};
