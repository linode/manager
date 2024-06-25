import React, { useState } from 'react';

import { regions } from 'src/__data__/regionsData';
import { Box } from 'src/components/Box';
import { SelectedRegionsList } from 'src/features/ObjectStorage/AccessKeyLanding/AccessKeyRegions/SelectedRegionsList';
import { sortByString } from 'src/utilities/sort-by';

import { RegionMultiSelect } from './RegionMultiSelect';

import type { RegionMultiSelectProps } from './RegionSelect.types';
import type { Region } from '@linode/api-v4';
import type { Meta, StoryObj } from '@storybook/react';

const sortRegionOptions = (a: Region, b: Region) => {
  return sortByString(a.label, b.label, 'asc');
};

export const Default: StoryObj<RegionMultiSelectProps> = {
  render: (args) => {
    const SelectWrapper = () => {
      const [selectedRegionsIds, setSelectedRegionsIds] = useState<string[]>(
        []
      );

      const handleSelectionChange = (selectedIds: string[]) => {
        setSelectedRegionsIds(selectedIds);
      };

      return (
        <Box sx={{ minHeight: 500 }}>
          <RegionMultiSelect
            {...args}
            onChange={handleSelectionChange}
            selectedIds={selectedRegionsIds}
          />
        </Box>
      );
    };

    return SelectWrapper();
  },
};

const meta: Meta<RegionMultiSelectProps> = {
  args: {
    SelectedRegionsList,
    currentCapability: 'Linodes',
    disabled: false,
    errorText: '',
    isClearable: false,
    label: 'Regions',
    placeholder: 'Select Regions or type to search',
    regions,
    sortRegionOptions,
  },
  component: RegionMultiSelect,
  title: 'Components/Selects/Region Multi Select',
};
export default meta;
