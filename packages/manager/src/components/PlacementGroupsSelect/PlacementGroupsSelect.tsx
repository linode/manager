import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { TextFieldProps } from 'src/components/TextField';
import { hasPlacementGroupReachedCapacity } from 'src/features/PlacementGroups/utils';
import { useAllPlacementGroupsQuery } from 'src/queries/placementGroups';

import { PlacementGroupSelectOption } from './PlacementGroupSelectOption';

import type { PlacementGroup, Region } from '@linode/api-v4';
import type { SxProps } from '@mui/system';

export interface PlacementGroupsSelectProps {
  clearOnBlur?: boolean;
  clearable?: boolean;
  defaultValue?: PlacementGroup;
  disabled?: boolean;
  handlePlacementGroupChange: (selected: PlacementGroup) => void;
  id?: string;
  label: string;
  loading?: boolean;
  noOptionsMessage?: string;
  onBlur?: (e: React.FocusEvent) => void;
  selectedPlacementGroupId: number | undefined;
  selectedRegion?: Region;
  sx?: SxProps;
  textFieldProps?: Partial<TextFieldProps>;
}

export const PlacementGroupsSelect = (props: PlacementGroupsSelectProps) => {
  const {
    clearOnBlur,
    clearable = true,
    defaultValue,
    disabled,
    handlePlacementGroupChange,
    id,
    label,
    loading,
    noOptionsMessage,
    onBlur,
    selectedPlacementGroupId,
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

  const placementGroupsOptions:
    | PlacementGroup[]
    | undefined = placementGroups?.filter(
    (placementGroup) => placementGroup.region === selectedRegion?.id
  );

  const selection =
    placementGroupsOptions?.find(
      (placementGroup) => placementGroup.id === selectedPlacementGroupId
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
            label={option.label}
            props={props}
            selected={selected}
            value={option}
          />
        );
      }}
      clearOnBlur={clearOnBlur}
      data-testid="placement-groups-select"
      defaultValue={defaultValue}
      disableClearable={!clearable}
      disabled={Boolean(!selectedRegion?.id) || disabled}
      errorText={error?.[0]?.reason}
      getOptionLabel={(placementGroup: PlacementGroup) => placementGroup.label}
      id={id}
      label={label}
      loading={isLoading || loading}
      onBlur={onBlur}
      options={placementGroupsOptions ?? []}
      placeholder="None"
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
