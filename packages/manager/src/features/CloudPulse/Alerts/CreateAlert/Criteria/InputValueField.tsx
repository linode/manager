import { Autocomplete, TextField } from '@linode/ui';
import React from 'react';

import type { EnhancedAutocompleteProps } from '@linode/ui';

interface InputValueFieldOption {
  /**
   * The label to display in the Autocomplete dropdown.
   */
  label: string;

  /**
   * The value to use when the option is selected.
   */
  value: string;
}

interface InputValueFieldProps
  extends EnhancedAutocompleteProps<InputValueFieldOption> {
  /**
   * qa id for the input field
   */
  'data-qa-dimension-filter'?: string;

  /**
   * test id for the input field
   */
  'data-testid'?: string;

  /**
   * A boolean value that indicates whether the input field is a text field or an autocomplete field.
   */
  isTextField: boolean;

  /**
   * function to handle the blur event of the input field.
   */
  onBlur?: () => void;

  /**
   * A function to handle changes to the input value.
   * This function is called when the user selects an option or types in the text field.
   */
  onChange: (value: null | string) => void;

  /**
   * This is the value that will be displayed in the text field or selected in the autocomplete dropdown.
   */
  value: null | string;
}

export const InputValueField = (props: InputValueFieldProps) => {
  const {
    isTextField,
    isOptionEqualToValue,
    errorText,
    value,
    options = [],
    onChange,
    sx,
    placeholder,
    onBlur,
    label,
    disabled,
    'data-testid': dataTestId,
    'data-qa-dimension-filter': dataQaDimensionFilter,
  } = props;

  if (isTextField) {
    return (
      <TextField
        data-testid={dataTestId}
        disabled={disabled}
        errorText={errorText}
        label={label}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        sx={{ width: '256px', ...sx }}
        value={value === null ? '' : value}
      />
    );
  }

  return (
    <Autocomplete
      data-qa-dimension-filter={dataQaDimensionFilter}
      disabled={disabled}
      errorText={errorText}
      isOptionEqualToValue={isOptionEqualToValue}
      label={label}
      onBlur={onBlur}
      onChange={(_, selected: InputValueFieldOption, operation) => {
        onChange(operation === 'selectOption' ? selected.value : null);
      }}
      options={options}
      placeholder={placeholder}
      sx={sx}
      value={options.find((option) => option.value === value) ?? null}
    />
  );
};
