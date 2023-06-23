import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import { Radio } from 'src/components/Radio/Radio';

export interface Mode<modes> {
  label: string;
  mode: modes;
}

interface ModeSelectProps {
  selected: string;
  modes: Mode<any>[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ModeSelect = React.memo((props: ModeSelectProps) => {
  const { modes, onChange, selected } = props;
  return (
    <RadioGroup
      aria-label="mode"
      name="mode"
      value={selected}
      onChange={onChange}
      data-qa-mode-radio-group
    >
      {modes.map((mode, idx: number) => (
        <FormControlLabel
          key={idx}
          value={mode.mode}
          label={mode.label}
          control={<Radio />}
          data-qa-radio={mode.label}
        />
      ))}
    </RadioGroup>
  );
});
