import { useAllAccountAvailabilitiesQuery } from '@linode/queries';
import {
  Autocomplete,
  Chip,
  CloseIcon,
  Stack,
  StyledListItem,
} from '@linode/ui';
import React from 'react';

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

import type { RegionMultiSelectProps } from './RegionSelect.types';
import type { Region } from '@linode/api-v4';
import type { DisableItemOption } from '@linode/ui';

interface RegionChipLabelProps {
  region: Region;
}

const RegionChipLabel = ({ region }: RegionChipLabelProps) => {
  return (
    <Stack alignItems="center" direction="row" gap={1}>
      <Flag country={region.country} sx={{ fontSize: '1rem' }} />
      {region.label} ({region.id})
    </Stack>
  );
};

export const RegionMultiSelect = React.memo((props: RegionMultiSelectProps) => {
  const {
    SelectedRegionsList,
    currentCapability,
    disabled,
    disabledRegions: disabledRegionsFromProps,
    errorText,
    forcefullyShownRegionIds,
    helperText,
    ignoreAccountAvailability,
    isClearable,
    isGeckoLAEnabled,
    label,
    onChange,
    placeholder,
    regions,
    required,
    selectedIds,
    sortRegionOptions,
    width,
    ...rest
  } = props;

  const { data: accountAvailability, isLoading: accountAvailabilityLoading } =
    useAllAccountAvailabilitiesQuery(!ignoreAccountAvailability);

  const regionOptions = getRegionOptions({
    currentCapability,
    forcefullyShownRegionIds,
    regions,
  });

  const selectedRegions = regionOptions.filter((r) =>
    selectedIds.includes(r.id)
  );

  const handleRemoveOption = (regionToRemove: string) => {
    onChange(selectedIds.filter((value) => value !== regionToRemove));
  };

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

  return (
    <>
      <StyledAutocompleteContainer sx={{ width }}>
        <Autocomplete
          groupBy={(option) => {
            if (!option.site_type) {
              // Render empty group for "Select All / Deselect All"
              return '';
            }
            return getRegionCountryGroup(option);
          }}
          onChange={(_, selectedOptions) =>
            onChange(selectedOptions?.map((region) => region.id) ?? [])
          }
          renderOption={(props, option, { selected }) => {
            const { key, ...rest } = props;
            if (!option.site_type) {
              // Render options like "Select All / Deselect All"
              return (
                <StyledListItem {...rest} key={key}>
                  {option.label}
                </StyledListItem>
              );
            }

            // Render regular options
            return (
              <RegionOption
                disabledOptions={disabledRegions[option.id]}
                isGeckoLAEnabled={isGeckoLAEnabled}
                item={option}
                key={key}
                props={rest}
                selected={selected}
              />
            );
          }}
          renderTags={(tagValue, getTagProps) => {
            return tagValue.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                data-testid={option.id}
                deleteIcon={<CloseIcon />}
                key={index}
                label={<RegionChipLabel region={option} />}
                onDelete={() => handleRemoveOption(option.id)}
              />
            ));
          }}
          sx={(theme) => ({
            [theme.breakpoints.up('md')]: {
              width: '416px',
            },
          })}
          textFieldProps={{
            InputProps: {
              required,
            },
            tooltipText: helperText,
          }}
          autoHighlight
          clearOnBlur
          data-testid="region-select"
          disableClearable={!isClearable}
          disabled={disabled}
          errorText={errorText}
          getOptionDisabled={(option) => Boolean(disabledRegions[option.id])}
          label={label ?? 'Regions'}
          loading={accountAvailabilityLoading}
          multiple
          noOptionsText="No results"
          options={regionOptions}
          placeholder={placeholder ?? 'Select Regions'}
          value={selectedRegions}
          {...rest}
        />
      </StyledAutocompleteContainer>
      {selectedRegions.length > 0 && SelectedRegionsList && (
        <SelectedRegionsList
          selectedRegions={
            sortRegionOptions
              ? [...selectedRegions].sort(sortRegionOptions)
              : selectedRegions
          }
          onRemove={handleRemoveOption}
        />
      )}
    </>
  );
});
