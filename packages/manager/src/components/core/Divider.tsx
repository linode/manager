import Divider, {
  DividerProps as _DividerProps,
} from '@material-ui/core/Divider';
import classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.borderColors.divider,
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  light: {
    backgroundColor: theme.name === 'lightTheme' ? '#e3e5e8' : '#2e3238',
  },
  dark: {
    backgroundColor: theme.color.border2,
  },
}));

/* eslint-disable-next-line */
export interface DividerProps extends _DividerProps {}

interface Props extends _DividerProps {
  dark?: boolean;
  light?: boolean;
  spacingTop?: number;
  spacingBottom?: number;
}

const _Divider: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { dark, light, spacingTop, spacingBottom, ...rest } = props;

  return (
    <Divider
      className={classNames({
        [classes.root]: true,
        [classes.dark]: dark,
        [classes.light]: light,
      })}
      style={{ marginTop: spacingTop, marginBottom: spacingBottom }}
      {...rest}
    />
  );
};

export default _Divider;
