import { default as _FormControlLabel } from '@mui/material/FormControlLabel';
import * as React from 'react';

import type { FormControlLabelProps } from '@mui/material/FormControlLabel';

/**
 * A `<FormControlLabel />` is used to label components such as Radios, Checkboxes, or Switches.
 *
 * @example
 * <FormControlLabel
 *   control={<Checkbox />}
 *   label="This is a FormControlLabel"
 *   onChange={() => {}}
 * />
 */
export const FormControlLabel = (props: FormControlLabelProps) => {
  return <_FormControlLabel {...props} />;
};
