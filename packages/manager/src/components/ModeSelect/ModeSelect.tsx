import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Radio from 'src/components/core/Radio';
import RadioGroup from 'src/components/core/RadioGroup';

export interface Mode<modes> {
  label: string;
  mode: modes;
}

interface Props {
  selected: string;
  modes: Mode<any>[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ModeSelect = ({ modes, onChange, selected }: Props) => {
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
};

export default React.memo(ModeSelect);
