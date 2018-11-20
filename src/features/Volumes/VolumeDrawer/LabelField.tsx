import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import TextField from 'src/components/TextField';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  handleBlur: any;
  handleChange: any;
  error?: string;
  value: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LabelField: React.StatelessComponent<CombinedProps> = ({ error, handleBlur, handleChange, value, }) => {
  return (
    <TextField
      data-qa-volume-label
      errorText={error}
      label="Label"
      name="label"
      onBlur={handleBlur}
      onChange={handleChange}
      required
      value={value}
    />
  );
};

const styled = withStyles(styles);

export default styled(LabelField);
