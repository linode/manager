import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
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
