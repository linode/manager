import { Autocomplete } from '@linode/ui';
import React, { useMemo } from 'react';

import {
  getStaticOptions,
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
export const DimensionFilterAutocomplete = (
  props: DimensionFilterAutocompleteProps
) => {
  const {
    multiple,
    name,
    fieldOnChange,
    disabled,
    fieldOnBlur,
    placeholderText,
    errorText,
    fieldValue,
    serviceType,
    dimensionLabel,
    values,
    maxSelections,
  } = props;

  const options = useMemo(
    () => getStaticOptions(serviceType, dimensionLabel ?? '', values ?? []),
    [dimensionLabel, serviceType, values]
  );
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
          ? options.length > maxSelections
          : false
      }
      errorText={errorText}
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
      options={options}
      placeholder={placeholderText}
      sx={{ flex: 1 }}
      value={resolveSelectedValues(options, fieldValue, multiple ?? false)}
    />
  );
};
