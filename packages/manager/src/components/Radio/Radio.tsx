import * as React from 'react';
import { default as _Radio, RadioProps } from '@mui/material/Radio';
import RadioIcon from '../../assets/icons/radio.svg';
import RadioIconRadioed from '../../assets/icons/radioRadioed.svg';

export const Radio = (props: RadioProps) => {
  return (
    <_Radio
      icon={<RadioIcon />}
      checkedIcon={<RadioIconRadioed />}
      data-qa-radio={props.checked || false}
      {...props}
      inputProps={{
        role: 'radio',
        'aria-label': props.name,
        'aria-checked': props.checked,
        ...props.inputProps,
      }}
    />
  );
};
