import { Autocomplete } from '@linode/ui';
import { createFilterOptions } from '@mui/material/Autocomplete';
import * as React from 'react';

import { Flag } from 'src/components/Flag';
import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { useIsObjectStorageGen2Enabled } from 'src/features/ObjectStorage/hooks/useIsObjectStorageGen2Enabled';
import { useAllAccountAvailabilitiesQuery } from 'src/queries/account/availability';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import { RegionOption } from './RegionOption';
import { StyledAutocompleteContainer } from './RegionSelect.styles';
import {
  getRegionOptions,
  isRegionOptionUnavailable,
} from './RegionSelect.utils';

import type { RegionSelectProps } from './RegionSelect.types';
import type { Region } from '@linode/api-v4';
import type { DisableItemOption } from 'src/components/ListItemOption';

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
    tooltipText,
    value,
    width,
  } = props;

  const { isGeckoLAEnabled } = useIsGeckoEnabled();
  const { isObjectStorageGen2Enabled } = useIsObjectStorageGen2Enabled();

  const {
    data: accountAvailability,
    isLoading: accountAvailabilityLoading,
  } = useAllAccountAvailabilitiesQuery(!ignoreAccountAvailability);

  const regionOptions = getRegionOptions({
    currentCapability,
    isObjectStorageGen2Enabled,
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
        renderOption={(props, region) => {
          const { key, ...rest } = props;

          return (
            <RegionOption
              disabledOptions={disabledRegions[region.id]}
              item={region}
              key={region.id}
              props={rest}
            />
          );
        }}
        sx={(theme) => ({
          [theme.breakpoints.up('md')]: {
            width: tooltipText ? '458px' : '416px',
          },
        })}
        textFieldProps={{
          ...props.textFieldProps,
          InputProps: {
            endAdornment:
              isGeckoLAEnabled && selectedRegion && `(${selectedRegion?.id})`,
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
        noMarginTop={noMarginTop}
        noOptionsText="No results"
        onChange={onChange}
        options={regionOptions}
        placeholder={placeholder ?? 'Select a Region'}
        value={selectedRegion as Region}
      />
    </StyledAutocompleteContainer>
  );
};
