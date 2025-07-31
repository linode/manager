import { Autocomplete } from '@linode/ui';
import React from 'react';

import { handleValueChange, resolveSelectedValues } from './constants';

import type { Item } from '../../../constants';

interface DimensionFilterAutocompleteProps {
  disabled: boolean;
  errorText?: string;
  fieldOnBlur: () => void;
  fieldOnChange: (newValue: string | string[]) => void;
  fieldValue: null | string;
  multiple?: boolean;
  placeholderText: string;
  values: Item<string, string>[];
}
export const DimensionFilterAutocomplete = (
  props: DimensionFilterAutocompleteProps
) => {
  const {
    multiple,
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
      sx={{ flex: 1, minWidth: '256px' }}
      value={resolveSelectedValues(values, fieldValue, multiple ?? false)}
    />
  );
};
