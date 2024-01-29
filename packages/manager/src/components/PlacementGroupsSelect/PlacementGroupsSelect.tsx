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
  // getPlacementGroupLinodeCount,
  // getPlacementGroupsCount,
} from './PlacementGroups.utils';

export interface PlacementGroupsSelectProps {
  clearable?: boolean;
  errorText?: string;
  id?: string;
  label: string;
  loading?: boolean;
  noOptionsMessage?: string;
  onBlur?: (e: React.FocusEvent) => void;

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

  const handlePlacementGroupChange = (selection: PlacementGroup) => {
    setSelectedPlacementGroup(selection);
  };

  const [inputValue, setInputValue] = React.useState('');

  const [
    selectedPlacementGroup,
    setSelectedPlacementGroup,
  ] = React.useState<PlacementGroup | null>();

  const {
    data: placementGroups,
    error,
    isLoading,
  } = useAllPlacementGroupsQuery();

  const placementGroupsOptions = placementGroups?.data.filter(
    (placementGroup) => placementGroup.region === selectedRegionID
  );

  React.useEffect(() => {
    /** We want to clear the input value when the value prop changes to null.
     * This is for use cases where a user changes their region and the Linode
     * they had selected is no longer available.
     */
    if (placementGroupsOptions?.length === 0) {
      setSelectedPlacementGroup(null);
      setInputValue('');
    }
  }, [inputValue, placementGroupsOptions, selectedRegionID]);

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
        disableClearable={!clearable}
        // errorText={placementGroupError}
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
