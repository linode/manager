import { default as _FormControl } from '@mui/material/FormControl';
import * as React from 'react';

import type { FormControlProps } from '@mui/material/FormControl';

/**
 * A `<FormControl />` wraps some kind of input to provide things such as
 * a label, error, helper text, etc...
 */
export const FormControl = (props: FormControlProps) => {
  return <_FormControl {...props} />;
};
