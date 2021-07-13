import Divider, {
  DividerProps as _DividerProps,
} from '@material-ui/core/Divider';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import * as classnames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.cmrBorderColors.divider,
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  light: {
    backgroundColor: theme.cmrBorderColors.dividerLight,
  },
}));

/* eslint-disable-next-line */
export interface DividerProps extends _DividerProps {}

interface Props extends _DividerProps {
  light?: boolean;
  spacingTop?: number;
  spacingBottom?: number;
}

const _Divider: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { light, spacingTop, spacingBottom, ...rest } = props;

  return (
    <Divider
      className={classnames({
        [classes.root]: true,
        [classes.light]: light,
      })}
      style={{ marginTop: spacingTop, marginBottom: spacingBottom }}
      {...rest}
    />
  );
};

export default _Divider;
