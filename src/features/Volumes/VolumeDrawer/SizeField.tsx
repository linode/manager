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
  onBlur: (e: any) => void;
  onChange: (e: React.ChangeEvent<any>) => void;
  value: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SizeField: React.StatelessComponent<CombinedProps> = ({ error, onBlur, onChange, value }) => {
  return (<TextField
    data-qa-size
    errorText={error}
    helperText={`A single volume can range from 10 GB to ${MAX_VOLUME_SIZE} GB in size.`}
    InputProps={{ endAdornment: <InputAdornment position="end"> GB </InputAdornment> }}
    label="Size"
    name="size"
    type="number"
    onBlur={onBlur}
    onChange={onChange}
    required
    value={value}
  />);
};

const styled = withStyles(styles);

export default styled(SizeField);
