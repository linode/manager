import _Input, { InputProps as _InputProps } from '@mui/material/Input';
import React from 'react';

export type InputProps = _InputProps;

/**
 * An `<Input />` accepts user input.
 *
 * > ⚠️ Use with caution. We prefer `<TextField />` throughout the app. `<TextField />` uses
 * > this same Input under the hood.
 */
export const Input = (props: InputProps) => {
  return <_Input {...props} />;
};
