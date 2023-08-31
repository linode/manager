import { FormControlProps } from '@mui/material';
import _Select, { SelectProps } from '@mui/material/Select';
import React from 'react';

import { convertToKebabCase } from 'src/utilities/convertToKebobCase';

import { FormControl } from './FormControl';
import { FormHelperText } from './FormHelperText';
import { InputLabel } from './InputLabel';

interface Props extends SelectProps {
  /**
   * Props to pass to the underlying FormControl
   */
  FormControlProps?: FormControlProps;
  /**
   * Error text to render below the Select
   */
  errorText?: string;
  /**
   * Error text to render below the Select
   */
  helperText?: string;
  /**
   * Label for the Input
   */
  label: string;
}

/**
 * A simple Select component intended to work and look like our TextField component.
 * Reccomended to use when there is a finite set of options and no complex features such as autocomplete are needed.
 */
export const Select = (props: Props) => {
  const { FormControlProps, errorText, helperText, ...SelectProps } = props;

  const id = convertToKebabCase(props.label);
  const labelId = `${id}-label`;
  const errorTextId = `${id}-error-text`;
  const helperTextId = `${id}-helper-text`;

  const ariaDescribedBy: string[] = [];

  if (helperText) {
    ariaDescribedBy.push(helperTextId);
  }

  if (errorText) {
    ariaDescribedBy.push(errorTextId);
  }

  const error = Boolean(errorText);

  return (
    <FormControl
      {...FormControlProps}
      error={error}
      sx={{ marginTop: '0' }}
      variant="standard"
    >
      <InputLabel id={labelId}>{props.label}</InputLabel>
      <_Select
        area-aria-describedby={ariaDescribedBy.join(',')}
        area-aria-labelledby={labelId}
        id={id}
        labelId={labelId}
        {...SelectProps}
      />
      {helperText && (
        <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
      )}
      {error && <FormHelperText id={errorTextId}>{errorText}</FormHelperText>}
    </FormControl>
  );
};
