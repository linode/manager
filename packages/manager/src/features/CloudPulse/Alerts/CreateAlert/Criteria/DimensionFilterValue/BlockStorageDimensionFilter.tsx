import { useRegionsQuery } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import React from 'react';

import { useBlockStorageFetchOptions } from './useBlockStorageFetchOptions';
import { handleValueChange, resolveSelectedValues } from './utils';

import type { DimensionFilterAutocompleteProps } from './constants';

export const BlockStorageDimensionFilter = (
  props: DimensionFilterAutocompleteProps
) => {
  const {
    dimensionLabel,
    multiple,
    name,
    fieldOnChange,
    disabled,
    fieldOnBlur,
    placeholderText,
    errorText,
    entities,
    fieldValue,
    scope,
    selectedRegions,
    serviceType,
    type,
  } = props;

  const { data: regions } = useRegionsQuery();
  const { values, isLoading, isError } = useBlockStorageFetchOptions({
    entities,
    dimensionLabel,
    regions,
    type,
    scope,
    selectedRegions,
    serviceType,
  });

  return (
    <Autocomplete
      data-qa-dimension-filter={`${name}-value`}
      data-testid="value"
      disabled={disabled}
      errorText={
        errorText ?? (isError ? 'Failed to fetch the values.' : undefined)
      }
      isOptionEqualToValue={(option, value) => value.value === option.value}
      label="Value"
      limitTags={1}
      loading={!disabled && isLoading && !isError}
      multiple={multiple}
      onBlur={fieldOnBlur}
      onChange={(_, selected, operation) => {
        const newValue = handleValueChange(
          selected,
          operation,
          multiple ?? false
        );
        fieldOnChange(newValue);
      }}
      options={values}
      placeholder={placeholderText}
      sx={{ flex: 1 }}
      value={resolveSelectedValues(values, fieldValue, multiple ?? false)}
    />
  );
};
