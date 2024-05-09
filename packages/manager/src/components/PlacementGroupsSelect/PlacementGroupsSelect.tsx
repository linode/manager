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
  defaultValue?: PlacementGroup;
  disabled?: boolean;
  handlePlacementGroupChange: (selected: PlacementGroup | null) => void;
  id?: string;
  label: string;
  loading?: boolean;
  noOptionsMessage?: string;
  selectedPlacementGroupId: null | number;
  /**
   * We want the full region object here so we can check if the selected Placement Group is at capacity.
   */
  selectedRegion: Region | undefined;
  sx?: SxProps;
  textFieldProps?: Partial<TextFieldProps>;
}

export const PlacementGroupsSelect = (props: PlacementGroupsSelectProps) => {
  const {
    defaultValue,
    disabled,
    handlePlacementGroupChange,
    id,
    label,
    noOptionsMessage,
    selectedPlacementGroupId,
    selectedRegion,
    sx,
    ...textFieldProps
  } = props;

  const {
    data: placementGroups,
    error,
    isFetching,
    isLoading,
  } = useAllPlacementGroupsQuery({
    enabled: Boolean(selectedRegion?.id),
    filter: {
      region: selectedRegion?.id,
    },
  });

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
      onChange={(_, selectedOption) => {
        handlePlacementGroupChange(selectedOption ?? null);
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
      clearOnBlur={true}
      data-testid="placement-groups-select"
      defaultValue={defaultValue}
      disabled={Boolean(!selectedRegion?.id) || disabled}
      errorText={error?.[0]?.reason}
      getOptionLabel={(placementGroup: PlacementGroup) => placementGroup.label}
      id={id}
      label={label}
      loading={isFetching}
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
