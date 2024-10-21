import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Chip } from 'src/components/Chip';
import { Flag } from 'src/components/Flag';
import { useAllAccountAvailabilitiesQuery } from 'src/queries/account/availability';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import { StyledListItem } from '../Autocomplete/Autocomplete.styles';
import { Stack } from '../Stack';
import { RegionOption } from './RegionOption';
import { StyledAutocompleteContainer } from './RegionSelect.styles';
import {
  getRegionOptions,
  isRegionOptionUnavailable,
} from './RegionSelect.utils';

import type {
  DisableRegionOption,
  RegionMultiSelectProps,
} from './RegionSelect.types';
import type { Region } from '@linode/api-v4';

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
    helperText,
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

  const {
    data: accountAvailability,
    isLoading: accountAvailabilityLoading,
  } = useAllAccountAvailabilitiesQuery();

  const regionOptions = getRegionOptions({ currentCapability, regions });

  const selectedRegions = regionOptions.filter((r) =>
    selectedIds.includes(r.id)
  );

  const handleRemoveOption = (regionToRemove: string) => {
    onChange(selectedIds.filter((value) => value !== regionToRemove));
  };

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
            if (!option.site_type) {
              // Render options like "Select All / Deselect All"
              return <StyledListItem {...props}>{option.label}</StyledListItem>;
            }

            // Render regular options
            return (
              <RegionOption
                disabledOptions={disabledRegions[option.id]}
                key={option.id}
                props={props}
                region={option}
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
