import { Typography } from '@mui/material';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { FormLabel } from 'src/components/FormLabel';
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

const ariaIdentifier = 'region-type-filter';

interface Props {
  handleRegionFilter: (regionFilter: RegionFilter) => void;
}

export const RegionTypeFilter = (props: Props) => {
  const { handleRegionFilter } = props;

  return (
    <Box alignItems="end" display="flex">
      <FormLabel htmlFor={ariaIdentifier}>
        <Typography ml={1} mr={1}>
          Region Type:
        </Typography>
      </FormLabel>
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
        id={ariaIdentifier}
        label="Region Type"
        options={regionFilterOptions}
      />
    </Box>
  );
};
