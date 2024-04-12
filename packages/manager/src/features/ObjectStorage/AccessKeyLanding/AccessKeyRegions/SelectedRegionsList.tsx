import * as React from 'react';

import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { StyledFlagContainer } from 'src/components/RegionSelect/RegionSelect.styles';
import {
  RemovableItem,
  RemovableSelectionsList,
} from 'src/components/RemovableSelectionsList/RemovableSelectionsList';

import type { RegionSelectOption } from 'src/components/RegionSelect/RegionSelect.types';

interface SelectedRegionsProps {
  onRemove: (region: string) => void;
  selectedRegions: RegionSelectOption[];
}

interface LabelComponentProps {
  selection: RemovableItem;
}

const SelectedRegion = ({ selection }: LabelComponentProps) => {
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

export const SelectedRegionsList = ({
  onRemove,
  selectedRegions,
}: SelectedRegionsProps) => {
  const handleRemove = (item: RemovableItem) => {
    onRemove(item.value);
  };

  return (
    <RemovableSelectionsList
      selectionData={selectedRegions.map((item, index) => {
        return { ...item, id: index };
      })}
      LabelComponent={SelectedRegion}
      headerText=""
      noDataText=""
      onRemove={handleRemove}
    />
  );
};
