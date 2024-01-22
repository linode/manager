import React, { useState } from 'react';

import { regions } from 'src/__data__/regionsData';
import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import {
  RemovableItem,
  RemovableSelectionsList,
} from 'src/components/RemovableSelectionsList/RemovableSelectionsList';
import { sortByString } from 'src/utilities/sort-by';

import { RegionMultiSelect } from './RegionMultiSelect';
import { StyledFlagContainer } from './RegionSelect.styles';

import type { RegionMultiSelectProps } from './RegionSelect.types';
import type { Meta, StoryObj } from '@storybook/react';
import type { RegionSelectOption } from 'src/components/RegionSelect/RegionSelect.types';

interface SelectedRegionsProps {
  onRemove: (data: RegionSelectOption) => void;
  selectedRegions: RegionSelectOption[];
}

interface LabelComponentProps {
  selection: RemovableItem;
}

const sortRegionOptions = (a: RegionSelectOption, b: RegionSelectOption) => {
  return sortByString(a.label, b.label, 'asc');
};

const LabelComponent = ({ selection }: LabelComponentProps) => {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexGrow: 1,
      }}
    >
      <StyledFlagContainer>
        <Flag country={selection.data.country} />
      </StyledFlagContainer>
      {selection.label}
    </Box>
  );
};

const SelectedRegionsList = ({
  onRemove,
  selectedRegions,
}: SelectedRegionsProps) => {
  const handleRemove = (data: RemovableItem) => {
    onRemove((data as unknown) as RegionSelectOption);
  };

  return (
    <RemovableSelectionsList
      selectionData={selectedRegions.map((item, index) => {
        return { ...item, id: index };
      })}
      LabelComponent={LabelComponent}
      headerText=""
      noDataText=""
      onRemove={handleRemove}
    />
  );
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
