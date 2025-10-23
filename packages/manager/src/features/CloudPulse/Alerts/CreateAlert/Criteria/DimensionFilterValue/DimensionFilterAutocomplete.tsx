import { Autocomplete } from '@linode/ui';
import React, { useMemo } from 'react';

import {
  getStaticOptions,
  handleValueChange,
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
  } = props;

  const options = useMemo(
    () => getStaticOptions(serviceType, dimensionLabel ?? '', values ?? []),
    [dimensionLabel, serviceType, values]
  );
  return (
    <Autocomplete
      data-qa-dimension-filter={`${name}-value`}
      data-testid="value"
      disabled={disabled}
      errorText={errorText}
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
