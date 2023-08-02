import _Input, { InputProps as _InputProps } from '@mui/material/Input';
import React from 'react';

export type InputProps = _InputProps;

export const Input = (props: InputProps) => {
  return <_Input {...props} />;
};
