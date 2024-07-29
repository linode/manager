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
  /**
   * If true, the component will be disabled.
   */
  disabled?: boolean;
  /**
   * A callback to execute when the selected Placement Group changes.
   * The selection is handled by a parent component.
   */
  handlePlacementGroupChange: (selected: PlacementGroup | null) => void;
  /**
   * The label for the TextField component.
   */
  label: string;
  /**
   * If true, the component will display a loading spinner. (usually when fetching data)
   */
  loading?: boolean;
  /**
   * The message to display when there are no options available.
   */
  noOptionsMessage?: string;
  /**
   * The ID of the selected Placement Group.
   */
  selectedPlacementGroupId: null | number;
  /**
   * We want to pass the full region object here so we can check if the selected Placement Group is at capacity.
   */
  selectedRegion: Region | undefined;
  /**
   * Any additional styles to apply to the root element.
   */
  sx?: SxProps;
  /**
   * Any additional props to pass to the TextField component.
   */
  textFieldProps?: Partial<TextFieldProps>;
}

export const PlacementGroupsSelect = (props: PlacementGroupsSelectProps) => {
  const {
    disabled,
    handlePlacementGroupChange,
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
    // Placement Group selection is always dependent on a selected region.
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

  const selection =
    placementGroups?.find(
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
      disabled={Boolean(!selectedRegion?.id) || disabled}
      errorText={error?.[0]?.reason}
      getOptionLabel={(placementGroup: PlacementGroup) => placementGroup.label}
      label={label}
      loading={isFetching}
      options={placementGroups ?? []}
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
