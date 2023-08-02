import _Input, { InputProps as _InputProps } from '@mui/material/Input';
import React from 'react';

export type InputProps = _InputProps;

/**
 * An `<Input />` accepts user input.
 *
 * > ⚠️ Currently not widely used. We prefer `<TextField />` throughout the app.
 */
export const Input = (props: InputProps) => {
  return <_Input {...props} />;
};
