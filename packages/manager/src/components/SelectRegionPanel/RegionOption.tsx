import classNames from 'classnames';
import * as React from 'react';
import Option, { OptionProps } from 'react-select/lib/components/Option';

import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(1)
  },
  focused: {
    backgroundColor: theme.palette.primary.main,
    color: 'white'
  }
}));

interface RegionOptionProps extends OptionProps<string> {
  option: {
    data: {
      flag: () => JSX.Element | null;
      country: string;
    };
  };
}

type CombinedProps = RegionOptionProps;

export const RegionOption: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { option, label } = props;
  return (
    <Option
      className={classNames({
        [classes.root]: true,
        [classes.focused]: props.isFocused
      })}
      {...props}
    >
      <Grid container direction="row" alignItems="center" justify="flex-start">
        <Grid item>{option.data.flag && option.data.flag()}</Grid>
        <Grid item>{label}</Grid>
      </Grid>
    </Option>
  );
};

export default RegionOption;
