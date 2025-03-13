import { Autocomplete, Chip, Stack, StyledListItem } from '@linode/ui';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

// @todo: modularization - Move `getRegionCountryGroup` utility to `@linode/shared` package
// as it imports GLOBAL_QUOTA_VALUE from RegionSelect's constants.ts and update the import.
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import { RegionOption } from './RegionOption';
import { StyledAutocompleteContainer } from './RegionSelect.styles';
import {
  getRegionOptions,
  isRegionOptionUnavailable,
  useIsGeckoEnabled,
} from './RegionSelect.utils';

import type {
  FlagComponentProps,
  RegionMultiSelectProps,
} from './RegionSelect.types';
import type { Region } from '@linode/api-v4';
import type { DisableItemOption } from '@linode/ui';

interface RegionChipLabelProps {
  FlagComponent: React.ComponentType<FlagComponentProps>;
  region: Region;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const RegionChipLabel = ({ FlagComponent, region }: RegionChipLabelProps) => {
  return (
    <Stack alignItems="center" direction="row" gap={1}>
      <FlagComponent country={region.country} sx={{ fontSize: '1rem' }} />
      {region.label} ({region.id})
    </Stack>
  );
};

export const RegionMultiSelect = React.memo((props: RegionMultiSelectProps) => {
  const {
    FlagComponent,
    SelectedRegionsList,
    accountAvailabilityData,
    accountAvailabilityLoading,
    currentCapability,
    disabled,
    disabledRegions: disabledRegionsFromProps,
    errorText,
    flags,
    forcefullyShownRegionIds,
    helperText,
    ignoreAccountAvailability,
    isClearable,
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

  const regionOptions = getRegionOptions({
    currentCapability,
    forcefullyShownRegionIds,
    regions,
  });
  const { isGeckoLAEnabled } = useIsGeckoEnabled(flags, regions);

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
        accountAvailabilityData,
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
                FlagComponent={FlagComponent}
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
                label={
                  <RegionChipLabel
                    FlagComponent={FlagComponent}
                    region={option}
                  />
                }
                data-testid={option.id}
                deleteIcon={<CloseIcon />}
                key={index}
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
