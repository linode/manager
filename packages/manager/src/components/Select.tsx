import { FormControlProps } from '@mui/material';
import _Select, { SelectProps } from '@mui/material/Select';
import React from 'react';

import { convertToKebabCase } from 'src/utilities/convertToKebobCase';

import { FormControl } from './FormControl';
import { InputLabel } from './InputLabel';

interface Props extends SelectProps {
  FormControlProps?: FormControlProps;
  label: string;
}

export const Select = (props: Props) => {
  const { FormControlProps, ...SelectProps } = props;

  const id = convertToKebabCase(props.label);
  const labelId = `${id}-label`;

  return (
    <FormControl {...FormControlProps} variant="standard">
      <InputLabel id={labelId}>{props.label}</InputLabel>
      <_Select id={id} labelId={labelId} {...SelectProps} />
    </FormControl>
  );
};
