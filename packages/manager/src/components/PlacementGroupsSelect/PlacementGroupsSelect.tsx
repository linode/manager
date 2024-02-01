import { PlacementGroup } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { getPlacementGroupLinodeCount } from 'src/features/PlacementGroups/utils';
import { useAllPlacementGroupsQuery } from 'src/queries/placementGroups';

export interface PlacementGroupsSelectProps {
  clearable?: boolean;
  errorText?: string;
  id?: string;
  label: string;
  loading?: boolean;
  noOptionsMessage?: string;
  onBlur?: (e: React.FocusEvent) => void;
  renderOption?: (
    placementGroup: PlacementGroup,
    selected: boolean
  ) => JSX.Element;
  renderOptionLabel?: (placementGroups: PlacementGroup) => string;
  selectedRegionID?: string;
  sx?: SxProps;
}

export const PlacementGroupsSelect = (props: PlacementGroupsSelectProps) => {
  const {
    clearable = true,
    id,
    label,
    loading,
    noOptionsMessage,
    onBlur,
    renderOption,
    renderOptionLabel,
    selectedRegionID,
  } = props;

  const [inputValue, setInputValue] = React.useState('');

  const [
    selectedPlacementGroup,
    setSelectedPlacementGroup,
  ] = React.useState<PlacementGroup>();

  const {
    data: placementGroups,
    error,
    isLoading,
  } = useAllPlacementGroupsQuery();

  const placementGroupsOptions = placementGroups?.data.filter(
    (placementGroup) => placementGroup.region === selectedRegionID
  );

  const handlePlacementGroupChange = (selection: PlacementGroup) => {
    setSelectedPlacementGroup(selection);
  };

  let errorText;
  if (selectedRegionID && placementGroupsOptions?.length === 0) {
    errorText = 'There are no Placement Groups in this region';
  }

  if (
    selectedPlacementGroup &&
    getPlacementGroupLinodeCount(selectedPlacementGroup) >=
      selectedPlacementGroup.capacity
  ) {
    errorText = `This Placement Group doesn't have any capacity`;
  }

  return (
    <Autocomplete
      getOptionLabel={(placementGroupsOptions: PlacementGroup) =>
        renderOptionLabel
          ? renderOptionLabel(placementGroupsOptions)
          : `${placementGroupsOptions.label} (${placementGroupsOptions.affinity_type})`
      }
      noOptionsText={
        noOptionsMessage ?? getDefaultNoOptionsMessage(error, isLoading)
      }
      onChange={(_, selectedOption: PlacementGroup) => {
        handlePlacementGroupChange(selectedOption);
      }}
      renderOption={
        renderOption
          ? (props, option, { selected }) => {
              return (
                <li {...props} data-qa-placement-group-option>
                  {renderOption(option, selected)}
                </li>
              );
            }
          : undefined
      }
      clearOnBlur={false}
      data-testid="placement-groups-select"
      disableClearable={!clearable}
      errorText={errorText}
      id={id}
      inputValue={inputValue}
      label={label}
      loading={isLoading || loading}
      onBlur={onBlur}
      onInputChange={(_, newValue) => setInputValue(newValue)}
      options={placementGroupsOptions ?? []}
      placeholder="Select a Placement Group"
      value={selectedPlacementGroup}
    />
  );
};

const getDefaultNoOptionsMessage = (
  error: APIError[] | null,
  loading: boolean
) => {
  if (error) {
    return 'An error occurred while fetching your Placement Groups';
  }
  return loading
    ? 'Loading your Placement Groups...'
    : 'No available Placement Groups';
};
