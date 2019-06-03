import {
  createStyles,
  withStyles,
  WithStyles
} from '@material-ui/styles';
import * as React from 'react';
import TextField from 'src/components/TextField';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
  root: {}
});

interface Props {
  onBlur: (e: any) => void;
  onChange: (e: React.ChangeEvent<any>) => void;
  error?: string;
  value: string;
  name: string;
  disabled?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LabelField: React.StatelessComponent<CombinedProps> = ({
  error,
  onBlur,
  onChange,
  value,
  name,
  ...rest
}) => {
  return (
    <TextField
      data-qa-volume-label
      errorText={error}
      label="Label"
      name={name}
      onBlur={onBlur}
      onChange={onChange}
      required
      value={value}
      {...rest}
    />
  );
};

const styled = withStyles(styles);

export default styled(LabelField);
