import { Box } from '@linode/ui';
import * as React from 'react';

import { Flag } from 'src/components/Flag';
import { RemovableSelectionsList } from 'src/components/RemovableSelectionsList/RemovableSelectionsList';

import type { Region } from '@linode/api-v4';
import type { RemovableItem } from 'src/components/RemovableSelectionsList/RemovableSelectionsList';

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
        gap: 1,
      }}
    >
      <Flag country={selection.country} />
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
      LabelComponent={SelectedRegion}
      headerText=""
      noDataText=""
      onRemove={handleRemove}
      selectionData={selectedRegions}
    />
  );
};
