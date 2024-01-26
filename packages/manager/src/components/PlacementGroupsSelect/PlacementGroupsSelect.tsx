import { PlacementGroup } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useAllPlacementGroupsQuery } from 'src/queries/placementGroups';

import {
  getAffinityLabel,
  getPlacementGroupLinodeCount,
  getPlacementGroupsCount,
} from './PlacementGroups.utils';

export interface PlacementGroupsSelectProps {
  clearable?: boolean;
  errorText?: string;
  id?: string;
  label: string;
  loading?: boolean;
  noOptionsMessage?: string;
  onBlur?: (e: React.FocusEvent) => void;
  onSelectionChange?: (selected: PlacementGroup | null) => void;
  region?: string;
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
    id,
    label,
    loading,
    noOptionsMessage,
    onBlur,
    renderOption,
    renderOptionLabel,
    selectedRegionID,
  } = props;

  const {
    data: placementGroups,
    error,
    isLoading,
  } = useAllPlacementGroupsQuery();

  const [selectedPlacementGroup, setSelectedPlacementGroup] = React.useState<
    PlacementGroup | null | undefined
  >();

  const [placementGroupError, setPlacementGroupError] = React.useState('');

  React.useEffect(() => {
    if (selectedPlacementGroup) {
      setSelectedPlacementGroup(selectedPlacementGroup);
    } else {
      setSelectedPlacementGroup(null);
    }
  }, [selectedPlacementGroup]);

  const placementGroupsOptions = placementGroups?.data.filter(
    (placementGroup) => placementGroup.region === selectedRegionID
  );

  React.useEffect(() => {
    if (getPlacementGroupsCount(placementGroupsOptions)) {
      setPlacementGroupError('');
    } else {
      setPlacementGroupError('There are no Placement Groups in this region');
    }
  }, [placementGroupsOptions, selectedRegionID]);

  const handlePlacementGroupChange = (selection: PlacementGroup) => {
    setSelectedPlacementGroup(selection);
    checkPlacementGroupCapacity(selection);
  };

  const checkPlacementGroupCapacity = (placementGroup: PlacementGroup) => {
    if (getPlacementGroupLinodeCount(placementGroup) > 9) {
      setPlacementGroupError(`This Placement Group doesn't have any capacity`);
    } else {
      setPlacementGroupError('');
    }
  };

  return (
    <>
      {!selectedRegionID ? (
        <Notice
          dataTestId="placement-groups-no-region-notice"
          spacingBottom={0}
          spacingTop={16}
          variant="warning"
        >
          <Typography>
            <b>Select a region above to see available Placement Groups.</b>
          </Typography>
        </Notice>
      ) : null}
      <Autocomplete
        getOptionLabel={(placementGroupsOptions: PlacementGroup) =>
          renderOptionLabel
            ? renderOptionLabel(placementGroupsOptions)
            : `${placementGroupsOptions.label} (${getAffinityLabel(
                placementGroupsOptions.affinity_type
              )})`
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
        errorText={placementGroupError}
        id={id}
        label={label}
        loading={isLoading || loading}
        onBlur={onBlur}
        options={placementGroupsOptions ?? []}
        placeholder="Select a Placement Group"
        value={selectedPlacementGroup}
      />
    </>
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
