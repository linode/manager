import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button from 'material-ui/Button';
import Grid from 'src/components/Grid';
import Snackbar, { SnackbarProps } from 'material-ui/Snackbar';


type ClassNames = 'root' | 'content' | 'actions';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  content: {
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      textAlign: 'left',
    },
    '& a': {
      color: '#000',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'flex-end',
    },
  },
});

interface Props extends SnackbarProps {
}

type CombinedProps = Props & WithStyles<ClassNames>;

const BetaNotification: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, onClose, ...rest } = props;

  return (<Snackbar
    {...rest}
    className={classes.root}
    message={
      <Grid
        container
        alignItems="center"
        justify="space-between"
      >
        <Grid item className={classes.content} xs={12} md={9} lg={10}>
          This is the early-access Linode Manager. <a href="https://manager.linode.com/">Click
          here</a> to go back to the classic Linode Manager.
        </Grid>
        { onClose &&
        <Grid item className={classes.actions} xs={12} md={3} lg={2}>
            <Button
              onClick={e => onClose(e, '')}
              color="primary"
              variant="raised"
            >
              Close
            </Button>
          </Grid>
        }
      </Grid>}
  />);
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(BetaNotification);
