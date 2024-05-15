import { Typography } from '@mui/material';
import * as React from 'react';

import EdgeRegion from 'src/assets/icons/entityIcons/edge-region.svg';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Flag } from 'src/components/Flag';
import { Link } from 'src/components/Link';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useFlags } from 'src/hooks/useFlags';
import { useAllAccountAvailabilitiesQuery } from 'src/queries/account/availability';

import { RegionOption } from './RegionOption';
import {
  StyledAutocompleteContainer,
  StyledEdgeBox,
  StyledFlagContainer,
  sxEdgeIcon,
} from './RegionSelect.styles';
import { getRegionOptions, getSelectedRegionById } from './RegionSelect.utils';

import type {
  RegionSelectOption,
  RegionSelectProps,
} from './RegionSelect.types';

/**
 * A specific select for regions.
 *
 * The RegionSelect automatically filters regions based on capability using its `currentCapability` prop. For example, if
 * `currentCapability="VPCs"`, only regions that support VPCs will appear in the RegionSelect dropdown. Edge regions are filtered based on the `regionFilter` prop.
 * There is no need to pre-filter regions when passing them to the RegionSelect. See the description of `currentCapability` prop for more information.
 *
 * We do not display the selected check mark for single selects.
 */
export const RegionSelect = React.memo((props: RegionSelectProps) => {
  const {
    currentCapability,
    disabled,
    errorText,
    handleDisabledRegion,
    handleSelection,
    helperText,
    isClearable,
    label,
    regionFilter,
    regions,
    required,
    selectedId,
    showEdgeIconHelperText,
    tooltipText,
    width,
  } = props;

  const flags = useFlags();

  const {
    data: accountAvailability,
    isLoading: accountAvailabilityLoading,
  } = useAllAccountAvailabilitiesQuery();

  const regionFromSelectedId: RegionSelectOption | null =
    getSelectedRegionById({
      accountAvailabilityData: accountAvailability,
      currentCapability,
      regions,
      selectedRegionId: selectedId ?? '',
    }) ?? null;

  const [selectedRegion, setSelectedRegion] = React.useState<
    RegionSelectOption | null | undefined
  >(regionFromSelectedId);

  const handleRegionChange = (selection: RegionSelectOption | null) => {
    setSelectedRegion(selection);
    handleSelection(selection?.value || '');
  };

  React.useEffect(() => {
    if (selectedId) {
      setSelectedRegion(regionFromSelectedId);
    } else {
      // We need to reset the state when create types change
      setSelectedRegion(null);
    }
  }, [selectedId, regions]);

  const options = React.useMemo(
    () =>
      getRegionOptions({
        accountAvailabilityData: accountAvailability,
        currentCapability,
        flags,
        handleDisabledRegion,
        regionFilter,
        regions,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      accountAvailability,
      currentCapability,
      handleDisabledRegion,
      regions,
      regionFilter,
      flags.gecko2,
    ]
  );

  return (
    <StyledAutocompleteContainer sx={{ width }}>
      <Autocomplete
        getOptionDisabled={(option: RegionSelectOption) =>
          Boolean(option.disabledProps?.disabled)
        }
        isOptionEqualToValue={(
          option: RegionSelectOption,
          { value }: RegionSelectOption
        ) => option.value === value}
        onChange={(_, selectedOption: RegionSelectOption) => {
          handleRegionChange(selectedOption);
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Tab') {
            setSelectedRegion(null);
            handleRegionChange(null);
          }
        }}
        renderOption={(props, option) => {
          return (
            <RegionOption
              displayEdgeRegionIcon={
                regionFilter !== 'core' &&
                option.site_type === 'edge' &&
                flags.gecko2?.enabled &&
                !flags.gecko2.ga
              }
              flags={flags}
              key={option.value}
              option={option}
              props={props}
            />
          );
        }}
        sx={(theme) => ({
          [theme.breakpoints.up('md')]: {
            width: '416px',
          },
        })}
        textFieldProps={{
          ...props.textFieldProps,
          InputProps: {
            endAdornment: regionFilter !== 'core' &&
              selectedRegion?.site_type === 'edge' && (
                <TooltipIcon
                  icon={<EdgeRegion />}
                  status="other"
                  sxTooltipIcon={sxEdgeIcon}
                  text="This region is an edge region."
                />
              ),
            required,
            startAdornment: selectedRegion && (
              <StyledFlagContainer>
                <Flag country={selectedRegion?.data.country} />
              </StyledFlagContainer>
            ),
          },
          tooltipText,
        }}
        autoHighlight
        clearOnBlur
        data-testid="region-select"
        disableClearable={!isClearable}
        disabled={disabled}
        errorText={errorText}
        groupBy={(option: RegionSelectOption) => option.data.region}
        helperText={helperText}
        label={label ?? 'Region'}
        loading={accountAvailabilityLoading}
        loadingText="Loading regions..."
        noOptionsText="No results"
        options={options}
        placeholder="Select a Region"
        value={selectedRegion}
      />
      {showEdgeIconHelperText && ( // @TODO Gecko Beta: Add docs link
        <StyledEdgeBox>
          <EdgeRegion />
          <Typography
            data-testid="region-select-edge-text"
            sx={{ alignSelf: 'center', textWrap: 'nowrap' }}
          >
            {' '}
            Indicates an edge region.{' '}
            <Link aria-label="Learn more about Akamai edge regions" to="#">
              Learn more
            </Link>
            .
          </Typography>
        </StyledEdgeBox>
      )}
    </StyledAutocompleteContainer>
  );
});
