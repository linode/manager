import Divider, {
  DividerProps as _DividerProps,
} from '@material-ui/core/Divider';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.cmrBorderColors.borderTabs,
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
}));

/* eslint-disable-next-line */
export interface DividerProps extends _DividerProps {}

interface Props extends _DividerProps {
  type?: 'landingHeader' | 'other';
}

const _Divider: React.FC<Props> = (props) => {
  const classes = useStyles();
  return <Divider classes={{ root: classes.root }} {...props} />;
};

export default _Divider;
