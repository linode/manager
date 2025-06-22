import { useAllAccountAvailabilitiesQuery } from '@linode/queries';
import { Autocomplete, InputAdornment } from '@linode/ui';
import PublicIcon from '@mui/icons-material/Public';
import { createFilterOptions } from '@mui/material/Autocomplete';
import * as React from 'react';

// @todo: modularization - Move `getRegionCountryGroup` utility to `@linode/shared` package
// as it imports GLOBAL_QUOTA_VALUE from RegionSelect's constants.ts and update the import.
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

// @todo: modularization - Move `Flag` component to `@linode/shared` package.
import { Flag } from '../Flag';
import { RegionOption } from './RegionOption';
import { StyledAutocompleteContainer } from './RegionSelect.styles';
import {
  getRegionOptions,
  isRegionOptionUnavailable,
} from './RegionSelect.utils';

import type { RegionSelectProps } from './RegionSelect.types';
import type { Region } from '@linode/api-v4';
import type { DisableItemOption } from '@linode/ui';

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
  DisableClearable extends boolean | undefined = undefined,
>(
  props: RegionSelectProps<DisableClearable>
) => {
  const {
    currentCapability,
    disableClearable,
    disabled,
    disabledRegions: disabledRegionsFromProps,
    errorText,
    forcefullyShownRegionIds,
    helperText,
    isGeckoLAEnabled,
    label,
    noMarginTop,
    onChange,
    placeholder,
    regionFilter,
    regions,
    required,
    sx,
    tooltipText,
    value,
    width,
  } = props;

  const { data: accountAvailability, isLoading: accountAvailabilityLoading } =
    useAllAccountAvailabilitiesQuery(!!currentCapability);

  const regionOptions = getRegionOptions({
    currentCapability,
    forcefullyShownRegionIds,
    regionFilter,
    regions,
  });

  const selectedRegion = value
    ? regionOptions.find((r) => r.id === value)
    : null;

  const disabledRegions = regionOptions.reduce<
    Record<string, DisableItemOption>
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
        autoHighlight
        clearOnBlur
        data-testid="region-select"
        disableClearable={disableClearable}
        disabled={disabled}
        errorText={errorText}
        filterOptions={filterOptions}
        getOptionDisabled={(option) => Boolean(disabledRegions[option.id])}
        getOptionLabel={(region) =>
          isGeckoLAEnabled ? region.label : `${region.label} (${region.id})`
        }
        groupBy={(option) => getRegionCountryGroup(option)}
        helperText={helperText}
        label={label ?? 'Region'}
        loading={accountAvailabilityLoading || props.loading}
        loadingText="Loading regions..."
        noMarginTop={noMarginTop}
        noOptionsText={props.noOptionsText ?? 'No results'}
        onChange={onChange}
        options={regionOptions}
        placeholder={placeholder ?? 'Select a Region'}
        renderOption={(props, region) => {
          const { key, ...rest } = props;

          return (
            <RegionOption
              disabledOptions={disabledRegions[region.id]}
              isGeckoLAEnabled={isGeckoLAEnabled}
              item={region}
              key={`${region.id}-${key}`}
              props={rest}
            />
          );
        }}
        sx={(theme) => ({
          ...sx,
          [theme.breakpoints.up('md')]: {
            width: tooltipText ? '458px' : '416px',
          },
        })}
        textFieldProps={{
          ...props.textFieldProps,
          InputProps: {
            endAdornment: isGeckoLAEnabled && selectedRegion && (
              <InputAdornment position="end">
                ({selectedRegion?.id})
              </InputAdornment>
            ),
            required,
            startAdornment: selectedRegion && (
              <InputAdornment position="start">
                {selectedRegion.id === 'global' ? (
                  <PublicIcon
                    sx={{
                      height: '24px',
                      width: '24px',
                    }}
                  />
                ) : (
                  <Flag country={selectedRegion?.country} />
                )}
              </InputAdornment>
            ),
          },
          tooltipText,
        }}
        value={selectedRegion as Region}
      />
    </StyledAutocompleteContainer>
  );
};
