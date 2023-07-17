import { default as _Radio, RadioProps } from '@mui/material/Radio';
import * as React from 'react';

import RadioIcon from '../../assets/icons/radio.svg';
import RadioIconRadioed from '../../assets/icons/radioRadioed.svg';

export const Radio = (props: RadioProps) => {
  return (
    <_Radio
      checkedIcon={<RadioIconRadioed />}
      data-qa-radio={props.checked || false}
      icon={<RadioIcon />}
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
