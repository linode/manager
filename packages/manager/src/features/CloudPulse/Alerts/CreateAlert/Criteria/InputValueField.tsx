import { Autocomplete, TextField } from '@linode/ui';
import React from 'react';

import type { SxProps, Theme } from '@mui/material';

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

interface InputValueFieldProps {
  /**
   * qa id for the input field
   */
  'data-qa-dimension-filter'?: string;

  /**
   * test id for the input field
   */
  'data-testid'?: string;

  /**
   * boolean value to disable the input field
   */
  disabled?: boolean;

  /**
   * The error text to display when the input is invalid.
   */
  errorText?: string;

  /**
   * A function to determine if an option is equal to the selected value.
   * This is used to compare the selected value with the options in the dropdown.
   */
  isOptionEqualToValue?: (
    option: InputValueFieldOption,
    value: InputValueFieldOption
  ) => boolean;

  /**
   * A boolean value that indicates whether the input field is a text field or an autocomplete field.
   */
  isTextField: boolean;

  /**
   * The label to display for the input field.
   */
  label: string;

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
   * options for the autocomplete field.
   */
  options?: InputValueFieldOption[];

  /**
   * The placeholder text to display when the input field is empty.
   */
  placeholder?: string;

  /**
   * The sx prop allows you to pass in custom styles to the component.
   */
  sx?: SxProps<Theme>;

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
    ...rest
  } = props;

  if (isTextField) {
    return (
      <TextField
        {...rest}
        errorText={errorText}
        onChange={(event) => onChange(event.target.value)}
        sx={{ width: '256px' }}
        value={value === null ? '' : value}
      />
    );
  }

  return (
    <Autocomplete
      errorText={errorText}
      isOptionEqualToValue={isOptionEqualToValue}
      onChange={(_, selected: { label: string; value: string }, operation) => {
        onChange(operation === 'selectOption' ? selected.value : null);
      }}
      options={options}
      value={options.find((option) => option.value === value) ?? null}
      {...rest}
    />
  );
};
