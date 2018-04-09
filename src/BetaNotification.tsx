import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button from 'material-ui/Button';
import Snackbar, { SnackbarProps } from 'material-ui/Snackbar';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props extends SnackbarProps {
}

type CombinedProps = Props & WithStyles<ClassNames>;

const BetaNotification: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, onClose, ...rest } = props;

  return (<Snackbar
    {...rest}
    className={classes.root}
    message={<span>
      This is the early-access Linode Manager.<a href="https://manager.linode.com/">Click
      here</a> to go back to the classic Linode Manager.
      { onClose && <Button onClick={e => onClose(e, '')}>Close</Button> }
      </span>}
  />);
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(BetaNotification);
