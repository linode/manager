import { KeyboardArrowDown } from '@mui/icons-material';
import { Select } from '@mui/material';
import React from 'react';

import type { SelectProps } from '@mui/material';

export const SimpleSelect = (props: SelectProps) => {
  return (
    <Select {...props} IconComponent={KeyboardArrowDown} variant="standard" />
  );
};
