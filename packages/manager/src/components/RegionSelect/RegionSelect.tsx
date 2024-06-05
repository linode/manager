import { Typography } from '@mui/material';
import * as React from 'react';

import DistributedRegion from 'src/assets/icons/entityIcons/distributed-region.svg';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Flag } from 'src/components/Flag';
import { Link } from 'src/components/Link';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useAllAccountAvailabilitiesQuery } from 'src/queries/account/availability';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import { RegionOption } from './RegionOption';
import {
  StyledAutocompleteContainer,
  StyledDistributedRegionBox,
  StyledFlagContainer,
  sxDistributedRegionIcon,
} from './RegionSelect.styles';
import {
  getRegionOptions,
  isRegionOptionUnavailable,
} from './RegionSelect.utils';

import type {
  DisableRegionOption,
  RegionSelectProps,
} from './RegionSelect.types';

/**
 * A specific select for regions.
 *
 * The RegionSelect automatically filters regions based on capability using its `currentCapability` prop. For example, if
 * `currentCapability="VPCs"`, only regions that support VPCs will appear in the RegionSelect dropdown. Distributed regions are filtered based on the `regionFilter` prop.
 * There is no need to pre-filter regions when passing them to the RegionSelect. See the description of `currentCapability` prop for more information.
 *
 * We do not display the selected check mark for single selects.
 */
export const RegionSelect = React.memo((props: RegionSelectProps) => {
  const {
    currentCapability,
    disabled,
    disabledRegions: disabledRegionsFromProps,
    errorText,
    helperText,
    isClearable,
    label,
    onChange,
    regionFilter,
    regions,
    required,
    showDistributedRegionIconHelperText,
    tooltipText,
    value,
    width,
  } = props;

  const {
    data: accountAvailability,
    isLoading: accountAvailabilityLoading,
  } = useAllAccountAvailabilitiesQuery();

  const regionOptions = getRegionOptions({
    currentCapability,
    regionFilter,
    regions,
  });

  const selectedRegion = regionOptions.find((r) => r.id === value) ?? null;

  const disabledRegions = regionOptions.reduce<
    Record<string, DisableRegionOption>
  >((acc, region) => {
    if (disabledRegionsFromProps?.[region.id]) {
      acc[region.id] = disabledRegionsFromProps[region.id];
    }
    if (
      isRegionOptionUnavailable({
        accountAvailabilityData: accountAvailability,
        currentCapability,
        region,
      })
    ) {
      acc[region.id] = {
        reason:
          'This region is currently unavailable. For help, open a support ticket.',
      };
    }
    return acc;
  }, {});

  return (
    <StyledAutocompleteContainer sx={{ width }}>
      <Autocomplete
        onChange={(_, region) => {
          onChange(region!);
        }}
        renderOption={(props, option) => {
          return (
            <RegionOption
              displayDistributedRegionIcon={
                regionFilter !== 'core' &&
                (option.site_type === 'distributed' ||
                  option.site_type === 'edge')
              }
              disabledOptions={disabledRegions[option.id]}
              key={option.id}
              props={props}
              region={option}
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
              (selectedRegion?.site_type === 'distributed' ||
                selectedRegion?.site_type === 'edge') && (
                <TooltipIcon
                  icon={<DistributedRegion />}
                  status="other"
                  sxTooltipIcon={sxDistributedRegionIcon}
                  text="This region is a distributed region."
                />
              ),
            required,
            startAdornment: selectedRegion && (
              <StyledFlagContainer>
                <Flag country={selectedRegion?.country} />
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
        getOptionDisabled={(option) => Boolean(disabledRegions[option.id])}
        groupBy={(option) => getRegionCountryGroup(option)}
        helperText={helperText}
        label={label ?? 'Region'}
        loading={accountAvailabilityLoading}
        loadingText="Loading regions..."
        noOptionsText="No results"
        options={regionOptions}
        placeholder="Select a Region"
        value={selectedRegion}
      />
      {showDistributedRegionIconHelperText && ( // @TODO Gecko Beta: Add docs link
        <StyledDistributedRegionBox>
          <DistributedRegion />
          <Typography
            data-testid="region-select-distributed-region-text"
            sx={{ alignSelf: 'center', textWrap: 'nowrap' }}
          >
            {' '}
            Indicates a distributed region.{' '}
            <Link
              aria-label="Learn more about Akamai distributed regions"
              to="#"
            >
              Learn more
            </Link>
            .
          </Typography>
        </StyledDistributedRegionBox>
      )}
    </StyledAutocompleteContainer>
  );
});
