import { PlacementGroup } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useAllPlacementGroupsQuery } from 'src/queries/placementGroups';

import { getAffinityLabel } from './PlacementGroups.utils';

export interface PlacementGroupsSelectProps {
  clearable?: boolean;
  id?: string;
  label: string;
  noOptionsMessage?: string;
  onSelectionChange?: (selected: PlacementGroup | null) => void;
  options?: PlacementGroup[];
  region?: string;
  renderOption?: (
    placementGroup: PlacementGroup,
    selected: boolean
  ) => JSX.Element;
  renderOptionLabel?: (placementGroups: PlacementGroup) => string;
  sx?: SxProps;
}

export const PlacementGroupsSelect = (props: PlacementGroupsSelectProps) => {
  const {
    id,
    label,
    noOptionsMessage,
    // onSelectionChange,
    options,
    renderOption,
    renderOptionLabel,
    sx,
    // region,
  } = props;

  const {
    data: placementGroups,
    error,
    isLoading,
  } = useAllPlacementGroupsQuery();

  return (
    <Autocomplete
      getOptionLabel={(placementGroups: PlacementGroup) =>
        renderOptionLabel
          ? renderOptionLabel(placementGroups)
          : `${placementGroups.label} (${getAffinityLabel(
            placementGroups.affinity_type
          )})`
      }
      noOptionsText={
        noOptionsMessage ?? getDefaultNoOptionsMessage(error, isLoading)
      }
      renderOption={
        renderOption
          ? (props, option, { selected }) => {
            return (
              <li data-qa-placement-group-option>
                {renderOption(option, selected)}
              </li>
            );
          }
          : undefined
      }
      data-testid="placement-groups-select"
      id={id}
      label={label}
      options={options || (placementGroups?.data ?? [])}
      placeholder="Select a Placement Group"
      sx={sx}
    />
  );
};

const getDefaultNoOptionsMessage = (
  error: APIError[] | null,
  loading: boolean
) => {
  if (error) {
    return 'An error occurred while fetching your Placement Groups';
  } else if (loading) {
    return 'Loading your Placement Groups...';
  } else {
    return 'No available Placement Groups';
  }
};
