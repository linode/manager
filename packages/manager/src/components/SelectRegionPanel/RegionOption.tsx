import classNames from 'classnames';
import * as React from 'react';
import Option, { OptionProps } from 'react-select/lib/components/Option';

import {
  createStyles,
  makeStyles,
  Theme,
  useTheme
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';

const styles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(1)
    },
    focused: {
      backgroundColor: theme.palette.primary.main,
      color: 'white'
    }
  })
);

interface RegionOptionProps extends OptionProps<string> {
  data: {
    data: {
      flag: () => any;
    };
  };
}

type CombinedProps = RegionOptionProps;

export const RegionOption: React.FC<CombinedProps> = props => {
  const theme = useTheme();
  const classes = styles(theme as any);
  const { data, label } = props;
  return (
    <Option
      className={classNames({
        [classes.root]: true,
        [classes.focused]: props.isFocused
      })}
      {...props}
    >
      <Grid container direction="row" alignItems="center" justify="flex-start">
        <Grid item>{data.data.flag && data.data.flag()}</Grid>
        <Grid item>{label}</Grid>
      </Grid>
    </Option>
  );
};

export default RegionOption;
