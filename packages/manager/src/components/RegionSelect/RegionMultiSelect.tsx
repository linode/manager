import { Region } from '@linode/api-v4';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Chip } from 'src/components/Chip';
import { Flag } from 'src/components/Flag';
import { useAllAccountAvailabilitiesQuery } from 'src/queries/account/availability';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import { StyledListItem } from '../Autocomplete/Autocomplete.styles';
import { RegionOption } from './RegionOption';
import {
  StyledAutocompleteContainer,
  StyledFlagContainer,
} from './RegionSelect.styles';
import {
  getRegionOptions,
  isRegionOptionUnavailable,
} from './RegionSelect.utils';

import type {
  DisableRegionOption,
  RegionMultiSelectProps,
} from './RegionSelect.types';

interface LabelComponentProps {
  region: Region;
}

const SelectedRegion = ({ region }: LabelComponentProps) => {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexGrow: 1,
      }}
    >
      <StyledFlagContainer
        sx={(theme) => ({
          marginRight: theme.spacing(1 / 2),
          transform: 'scale(0.8)',
        })}
      >
        <Flag country={region.country} />
      </StyledFlagContainer>
      {region.label} ({region.id})
    </Box>
  );
};

export const RegionMultiSelect = React.memo((props: RegionMultiSelectProps) => {
  const {
    SelectedRegionsList,
    currentCapability,
    disabled,
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
            onChange(selectedOptions.map((region) => region.id))
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
                label={<SelectedRegion region={option} />}
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
            placeholder: selectedRegions.length > 0 ? '' : placeholder,
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
