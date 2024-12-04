import { KeyboardArrowDown } from '@mui/icons-material';
import { styled } from '@mui/material';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
} from '@mui/material';
import React from 'react';

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

const BaseSelect = styled(MuiSelect, {
  label: 'StyledSelect',
})(() => ({
  '& .MuiSvgIcon-root': {
    top: 4,
  },
}));

const StyledSelect = styled(({ className, ...props }: MuiSelectProps) => (
  <BaseSelect
    {...props}
    MenuProps={{ PaperProps: { className }, marginThreshold: 0 }}
  />
))(({ theme }) => ({
  '& .MuiList-root': {
    border: `1px solid ${theme.palette.primary.main}`,
    overflow: 'hidden',
    width: 'calc(100% + 2px)',
  },
  marginLeft: -1,
  marginTop: -1,
  overflow: 'visible',
}));
