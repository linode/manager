import { AffinityType, PlacementGroup } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useAllPlacementGroupsQuery } from 'src/queries/placementGroups';

interface PlacementGroupsSelectOption {
  affinity_type: AffinityType;
  optionLabel: string;
}

export interface PlacementGroupsSelectProps {
  clearable?: boolean;
  id?: string;
  label?: string;
  noOptionsMessage?: string;
  // options: PlacementGroupsSelectOption[];
  onSelectionChange?: (selected: PlacementGroupsSelectOption | null) => void;
  region?: string;
  renderOption?: (
    placementGroup: PlacementGroupsSelectOption,
    selected: boolean
  ) => JSX.Element;
  renderOptionLabel?: (placementGroup: PlacementGroup) => string;
  sx?: SxProps;
  value?: ((placementGroup: PlacementGroup) => boolean) | null | number;
}

export const PlacementGroupsSelect = (props: PlacementGroupsSelectProps) => {
  const {
    id,
    label,
    // onSelectionChange,
    // options,
    noOptionsMessage,
    renderOption,
    renderOptionLabel,
    sx,
    region,
    value,
  } = props;

  const placementGroups: readonly PlacementGroupsSelectOption[] = [
    { affinity_type: 'anti_affinity', optionLabel: 'PG-1' },
    { affinity_type: 'anti_affinity', optionLabel: 'PG-2' },
    { affinity_type: 'affinity', optionLabel: 'PG-3' },
  ];

  const {
    data: placementGroups,
    error,
    isLoading,
  } = useAllPlacementGroupsQuery();

  // <h3>....</h3>
  return (
    <Autocomplete
      getOptionLabel={(placementGroup: PlacementGroup) =>
        renderOptionLabel
          ? renderOptionLabel(placementGroup)
          : `${placementGroup.optionLabel} (${placementGroup.affinity_type === 'affinity'
            ? 'Affinity'
            : 'Anti-Affinity'
          })`
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
      label={label ?? 'Placement Group'}
      options={placementGroups}
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
