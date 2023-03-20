import Divider, { DividerProps as _DividerProps } from '@mui/material/Divider';
import classNames from 'classnames';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
  light: {
    borderColor: theme.name === 'light' ? '#e3e5e8' : '#2e3238',
  },
  dark: {
    borderColor: theme.color.border2,
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
        [classes.dark]: dark,
        [classes.light]: light,
      })}
      style={{ marginTop: spacingTop, marginBottom: spacingBottom }}
      {...rest}
    />
  );
};

export default _Divider;
