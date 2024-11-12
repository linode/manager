import { default as _Radio, RadioProps } from '@mui/material/Radio';
import * as React from 'react';

import RadioIcon from '../../assets/icons/radio.svg';
import RadioIconRadioed from '../../assets/icons/radioRadioed.svg';

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
  const sizeInPixels: Record<string, string> = {
    medium: '25px',
    small: '20px',
  };
  const iconDimension = sizeInPixels[props.size ?? 'medium'];
  return (
    <_Radio
      checkedIcon={
        <RadioIconRadioed height={iconDimension} width={iconDimension} />
      }
      data-qa-radio={props.checked || false}
      icon={<RadioIcon height={iconDimension} width={iconDimension} />}
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
