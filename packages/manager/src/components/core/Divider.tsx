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
  spacingTop?: number;
  spacingBottom?: number;
}

const _Divider: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { spacingTop, spacingBottom } = props;

  return (
    <Divider
      classes={{ root: classes.root }}
      style={{ marginTop: spacingTop, marginBottom: spacingBottom }}
      {...props}
    />
  );
};

export default _Divider;
