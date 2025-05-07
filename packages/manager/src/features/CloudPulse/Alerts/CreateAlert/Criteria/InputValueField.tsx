import { Autocomplete, TextField } from '@linode/ui';
import React from 'react';

import type { SxProps, Theme } from '@mui/material';

interface InputValueFieldOption {
  label: string;
  value: string;
}

interface InputValueFieldProps {
  'data-qa-dimension-filter'?: string;
  'data-testid'?: string;
  disabled?: boolean;
  errorText?: string;
  isOptionEqualToValue?: (
    option: InputValueFieldOption,
    value: InputValueFieldOption
  ) => boolean;
  isTextField: boolean;
  label: string;
  onBlur?: () => void;
  onChange: (value: null | string) => void;
  options?: InputValueFieldOption[];
  placeholder?: string;
  sx?: SxProps<Theme>;
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
        onChange={(event) => onChange(event.target.value)}
        sx={{ width: '256px' }}
        value={value}
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
