import { useRegionsQuery } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import React from 'react';

import { useBlockStorageFetchOptions } from './useBlockStorageFetchOptions';
import { useCleanupStaleValues } from './useCleanupStaleValues';
import {
  handleValueChange,
  isMaxSelectionsReached,
  isOptionDisabled,
  resolveSelectedValues,
} from './utils';

import type { DimensionFilterAutocompleteProps } from './constants';

export const BlockStorageDimensionFilterAutocomplete = (
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
    maxSelections,
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

  useCleanupStaleValues({
    options: values,
    fieldValue,
    multiple,
    onChange: fieldOnChange,
    isLoading,
  });

  const maxReached = React.useMemo(() => {
    return isMaxSelectionsReached(
      multiple ?? false,
      fieldValue ?? '',
      maxSelections
    );
  }, [fieldValue, maxSelections, multiple]);

  const showHelperText = !errorText && maxSelections !== undefined && multiple;
  const disableSelectAll =
    maxSelections !== undefined && multiple
      ? values.length > maxSelections
      : false;

  return (
    <Autocomplete
      data-qa-dimension-filter={`${name}-value`}
      data-testid="value"
      disabled={disabled}
      disableSelectAll={disableSelectAll}
      errorText={
        errorText ?? (isError ? 'Failed to fetch the values.' : undefined)
      }
      getOptionDisabled={(option) => {
        return isOptionDisabled({
          maxReached,
          value: fieldValue ?? undefined,
          multiple: multiple ?? false,
          option,
        });
      }}
      helperText={
        showHelperText ? `Select up to ${maxSelections} values` : undefined
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
