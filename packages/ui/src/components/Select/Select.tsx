import { styled } from '@mui/material';
import React from 'react';

import { Autocomplete } from '../Autocomplete';
import { Box } from '../Box';

import type { EnhancedAutocompleteProps } from '../Autocomplete';

type OptionType = { label: string; value: string };

type SelectProps = Pick<
  EnhancedAutocompleteProps<OptionType>,
  | 'errorText'
  | 'helperText'
  | 'label'
  | 'onChange'
  | 'options'
  | 'placeholder'
  | 'textFieldProps'
  | 'value'
>;

/**
 * An abstracted Autocomplete component with some props overridden for convenience and consistency.
 */
export const Select = (props: SelectProps) => {
  const { textFieldProps, ...rest } = props;

  return (
    <SelectContainer>
      <Autocomplete
        {...rest}
        textFieldProps={{
          ...textFieldProps,
          inputProps: {
            ...textFieldProps?.inputProps,
            readOnly: true,
          },
        }}
      />
    </SelectContainer>
  );
};

const SelectContainer = styled(Box)(({}) => ({
  '& .MuiInputBase-root, & .MuiInputBase-input': {
    '&::selection': {
      backgroundColor: 'transparent',
    },
    cursor: 'pointer',
  },
}));
