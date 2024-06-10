import * as React from 'react';

import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { StyledFlagContainer } from 'src/components/RegionSelect/RegionSelect.styles';
import {
  RemovableItem,
  RemovableSelectionsList,
} from 'src/components/RemovableSelectionsList/RemovableSelectionsList';

import type { Region } from '@linode/api-v4';

interface SelectedRegionsProps {
  onRemove: (region: string) => void;
  selectedRegions: Region[];
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
        <Flag country={selection.country} />
      </StyledFlagContainer>
      {selection.label} ({selection.id})
    </Box>
  );
};

export const SelectedRegionsList = ({
  onRemove,
  selectedRegions,
}: SelectedRegionsProps) => {
  const handleRemove = (item: RemovableItem) => {
    onRemove(item.id as string);
  };

  return (
    <RemovableSelectionsList
      selectionData={selectedRegions}
      LabelComponent={SelectedRegion}
      headerText=""
      noDataText=""
      onRemove={handleRemove}
    />
  );
};
