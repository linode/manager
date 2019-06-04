import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Radio from 'src/components/core/Radio';
import RadioGroup from 'src/components/core/RadioGroup';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {}
  });

export interface Mode<modes> {
  label: string;
  mode: modes;
}

interface Props {
  selected: string;
  modes: Mode<any>[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ModeSelect: React.StatelessComponent<CombinedProps> = ({
  modes,
  onChange,
  selected
}) => {
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

const styled = withStyles(styles);

export default React.memo(styled(ModeSelect));
