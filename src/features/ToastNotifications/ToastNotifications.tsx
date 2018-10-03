import * as classNames from 'classnames';
import { lensPath, over, set, tail } from 'ramda';
import * as React from 'react';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/merge';
import { Subscription } from 'rxjs/Subscription';

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Close from '@material-ui/icons/Close';

import Grid from 'src/components/Grid';
import { events$ } from 'src/events';
import toasts$, { createToast, Toast } from './toasts';

type ClassNames = 'root'
  | 'content'
  | 'actions'
  | 'button'
  | 'error'
  | 'warning'
  | 'success';

const styles: StyleRulesCallback<ClassNames> = (theme) => {
  const { palette: { status } } = theme;

  return {
    root: {
      background: 'white',
      borderLeft: `5px solid ${theme.palette.primary.main}`,
      [theme.breakpoints.up('sm')]: {
        maxWidth: 300,
      },
      [theme.breakpoints.up('md')]: {
        width: 500,
        maxWidth: 500,
      },
    },
    content: {
      color: '#32363C',
      lineHeight: 1.4,
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    button: {
      minWidth: 'auto',
      minHeight: 'auto',
      padding: 0,
      border: 0,
      color: theme.palette.text.primary,
      borderRadius: '50%',
      '& > span': {
        padding: 2,
      },
      '& svg': {
        width: 24,
        height: 24,
      },
      '&:hover, &:focus': {
        color: theme.palette.primary.main,
      },
    },
    error: {
      borderLeftColor: status.errorDark,
    },
    warning: {
      borderLeftColor: status.warningDark,
    },
    success: {
      borderLeftColor: status.successDark,
    },
  };
};

interface State {
  toasts: Toast[];
}

type CombinedProps = WithStyles<ClassNames>;

const openFirstToast = (ts: Toast[]): Toast[] => {
  if (ts.length === 0) { return ts; }
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

const removeFirstToast = (ts: Toast[]): Toast[] => ts.length === 0
  ? []
  : tail(ts);

class Notifier extends React.Component<CombinedProps, State> {
  state: State = {
    toasts: [],
  };

  subscription: Subscription;

  componentDidMount() {
    this.subscription = toasts$
      .merge(
        events$
          .filter((e) => !e._initial && e.status === 'failed')
          .map(event => {
            if (event.action === 'disk_imagize') {
              return createToast('There was an error creating an image.', 'error');
            }

            if (event.action === 'volume_create') {
              return createToast(`There was an error attaching volume ${event.entity && event.entity.label}.`, 'error');
            }

            return;
          })
      )
      /**
       * In the somewhat unlikely scenario that we get a flood of events, we're
       * going to buffer for 1s to prevent data loss from React setState being unable
       * to keep up with the process.
       */
      .filter(Boolean)
      .bufferTime(500)
      .subscribe((toasts) => {
        if (toasts.length === 0) {
          return;
        }

        this.setState(
          () => ({ toasts: [...this.state.toasts, ...toasts] }),
          () => this.setState({ toasts: openFirstToast(this.state.toasts) }),
        );
      });
  }

  onClose = (e: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ toasts: dismissFirstToast(this.state.toasts) });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  onExited = () => this.setState(
    { toasts: removeFirstToast(this.state.toasts) },
    () => this.setState(({ toasts: openFirstToast(this.state.toasts) })),
  );

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
          autoHideDuration={6000}
          onClose={this.onClose}
          onExited={this.onExited}
          aria-live="assertive"
          ContentProps={{
            className:
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
