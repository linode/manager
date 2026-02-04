import { useRegionsQuery } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import React from 'react';

import { useCleanupStaleValues } from './useCleanupStaleValues';
import { useFirewallFetchOptions } from './useFirewallFetchOptions';
import {
  handleValueChange,
  isMaxSelectionsReached,
  isOptionDisabled,
  resolveSelectedValues,
} from './utils';

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
    selectedRegions,
    maxSelections,
  } = props;

  const { data: regions } = useRegionsQuery();

  const { values, isLoading, isError } = useFirewallFetchOptions({
    associatedEntityType: entityType,
    dimensionLabel,
    regions: selectedRegions
      ? regions?.filter(({ id }) => selectedRegions.includes(id))
      : regions,
    entities,
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

  const maxReached = React.useMemo(() => {
    return isMaxSelectionsReached(
      multiple ?? false,
      fieldValue ?? '',
      maxSelections
    );
  }, [fieldValue, maxSelections, multiple]);

  return (
    <Autocomplete
      data-qa-dimension-filter={`${name}-value`}
      data-testid="value"
      disabled={disabled}
      disableSelectAll={
        maxSelections !== undefined && multiple
          ? values.length > maxSelections
          : false
      }
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
        !errorText && maxSelections !== undefined && multiple
          ? `Select up to ${maxSelections} values`
          : undefined
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
