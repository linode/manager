import _InputAdornment from '@mui/material/InputAdornment';
import React from 'react';

import type { InputAdornmentProps } from '@mui/material/InputAdornment';

/**
 * Use an InputAdornment to decorate a `<TextField />` with a prefix or suffix
 *
 * @example
 * <TextField
 *   label="Percentage"
 *   InputProps={{
 *     startAdornment: <InputAdornment position="end">%</InputAdornment>,
 *   }}
 * />
 */
export const InputAdornment = (props: InputAdornmentProps) => {
  return <_InputAdornment {...props} />;
};
