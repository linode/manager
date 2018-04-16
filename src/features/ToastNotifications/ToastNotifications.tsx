import * as React from 'react';
import { Subscription } from 'rxjs/Rx';
import {
  lensPath,
  over,
  set,
  tail,
} from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import Snackbar from 'material-ui/Snackbar';
import Button from 'material-ui/Button';
import Grid from 'src/components/Grid';
import Typography from 'material-ui/Typography';

import toasts$, { Toast } from './toasts';

type ClassNames = 'root'
  | 'content'
  | 'contentInner'
  | 'actions'
  | 'button';

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
  contentInner: {
    paddingLeft: theme.spacing.unit,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'flex-end',
    },
  },
  button: {
    padding: '6px 14px 7px',
  },
});

interface Props { }


interface State {
  toasts: Toast[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const openFirstToast = (ts: Toast[]): Toast[] => {
  if (ts.length === 0) {
    return ts;
  }
  return over(
    lensPath([0]),
    set(lensPath(['open']), true),
    ts,
  );
};

const dismissFirstToast = (ts: Toast[]): Toast[] => {
  if (ts.length === 0) { return ts; }
  return over(
    lensPath([0]),
    set(lensPath(['open']), false),
    ts,
  );
};

const removeFirstToast = (ts: Toast[]): Toast[] => tail(ts);

class Notifier extends React.Component<CombinedProps, State> {
  state: State = {
    toasts: [],
  };

  subscription: Subscription;

  componentDidMount() {
    this.subscription = toasts$
      /**
       * In the somewhat unlikely scenario that we get a flood of events, we're
       * going to buffer for 1s to prevent data loss from React setState being unable
       * to keep up with the process.
       */
      .bufferTime(1000)
      .subscribe((toast) => {
        this.setState(
          () => ({ toasts: [...this.state.toasts, ...toast] }),
          () => this.setState({ toasts: openFirstToast(this.state.toasts) }),
        );
      });
  }

  onClose = () => {
    this.setState(
      { toasts: dismissFirstToast(this.state.toasts) },
      () => this.setState(
        { toasts: removeFirstToast(this.state.toasts) },
        () => this.setState({ toasts: openFirstToast(this.state.toasts) }),
      ),
    );
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { classes } = this.props;
    const { toasts } = this.state;
    if (toasts.length === 0) { return null; }

    return (
      toasts.map((toast) => {
        return <Snackbar
          key={toast.id}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          open={Boolean(toast.open)}
          message={
            <Grid
              container
              alignItems="center"
              justify="space-between"
              spacing={0}
            >
              <Grid item className={classes.content} xs={12} md={9} lg={10}>
                <Typography className={classes.contentInner}>{toast.message}</Typography>
              </Grid>
              <Grid item className={classes.actions} xs={12} md={3} lg={2}>
                <Button
                  onClick={this.onClose}
                  color="primary"
                  variant="raised"
                  className={classes.button}
                >
                  Close
                  </Button>
              </Grid>
            </Grid>}
        />;
      })
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(Notifier);
