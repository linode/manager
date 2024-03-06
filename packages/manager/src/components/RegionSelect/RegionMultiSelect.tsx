import React, { useEffect, useMemo, useState } from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { StyledListItem } from 'src/components/Autocomplete/Autocomplete.styles';
import { useAllAccountAvailabilitiesQuery } from 'src/queries/account/availability';

import { RegionOption } from './RegionOption';
import { StyledAutocompleteContainer } from './RegionSelect.styles';
import {
  getRegionOptions,
  getSelectedRegionsByIds,
} from './RegionSelect.utils';

import type {
  RegionMultiSelectProps,
  RegionSelectOption,
} from './RegionSelect.types';

export const RegionMultiSelect = React.memo((props: RegionMultiSelectProps) => {
  const {
    SelectedRegionsList,
    currentCapability,
    disabled,
    errorText,
    handleSelection,
    helperText,
    isClearable,
    label,
    onBlur,
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

  const [selectedRegions, setSelectedRegions] = useState<RegionSelectOption[]>(
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

  const handleRemoveOption = (regionToRemove: string) => {
    const updatedSelectedOptions = selectedRegions.filter(
      (option) => option.value !== regionToRemove
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
              return <StyledListItem {...props}>{option.label}</StyledListItem>;
            }

            // Render regular options
            return (
              <RegionOption
                key={option.value}
                option={option}
                props={props}
                selected={selected}
              />
            );
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
          getOptionDisabled={(option: RegionSelectOption) => option.unavailable}
          label={label ?? 'Regions'}
          loading={accountAvailabilityLoading}
          multiple
          noOptionsText="No results"
          onBlur={onBlur}
          options={options}
          placeholder={placeholder ?? 'Select Regions'}
          renderTags={() => null}
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
