import * as React from 'react';

import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { StyledFlagContainer } from 'src/components/RegionSelect/RegionSelect.styles';
import { RegionsMultiSelect } from 'src/components/RegionSelect/RegionsMultiSelect';
import {
  RemovableItem,
  RemovableSelectionsList,
} from 'src/components/RemovableSelectionsList/RemovableSelectionsList';
import { useRegionsQuery } from 'src/queries/regions';

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

interface SelectedRegionsProps {
  onRemove: (data: RegionSelectOption) => void;
  selectedRegions: RegionSelectOption[];
}

interface LabelComponentProps {
  selection: RemovableItem;
}

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
    const { id: _id, ...dataWithoutId } = data;
    onRemove((dataWithoutId as unknown) as RegionSelectOption);
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

export const AccessKeyRegions = (props: Props) => {
  const { disabled, error, onBlur, onChange, required, selectedRegion } = props;

  const { data: regions, error: regionsError } = useRegionsQuery();

  // Error could be: 1. General Regions error, 2. Field error, 3. Nothing
  const errorText = error || regionsError?.[0]?.reason;

  return (
    <RegionsMultiSelect
      handleSelection={(ids) => {
        onChange(ids);
      }}
      RenderSelectedRegionsList={SelectedRegionsList}
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
    />
  );
};
