import { SvgIcon } from '@mui/material';
import { default as _Radio } from '@mui/material/Radio';
import * as React from 'react';

import { RadioIcon, RadioIconRadioed } from '../../assets/icons';

import type { RadioProps } from '@mui/material/Radio';

/**
### Use radio buttons to

- Expose all available options
- Select a single option from a list

### Guidelines

- If there are 3 or fewer items to select, use radio buttons rather than drop-down menus.
- If possible, offer a default selection.
- Because radio buttons allow only one choice, make sure that the options are both comprehensive and distinct.
- Let users select an option by clicking on either the button itself or its label to provide as big a target area as possible.

### Reasons for a Default Selection

- Expedite tasks
- Give people control and align with their expectations
 */
export const Radio = (props: RadioProps) => {
  return (
    <_Radio
      checkedIcon={
        <SvgIcon
          component={RadioIconRadioed}
          fontSize={props.size}
          viewBox="0 0 20 20"
        />
      }
      icon={
        <SvgIcon
          component={RadioIcon}
          fontSize={props.size}
          viewBox="0 0 20 20"
        />
      }
      data-qa-radio={props.checked || false}
      {...props}
      inputProps={{
        'aria-checked': props.checked,
        'aria-label': props.name,
        role: 'radio',
        ...props.inputProps,
      }}
    />
  );
};

export type { RadioProps };
