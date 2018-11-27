import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Radio from 'src/components/core/Radio';
import RadioGroup from 'src/components/core/RadioGroup';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  mode: string;
  onChange: () => void
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DrawerModeSelection: React.StatelessComponent<CombinedProps> = ({ mode, onChange }) => {

  return (
    <RadioGroup
      aria-label="mode"
      name="mode"
      value={mode}
      onChange={onChange}
      data-qa-mode-radio-group
    >
      <FormControlLabel value="creating_for_linode" label="Create and Attach Volume" control={<Radio />} />
      <FormControlLabel value="attaching" label="Attach Existing Volume" control={<Radio />} />
    </RadioGroup>
  );
};

const styled = withStyles(styles);

export default styled(DrawerModeSelection);
