import {
  createStyles,
  withStyles,
  WithStyles
} from '@material-ui/styles';
import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Radio from 'src/components/core/Radio';
import RadioGroup from 'src/components/core/RadioGroup';

type ClassNames = 'root' | 'label';

const styles = (theme: Theme) =>
  createStyles({
  root: {},
  label: {
    '& span': {
      fontSize: '1rem'
    }
  }
});

interface Props {
  mode: string;
  onChange: () => void;
  classes: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DrawerModeSelection: React.StatelessComponent<CombinedProps> = ({
  mode,
  onChange,
  classes
}) => {
  return (
    <RadioGroup
      aria-label="mode"
      name="mode"
      value={mode}
      onChange={onChange}
      data-qa-mode-radio-group
    >
      <FormControlLabel
        className={classes.label}
        value="creating_for_linode"
        label="Create and Attach Volume"
        control={<Radio />}
        data-qa-radio="Create and Attach Volume"
      />
      <FormControlLabel
        className={classes.label}
        value="attaching"
        label="Attach Existing Volume"
        control={<Radio />}
        data-qa-radio="Attach Existing Volume"
      />
    </RadioGroup>
  );
};

const styled = withStyles(styles);

export default styled(DrawerModeSelection);
