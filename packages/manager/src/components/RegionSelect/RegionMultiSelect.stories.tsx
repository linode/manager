import React, { useState } from 'react';

import { regions } from 'src/__data__/regionsData';
import { Box } from 'src/components/Box';
import { SelectedRegionsList } from 'src/features/ObjectStorage/AccessKeyLanding/AccessKeyRegions/SelectedRegionsList';
import { sortByString } from 'src/utilities/sort-by';

import { RegionMultiSelect } from './RegionMultiSelect';

import type { RegionMultiSelectProps } from './RegionSelect.types';
import type { Meta, StoryObj } from '@storybook/react';
import type { RegionSelectOption } from 'src/components/RegionSelect/RegionSelect.types';

const sortRegionOptions = (a: RegionSelectOption, b: RegionSelectOption) => {
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
            handleSelection={handleSelectionChange}
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
