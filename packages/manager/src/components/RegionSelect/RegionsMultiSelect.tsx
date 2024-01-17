import Close from '@mui/icons-material/Close';
import React, { useEffect, useMemo, useState } from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { IconButton } from 'src/components/IconButton';
import { Tooltip } from 'src/components/Tooltip';
import { useFlags } from 'src/hooks/useFlags';
import { useAccountAvailabilitiesQueryUnpaginated } from 'src/queries/accountAvailability';

import {
  SelectedIcon,
  SelectedOptionsList,
  SelectedOptionsListItem,
  StyledAutocompleteContainer,
  StyledFlagContainer,
  StyledListItem,
} from './RegionSelect.styles';
import {
  getRegionOptions,
  getSelectedRegionsByIds,
} from './RegionSelect.utils';

import type {
  RegionSelectOption,
  RegionsMultiSelectProps,
} from './RegionSelect.types';

export const sortByRegion = (a: RegionSelectOption, b: RegionSelectOption) => {
  if (!a.label || !b.label) {
    return 0;
  }
  if (a.label > b.label) {
    return 1;
  }
  if (a.label < b.label) {
    return -1;
  }
  return 0;
};

export const RegionsMultiSelect = React.memo(
  (props: RegionsMultiSelectProps) => {
    const {
      currentCapability,
      disabled,
      errorText,
      handleSelection,
      helperText,
      isClearable,
      label,
      onBlur,
      regions,
      required,
      selectedIds,
      width,
    } = props;

    const flags = useFlags();
    const {
      data: accountAvailability,
      isLoading: accountAvailabilityLoading,
    } = useAccountAvailabilitiesQueryUnpaginated(flags.dcGetWell);

    const [selectedRegions, setSelectedRegions] = useState<
      RegionSelectOption[]
    >(
      getSelectedRegionsByIds({
        accountAvailabilityData: accountAvailability,
        currentCapability,
        regions,
        selectedRegionIds: selectedIds ?? [],
      })
    );

    const handleRegionChange = (selection: RegionSelectOption[]) => {
      setSelectedRegions(selection);
      const selectedIds = selection.map((region) => region.value);
      handleSelection(selectedIds);
    };

    useEffect(() => {
      setSelectedRegions(
        getSelectedRegionsByIds({
          accountAvailabilityData: accountAvailability,
          currentCapability,
          regions,
          selectedRegionIds: selectedIds ?? [],
        })
      );
    }, [selectedIds, accountAvailability, currentCapability, regions]);

    const options = useMemo(
      () =>
        getRegionOptions({
          accountAvailabilityData: accountAvailability,
          currentCapability,
          regions,
        }),
      [accountAvailability, currentCapability, regions]
    );

    const removeOption = (optionToRemove: RegionSelectOption) => {
      const updatedSelectedOptions = selectedRegions.filter(
        (option) => option.value !== optionToRemove.value
      );
      const updatedSelectedIds = updatedSelectedOptions.map(
        (region) => region.value
      );
      setSelectedRegions(updatedSelectedOptions);
      handleSelection(updatedSelectedIds);
    };

    return (
      <>
        <StyledAutocompleteContainer sx={{ width }}>
          <Autocomplete
            getOptionDisabled={(option: RegionSelectOption) =>
              Boolean(flags.dcGetWell) && Boolean(option.unavailable)
            }
            groupBy={(option: RegionSelectOption) => {
              return option?.data?.region;
            }}
            isOptionEqualToValue={(
              option: RegionSelectOption,
              value: RegionSelectOption
            ) => option.value === value.value}
            onChange={(_, selectedOption) =>
              handleRegionChange(selectedOption as RegionSelectOption[])
            }
            renderOption={(props, option, { selected }) => {
              if (!option.data) {
                // Render options like "Select All / Deselect All "
                return (
                  <StyledListItem {...props}>
                    <Box
                      sx={{
                        alignItems: 'center',
                        // display: 'flex',
                        display: 'block',
                      }}
                    >
                      {option.label}
                    </Box>
                  </StyledListItem>
                );
              }

              // Render regular options
              return (
                <Tooltip
                  title={
                    option.unavailable
                      ? 'There may be limited capacity in this region. Learn more.'
                      : ''
                  }
                  disableHoverListener={!option.unavailable}
                >
                  <StyledListItem {...props}>
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex',
                        flexGrow: 1,
                      }}
                    >
                      <StyledFlagContainer>
                        <Flag country={option.data.country} />
                      </StyledFlagContainer>
                      {option.label}
                    </Box>
                    <SelectedIcon visible={selected} />
                  </StyledListItem>
                </Tooltip>
              );
            }}
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
            label={label ?? 'Regions'}
            loading={accountAvailabilityLoading}
            multiple
            noOptionsText="No results"
            onBlur={onBlur}
            options={options}
            placeholder="Select Regions"
            renderTags={() => null}
            value={selectedRegions}
          />
        </StyledAutocompleteContainer>
        {selectedRegions.length > 0 && (
          <SelectedOptionsList>
            {[...selectedRegions].sort(sortByRegion).map((option, index) => (
              <SelectedOptionsListItem alignItems="center" key={index}>
                <Box sx={{ display: 'flex' }}>
                  <StyledFlagContainer>
                    <Flag country={option.data.country} />
                  </StyledFlagContainer>
                  {option.label}
                </Box>
                <IconButton
                  aria-label={`remove ${option.value}`}
                  disableRipple
                  onClick={() => removeOption(option)}
                  size="medium"
                >
                  <Close />
                </IconButton>
              </SelectedOptionsListItem>
            ))}
          </SelectedOptionsList>
        )}
      </>
    );
  }
);
