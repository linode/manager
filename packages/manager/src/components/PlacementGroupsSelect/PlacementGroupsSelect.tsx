import { AFFINITY_TYPES } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { TextFieldProps } from 'src/components/TextField';
import { hasPlacementGroupReachedCapacity } from 'src/features/PlacementGroups/utils';
import { useAllPlacementGroupsQuery } from 'src/queries/placementGroups';

import { PlacementGroupSelectOption } from './PlacementGroupSelectOption';

import type { PlacementGroup, Region } from '@linode/api-v4';

export interface PlacementGroupsSelectProps {
  clearable?: boolean;
  defaultValue?: PlacementGroup;
  disabled?: boolean;
  errorText?: string;
  handlePlacementGroupChange: (selected: PlacementGroup) => void;
  id?: string;
  label: string;
  loading?: boolean;
  noOptionsMessage?: string;
  onBlur?: (e: React.FocusEvent) => void;
  selectedPlacementGroup: PlacementGroup | null;
  selectedRegion?: Region;
  sx?: SxProps;
  textFieldProps?: Partial<TextFieldProps>;
}

export const PlacementGroupsSelect = (props: PlacementGroupsSelectProps) => {
  const {
    clearable = true,
    defaultValue,
    disabled,
    errorText,
    handlePlacementGroupChange,
    id,
    label,
    loading,
    noOptionsMessage,
    onBlur,
    selectedPlacementGroup,
    selectedRegion,
    sx,
    ...textFieldProps
  } = props;

  const {
    data: placementGroups,
    error,
    isLoading,
  } = useAllPlacementGroupsQuery(Boolean(selectedRegion?.id));

  const isDisabledPlacementGroup = (
    selectedPlacementGroup: PlacementGroup,
    selectedRegion: Region | undefined
  ) => {
    if (!selectedRegion?.id) {
      return false;
    }

    return hasPlacementGroupReachedCapacity({
      placementGroup: selectedPlacementGroup,
      region: selectedRegion,
    });
  };

  if (!placementGroups) {
    return null;
  }

  const formatLabel = (placementGroup: PlacementGroup) =>
    `${placementGroup.label} (${AFFINITY_TYPES[placementGroup.affinity_type]})`;

  const placementGroupsOptions: PlacementGroup[] = placementGroups.filter(
    (placementGroup) => placementGroup.region === selectedRegion?.id
  );

  const selection =
    placementGroupsOptions.find(
      (placementGroup) => placementGroup.id === selectedPlacementGroup?.id
    ) ?? null;

  return (
    <Autocomplete
      noOptionsText={
        noOptionsMessage ?? getDefaultNoOptionsMessage(error, isLoading)
      }
      onChange={(_, selectedOption: PlacementGroup) => {
        handlePlacementGroupChange(selectedOption);
      }}
      renderOption={(props, option, { selected }) => {
        return (
          <PlacementGroupSelectOption
            disabled={isDisabledPlacementGroup(option, selectedRegion)}
            key={option.id}
            label={formatLabel(option)}
            props={props}
            selected={selected}
            value={option}
          />
        );
      }}
      clearOnBlur={false}
      data-testid="placement-groups-select"
      defaultValue={defaultValue}
      disableClearable={!clearable}
      disabled={Boolean(!selectedRegion?.id) || disabled}
      errorText={errorText}
      getOptionLabel={formatLabel}
      id={id}
      label={label}
      loading={isLoading || loading}
      onBlur={onBlur}
      options={placementGroupsOptions ?? []}
      placeholder="Select a Placement Group"
      sx={sx}
      value={selection}
      {...textFieldProps}
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
