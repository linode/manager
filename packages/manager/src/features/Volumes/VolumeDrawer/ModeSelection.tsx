import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { FormControlLabel } from 'src/components/FormControlLabel';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';

const useStyles = makeStyles({
  label: {
    '& span': {
      fontSize: '1rem',
    },
  },
});

interface Props {
  mode: string;
  onChange: () => void;
}

export const ModeSelection = ({ mode, onChange }: Props) => {
  const classes = useStyles();
  return (
    <RadioGroup
      aria-label="mode"
      data-qa-mode-radio-group
      name="mode"
      onChange={onChange}
      value={mode}
    >
      <FormControlLabel
        className={classes.label}
        control={<Radio />}
        data-qa-radio="Create and Attach Volume"
        label="Create and Attach Volume"
        value="creating_for_linode"
      />
      <FormControlLabel
        className={classes.label}
        control={<Radio />}
        data-qa-radio="Attach Existing Volume"
        label="Attach Existing Volume"
        value="attaching"
      />
    </RadioGroup>
  );
};
