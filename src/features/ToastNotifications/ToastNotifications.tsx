import * as React from 'react';
import * as classNames from 'classnames';
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
  WithStyles,
} from 'material-ui';

import Snackbar from 'material-ui/Snackbar';
import Button from 'material-ui/Button';
import Grid from 'src/components/Grid';
import Close from 'material-ui-icons/Close';
import Typography from 'material-ui/Typography';

import toasts$, { Toast } from './toasts';

type ClassNames = 'root'
  | 'content'
  | 'actions'
  | 'button'
  | 'error'
  | 'warning'
  | 'success';

const styles: StyleRulesCallback<ClassNames> = (theme: Linode.Theme) => {
  const { palette: { status } } = theme;

  return {
    root: {
      background: 'white',
      border: `2px solid ${theme.palette.primary.main}`,
      width: 300,
      [theme.breakpoints.up('md')]: {
        width: 500,
      },
    },
    content: {
      color: '#333',
      lineHeight: 1.4,
      '& a': {
        color: '#000',
        '&:hover': {
          textDecoration: 'underline',
        },
      },
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    button: {
      minWidth: 'auto',
      minHeight: 'auto',
      padding: 0,
      '& > span': {
        padding: 2,
      },
      '& svg': {
        width: 16,
        height: 16,
      },
      '&:hover, &:focus': {
        color: 'white',
        backgroundColor: theme.palette.primary.main,
      },
    },
    error: {
      backgroundColor: status.error,
      border: `2px solid ${status.errorDark}`,
      '& button': {
        color: status.errorDark,
        borderColor: status.errorDark,
        '&:hover, &:focus': {
          backgroundColor: status.errorDark,
          borderColor: status.errorDark,
        },
      },
    },
    warning: {
      backgroundColor: status.warning,
      border: `2px solid ${status.warningDark}`,
      '& button': {
        color: status.warningDark,
        borderColor: status.warningDark,
        '&:hover, &:focus': {
          backgroundColor: status.warningDark,
          borderColor: status.warningDark,
        },
      },
    },
    success: {
      backgroundColor: status.success,
      border: `2px solid ${status.successDark}`,
      '& button': {
        color: status.successDark,
        borderColor: status.successDark,
        '&:hover, &:focus': {
          backgroundColor: status.successDark,
          borderColor: status.successDark,
        },
      },
    },
  };
};

interface Props {}

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
          SnackbarContentProps={{ className:
            classNames({
              [classes.error]: toast.level === 'error',
              [classes.warning]: toast.level === 'warning',
              [classes.success]: toast.level === 'success',
              [classes.root]: true,
            }),
          }}
          message={
            <Grid
              container
              alignItems="center"
              justify="space-between"
              spacing={0}
              data-qa-toast
            >
              <Grid item xs={9} lg={10}>
                <Typography
                  variant="caption"
                  className={classes.content}
                  data-qa-toast-message
                >
                  {toast.message}
                </Typography>
              </Grid>
              <Grid item className={classes.actions} xs={3} lg={2}>
                <Button
                  onClick={this.onClose}
                  color="secondary"
                  variant="raised"
                  className={classes.button}
                >
                  <Close />
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
