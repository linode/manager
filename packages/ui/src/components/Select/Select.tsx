import { KeyboardArrowDown } from '@mui/icons-material';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
} from '@mui/material';
import React from 'react';
import { styled } from '@mui/material';

import type { SelectProps as MuiSelectProps } from '@mui/material';

interface SelectProps
  extends Omit<
    MuiSelectProps,
    'IconComponent' | 'children' | 'label' | 'multiple' | 'native' | 'variant'
  > {
  label: string;
  options: { label: string; value: string }[];
}

/**
 * A simple select component with a list of options.
 * A wrapper around MuiSelect with some props overridden for convenience and consistency.
 */
export const Select = (props: SelectProps) => {
  const { label, options, ...rest } = props;
  return (
    <FormControl fullWidth>
      <InputLabel shrink>{label}</InputLabel>
      <StyledSelect
        {...rest}
        IconComponent={KeyboardArrowDown}
        color="primary"
        variant="standard"
        MenuProps={{
          PaperProps: {
            sx: {
              left: '0px !important',
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </StyledSelect>
    </FormControl>
  );
};

const StyledSelect = styled(MuiSelect, {
  label: 'StyledSelect',
})({
  border: 'none',
});
