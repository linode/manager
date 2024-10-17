import { Typography } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import * as React from 'react';

import DistributedRegion from 'src/assets/icons/entityIcons/distributed-region.svg';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Flag } from 'src/components/Flag';
import { Link } from 'src/components/Link';
import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useAllAccountAvailabilitiesQuery } from 'src/queries/account/availability';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import { RegionOption } from './RegionOption';
import {
  StyledAutocompleteContainer,
  StyledDistributedRegionBox,
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
import type { Region } from '@linode/api-v4';

/**
 * A specific select for regions.
 *
 * The RegionSelect automatically filters regions based on capability using its `currentCapability` prop. For example, if
 * `currentCapability="VPCs"`, only regions that support VPCs will appear in the RegionSelect dropdown. Distributed regions are filtered based on the `regionFilter` prop.
 * There is no need to pre-filter regions when passing them to the RegionSelect. See the description of `currentCapability` prop for more information.
 *
 * We do not display the selected check mark for single selects.
 */
export const RegionSelect = <
  DisableClearable extends boolean | undefined = undefined
>(
  props: RegionSelectProps<DisableClearable>
) => {
  const {
    currentCapability,
    disableClearable,
    disabled,
    disabledRegions: disabledRegionsFromProps,
    errorText,
    helperText,
    ignoreAccountAvailability,
    label,
    noMarginTop,
    onChange,
    placeholder,
    regionFilter,
    regions,
    required,
    showDistributedRegionIconHelperText,
    tooltipText,
    value,
    width,
  } = props;

  const { isGeckoBetaEnabled, isGeckoLAEnabled } = useIsGeckoEnabled();

  const {
    data: accountAvailability,
    isLoading: accountAvailabilityLoading,
  } = useAllAccountAvailabilitiesQuery(!ignoreAccountAvailability);

  const regionOptions = getRegionOptions({
    currentCapability,
    regionFilter,
    regions,
  });

  const selectedRegion = value
    ? regionOptions.find((r) => r.id === value)
    : null;

  const disabledRegions = regionOptions.reduce<
    Record<string, DisableRegionOption>
  >((acc, region) => {
    if (disabledRegionsFromProps?.[region.id]) {
      acc[region.id] = disabledRegionsFromProps[region.id];
    }
    if (
      !ignoreAccountAvailability &&
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

  const EndAdornment = React.useMemo(() => {
    // @TODO Gecko: Remove adornment after LA
    if (isGeckoBetaEnabled && selectedRegion?.site_type === 'distributed') {
      return (
        <TooltipIcon
          icon={<DistributedRegion />}
          status="other"
          sxTooltipIcon={sxDistributedRegionIcon}
          text="This region is a distributed region."
        />
      );
    }
    if (isGeckoLAEnabled && selectedRegion) {
      return `(${selectedRegion?.id})`;
    }
    return null;
  }, [isGeckoBetaEnabled, isGeckoLAEnabled, selectedRegion]);

  /*
   * When Gecko is enabled, allow regions to be searched by ID by passing a
   * custom stringify function.
   */
  const filterOptions = isGeckoLAEnabled
    ? createFilterOptions({
        stringify: (region: Region) => `${region.label} (${region.id})`,
      })
    : undefined;

  return (
    <StyledAutocompleteContainer sx={{ width }}>
      <Autocomplete<Region, false, DisableClearable>
        getOptionLabel={(region) =>
          isGeckoLAEnabled ? region.label : `${region.label} (${region.id})`
        }
        renderOption={(props, region) => (
          <RegionOption
            disabledOptions={disabledRegions[region.id]}
            key={region.id}
            props={props}
            region={region}
          />
        )}
        sx={(theme) => ({
          [theme.breakpoints.up('md')]: {
            width: '416px',
          },
        })}
        textFieldProps={{
          ...props.textFieldProps,
          InputProps: {
            endAdornment: EndAdornment,
            required,
            startAdornment: selectedRegion && (
              <Flag country={selectedRegion?.country} mr={1} />
            ),
          },
          tooltipText,
        }}
        autoHighlight
        clearOnBlur
        data-testid="region-select"
        disableClearable={disableClearable}
        disabled={disabled}
        errorText={errorText}
        filterOptions={filterOptions}
        getOptionDisabled={(option) => Boolean(disabledRegions[option.id])}
        groupBy={(option) => getRegionCountryGroup(option)}
        helperText={helperText}
        label={label ?? 'Region'}
        loading={accountAvailabilityLoading}
        loadingText="Loading regions..."
        noMarginTop={noMarginTop ?? false}
        noOptionsText="No results"
        onChange={onChange}
        options={regionOptions}
        placeholder={placeholder ?? 'Select a Region'}
        value={selectedRegion as Region}
      />
      {showDistributedRegionIconHelperText && ( // @TODO Gecko Beta: Add docs link
        <StyledDistributedRegionBox centerChildren={Boolean(errorText)}>
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
};
