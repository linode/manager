import { default as _FormLabel } from '@mui/material/FormLabel';
import React from 'react';

import type { FormLabelProps } from '@mui/material/FormLabel';

/**
 * A `<FormLabel />` is used to label a FormControl.
 *
 * @example
 * <FormControl>
 *   <FormLabel>Theme</FormLabel>
 *   <RadioGroup>
 *     <FormControlLabel
 *       control={<Radio />}
 *       label="Light"
 *       value="light"
 *     />
 *     <FormControlLabel
 *       control={<Radio />}
 *       label="Dark"
 *       value="dark"
 *     />
 *   </RadioGroup>
 * </FormControl>
 */
export const FormLabel = (props: FormLabelProps) => {
  return <_FormLabel {...props} />;
};
