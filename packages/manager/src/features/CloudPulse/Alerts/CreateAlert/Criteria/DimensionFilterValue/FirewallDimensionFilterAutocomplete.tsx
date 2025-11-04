import { useRegionsQuery } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import React from 'react';

import { useCleanupStaleValues } from './useCleanupStaleValues';
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
    disabled,
    entities,
    entityType,
    errorText,
    fieldOnBlur,
    fieldOnChange,
    fieldValue,
    multiple,
    name,
    placeholderText,
    scope,
    serviceType,
    type,
  } = props;

  const { data: regions } = useRegionsQuery();

  // Map entity_type to associatedEntityType
  const associatedEntityType =
    entityType === 'linode'
      ? 'linode'
      : entityType === 'nodebalancer'
        ? 'nodebalancer'
        : 'both';

  const { values, isLoading, isError } = useFirewallFetchOptions({
    associatedEntityType,
    dimensionLabel,
    entities,
    regions,
    scope,
    serviceType,
    type,
  });

  useCleanupStaleValues({
    options: values,
    fieldValue,
    multiple,
    onChange: fieldOnChange,
    isLoading,
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
