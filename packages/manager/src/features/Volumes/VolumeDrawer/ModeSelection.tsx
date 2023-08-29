import * as React from 'react';

import { FormControlLabel } from 'src/components/FormControlLabel';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';

type Mode = 'attach' | 'create';

interface Props {
  mode: Mode;
  onChange: (value: Mode) => void;
}

export const ModeSelection = ({ mode, onChange }: Props) => {
  return (
    <RadioGroup
      aria-label="mode"
      name="mode"
      onChange={(_, value) => onChange(value as Mode)}
      value={mode}
    >
      <FormControlLabel
        control={<Radio />}
        data-qa-radio="Create and Attach Volume"
        label="Create and Attach Volume"
        value="create"
      />
      <FormControlLabel
        control={<Radio />}
        data-qa-radio="Attach Existing Volume"
        label="Attach Existing Volume"
        value="attach"
      />
    </RadioGroup>
  );
};
