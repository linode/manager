import { useRegionsQuery } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import React from 'react';

import { useFirewallFetchOptions } from './useFirewallFetchOptions';
import { handleValueChange, resolveSelectedValues } from './utils';

import type { DimensionFilterAutocompleteProps } from './constants';

/**
 * Renders an Autocomplete input field for the DimensionFilter value field.
 * This component supports both single and multiple selection based on config.
 */
export const FirewallDimensionFilterAutocomplete = (
  props: DimensionFilterAutocompleteProps
) => {
  const {
    dimensionLabel,
    serviceType,
    scope,
    entities,
    multiple,
    name,
    fieldOnChange,
    disabled,
    fieldOnBlur,
    placeholderText,
    errorText,
    fieldValue,
    type,
  } = props;

  const { data: regions } = useRegionsQuery();
  const { values, isLoading, isError } = useFirewallFetchOptions({
    dimensionLabel,
    regions,
    entities,
    serviceType,
    type,
    scope,
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
