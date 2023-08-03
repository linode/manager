import * as React from 'react';

import { Radio } from 'src/components/Radio/Radio';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { RadioGroup } from 'src/components/RadioGroup';

export interface Mode<modes> {
  label: string;
  mode: modes;
}

interface ModeSelectProps {
  modes: Mode<any>[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selected: string;
}

export const ModeSelect = React.memo((props: ModeSelectProps) => {
  const { modes, onChange, selected } = props;
  return (
    <RadioGroup
      aria-label="mode"
      data-qa-mode-radio-group
      name="mode"
      onChange={onChange}
      value={selected}
    >
      {modes.map((mode, idx: number) => (
        <FormControlLabel
          control={<Radio />}
          data-qa-radio={mode.label}
          key={idx}
          label={mode.label}
          value={mode.mode}
        />
      ))}
    </RadioGroup>
  );
});
