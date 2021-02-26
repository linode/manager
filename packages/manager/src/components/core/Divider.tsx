import Divider, {
  DividerProps as _DividerProps,
} from '@material-ui/core/Divider';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  line: {
    /** these colors match up with the AppBar component boxShadow colors */
    boxShadow: `inset 0 -1px 0 ${
      theme.name === 'lightTheme' ? theme.color.border2 : theme.color.border3
    } !important`,
  },
}));

/* eslint-disable-next-line */
export interface DividerProps extends _DividerProps {}

interface Props extends _DividerProps {
  type?: 'landingHeader' | 'other';
}

const _Divider: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Divider
      classes={{
        root: props.type === 'landingHeader' ? classes.line : undefined,
      }}
      {...props}
    />
  );
};

export default _Divider;
