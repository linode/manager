import { getRegionCountryGroup } from '@akamai/compute-ui-core/api';
import { useAllAccountAvailabilitiesQuery } from '@linode/queries';
import {
  Autocomplete,
  Chip,
  CloseIcon,
  type EnhancedAutocompleteProps,
  Stack,
  StyledListItem,
} from '@linode/ui';
import React from 'react';

import { Flag } from 'src/components/Flag';
import { RegionOption } from 'src/components/RegionSelect/RegionOption';
import { StyledAutocompleteContainer } from 'src/components/RegionSelect/RegionSelect.styles';
import {
  getRegionOptions,
  isRegionOptionUnavailable,
} from 'src/components/RegionSelect/RegionSelect.utils';

import type { Capabilities, Region } from '@linode/api-v4';
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

export interface RegionMultiSelectProps
  extends Omit<
    EnhancedAutocompleteProps<Region, true>,
    'label' | 'onChange' | 'options'
  > {
  currentCapability: Capabilities | undefined;
  disabledRegions?: Record<string, DisableItemOption>;
  helperText?: string;
  isClearable?: boolean;
  /**
   * `isGeckoLAEnabled` flag from `useIsGeckoEnabled` hook
   */
  isGeckoLAEnabled: boolean;
  label?: string;
  onChange: (ids: string[]) => void;
  optionsLoading?: boolean;
  regions: Region[];
  required?: boolean;
  // TODO: remove selectedIds
  selectedIds?: string[]; // takes priority over selectedRegions if both are provided
  selectedRegions?: Region[]; // unlike selectedIds, does not require regions to be passed in
  SelectedRegionsList?: React.ComponentType<{
    onRemove: (region: string) => void;
    selectedRegions: Region[];
  }>;
  sortRegionOptions?: (a: Region, b: Region) => number;
  tooltipText?: string;
  width?: number;
}

export const RegionMultiSelect = React.memo((props: RegionMultiSelectProps) => {
  const {
    SelectedRegionsList,
    currentCapability,
    disabled,
    disabledRegions: disabledRegionsFromProps,
    errorText,
    helperText,
    isClearable,
    isGeckoLAEnabled,
    label,
    onChange,
    placeholder,
    regions,
    required,
    selectedIds = [],
    selectedRegions: selectedRegionsFromProps,
    optionsLoading,
    sortRegionOptions,
    width,
    ...rest
  } = props;

  const { data: accountAvailability, isLoading: accountAvailabilityLoading } =
    useAllAccountAvailabilitiesQuery(!!currentCapability);

  const regionOptions = getRegionOptions({
    currentCapability,
    regions,
  });

  const selectedRegions = selectedRegionsFromProps
    ? getRegionOptions({ currentCapability, regions: selectedRegionsFromProps })
    : regionOptions.filter((r) => selectedIds.includes(r.id));

  const displayedRegionOptions = optionsLoading ? [] : regionOptions;

  const handleRemoveOption = (regionToRemove: string) => {
    onChange(
      selectedRegions
        .map((region) => region.id)
        .filter((value) => value !== regionToRemove)
    );
  };

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

  return (
    <>
      <StyledAutocompleteContainer sx={{ width }}>
        <Autocomplete
          autoHighlight
          clearOnBlur
          data-testid="region-select"
          disableClearable={!isClearable}
          disabled={disabled}
          errorText={errorText}
          getOptionDisabled={(option) => Boolean(disabledRegions[option.id])}
          groupBy={(option) => {
            if (!option.site_type) {
              // Render empty group for "Select All / Deselect All"
              return '';
            }
            return getRegionCountryGroup(option);
          }}
          label={label ?? 'Regions'}
          loading={accountAvailabilityLoading || optionsLoading}
          multiple
          noOptionsText="No results"
          onChange={(_, selectedOptions) =>
            onChange(selectedOptions?.map((region) => region.id) ?? [])
          }
          options={displayedRegionOptions}
          placeholder={placeholder ?? 'Select Regions'}
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
                deleteIcon={<CloseIcon data-testid="CloseIcon" />}
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
          value={selectedRegions}
          {...rest}
        />
      </StyledAutocompleteContainer>
      {selectedRegions.length > 0 && SelectedRegionsList && (
        <SelectedRegionsList
          onRemove={handleRemoveOption}
          selectedRegions={
            sortRegionOptions
              ? [...selectedRegions].sort(sortRegionOptions)
              : selectedRegions
          }
        />
      )}
    </>
  );
});
