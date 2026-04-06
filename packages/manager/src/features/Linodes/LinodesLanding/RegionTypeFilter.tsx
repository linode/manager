import { Box, Select } from '@linode/ui';
import { Typography } from '@linode/ui';
import * as React from 'react';

import { FormLabel } from 'src/components/FormLabel';

import type { RegionFilter } from 'src/utilities/storage';

interface RegionFilterOption {
  label: string;
  value: RegionFilter;
}

export const regionFilterOptions: RegionFilterOption[] = [
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

const ariaIdentifier = 'region-type-filter';

interface Props {
  handleRegionFilter: (regionFilter: RegionFilter) => void;
  regionFilter: RegionFilter;
}

export const RegionTypeFilter = ({
  handleRegionFilter,
  regionFilter,
}: Props) => {
  return (
    <Box alignItems="end" display="flex">
      <FormLabel htmlFor={ariaIdentifier}>
        <Typography ml={1} mr={1}>
          Region Type:
        </Typography>
      </FormLabel>
      <Select
        hideLabel
        id={ariaIdentifier}
        label="Region Type"
        onChange={(_, selectedOption) => {
          if (selectedOption?.value) {
            handleRegionFilter(selectedOption.value);
          }
        }}
        options={regionFilterOptions}
        sx={{
          display: 'inline-block',
          width: 140,
        }}
        value={
          regionFilterOptions.find((filter) => filter.value === regionFilter) ??
          regionFilterOptions[0]
        }
      />
    </Box>
  );
};
