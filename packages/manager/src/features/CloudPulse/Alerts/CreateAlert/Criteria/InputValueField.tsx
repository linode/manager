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
   * The current value of the input field.
   */
  currentValue: null | string;

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
  onValueChange: (value: null | string) => void;
}

export const InputValueField = (props: InputValueFieldProps) => {
  const {
    isTextField,
    isOptionEqualToValue,
    errorText,
    currentValue,
    options = [],
    onValueChange,
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
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        sx={{ width: '256px', ...sx }}
        value={currentValue ?? ''}
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
        onValueChange(operation === 'selectOption' ? selected.value : null);
      }}
      options={options}
      placeholder={placeholder}
      sx={sx}
      value={options.find((option) => option.value === currentValue) ?? null}
    />
  );
};
