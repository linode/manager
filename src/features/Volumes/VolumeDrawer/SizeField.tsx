import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import InputAdornment from 'src/components/core/InputAdornment';
import TextField from 'src/components/TextField';
import { MAX_VOLUME_SIZE } from 'src/constants';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  error?: string;
  handleBlur: any;
  handleChange: any;
  value: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SizeField: React.StatelessComponent<CombinedProps> = ({ error, handleBlur, handleChange, value }) => {
  return (<TextField
    data-qa-size
    errorText={error}
    helperText={`A single volume can range from 10 GiB to ${MAX_VOLUME_SIZE} GiB in size.`}
    InputProps={{ endAdornment: <InputAdornment position="end"> GB </InputAdornment> }}
    label="Size"
    name="size"
    type="number"
    onBlur={handleBlur}
    onChange={handleChange}
    required
    value={value}
  />);
};

const styled = withStyles(styles);

export default styled(SizeField);
