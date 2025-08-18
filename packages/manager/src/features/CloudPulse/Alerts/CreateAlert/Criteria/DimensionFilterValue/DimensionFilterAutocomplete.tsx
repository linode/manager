import { Autocomplete } from '@linode/ui';
import React from 'react';

import { handleValueChange, resolveSelectedValues } from './utils';

import type { Item } from '../../../constants';

interface DimensionFilterAutocompleteProps {
  /**
   * Whether the autocomplete input should be disabled.
   */
  disabled: boolean;

  /**
   * Optional error message to display beneath the input.
   */
  errorText?: string;

  /**
   * Handler function called on input blur.
   */
  fieldOnBlur: () => void;

  /**
   * Callback triggered when the user selects a new value(s).
   */
  fieldOnChange: (newValue: string | string[]) => void;

  /**
   * Current raw string value (or null) from the form state.
   */
  fieldValue: null | string;

  /**
   * To control single-select/multi-select in the Autocomplete.
   */
  multiple?: boolean;
  /**
   * Name of the field set in the form.
   */
  name: string;
  /**
   * Placeholder text to display when no selection is made.
   */
  placeholderText: string;

  /**
   * The full list of selectable options for the autocomplete input.
   */
  values: Item<string, string>[];
}

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
    values,
    disabled,
    fieldOnBlur,
    placeholderText,
    errorText,
    fieldValue,
  } = props;

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
      options={values}
      placeholder={placeholderText}
      sx={{ flex: 1 }}
      value={resolveSelectedValues(values, fieldValue, multiple ?? false)}
    />
  );
};
