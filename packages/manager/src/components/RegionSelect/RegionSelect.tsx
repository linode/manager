import { Typography } from '@mui/material';
import * as React from 'react';

import EdgeServer from 'src/assets/icons/entityIcons/edge-server.svg';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Flag } from 'src/components/Flag';
import { Link } from 'src/components/Link';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useAccountAvailabilitiesQueryUnpaginated } from 'src/queries/accountAvailability';

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
 * `currentCapability="VPCs"`, only regions that support VPCs will appear in the RegionSelect dropdown. Edge regions are filtered based on the `hideEdgeServers` prop.
 * There is no need to pre-filter regions when passing them to the RegionSelect. See the description of `currentCapability` prop for more information.
 *
 * We do not display the selected check mark for single selects.
 */
export const RegionSelect = React.memo((props: RegionSelectProps) => {
  const {
    currentCapability,
    disabled,
    errorText,
    geckoEnabled,
    handleSelection,
    helperText,
    isClearable,
    label,
    regions,
    required,
    selectedId,
    showGeckoHelperText,
    width,
  } = props;

  const {
    data: accountAvailability,
    isLoading: accountAvailabilityLoading,
  } = useAccountAvailabilitiesQueryUnpaginated();

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
        hideEdgeServers: !geckoEnabled,
        regions,
      }),
    [accountAvailability, currentCapability, regions, geckoEnabled]
  );

  return (
    <StyledAutocompleteContainer sx={{ width }}>
      <Autocomplete
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
              displayEdgeServerIcon={
                geckoEnabled && option.site_type === 'edge'
              }
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
          InputProps: {
            endAdornment: geckoEnabled &&
              selectedRegion?.site_type === 'edge' && (
                <TooltipIcon
                  icon={<EdgeServer />}
                  status="other"
                  sxTooltipIcon={sxEdgeIcon}
                  text="This region is an Edge server."
                />
              ),
            required,
            startAdornment: selectedRegion && (
              <StyledFlagContainer>
                <Flag country={selectedRegion?.data.country} />
              </StyledFlagContainer>
            ),
          },
          tooltipText: helperText,
        }}
        autoHighlight
        clearOnBlur
        data-testid="region-select"
        disableClearable={!isClearable}
        disabled={disabled}
        errorText={errorText}
        getOptionDisabled={(option: RegionSelectOption) => option.unavailable}
        groupBy={(option: RegionSelectOption) => option.data.region}
        label={label ?? 'Region'}
        loading={accountAvailabilityLoading}
        loadingText="Loading regions..."
        noOptionsText="No results"
        options={options}
        placeholder="Select a Region"
        value={selectedRegion}
      />
      {showGeckoHelperText && ( // @TODO Gecko MVP: Add docs link
        <StyledEdgeBox>
          <EdgeServer />
          <Typography
            data-testid="region-select-edge-text"
            sx={{ alignSelf: 'center', textWrap: 'nowrap' }}
          >
            {' '}
            Indicates an Edge server region.{' '}
            <Link aria-label="Learn more about Akamai Edge servers" to="#">
              Learn more
            </Link>
            .
          </Typography>
        </StyledEdgeBox>
      )}
    </StyledAutocompleteContainer>
  );
});
