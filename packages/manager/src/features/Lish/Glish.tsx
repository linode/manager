import * as classNames from 'classnames';
import { Linode } from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import ErrorState from 'src/components/ErrorState';
import { getLishSchemeAndHostname, resizeViewPort } from '.';
import VncDisplay from './VncDisplay';

type ClassNames = 'container' | 'errorState' | 'message' | 'link';

const styles = (theme: Theme) =>
  createStyles({
    container: {
      '& canvas': {
        margin: 'auto',
        display: 'block'
      }
    },
    message: {
      color: 'white',
      textAlign: 'center',
      minHeight: '30px',
      margin: theme.spacing(2)
    },
    link: {
      background: 'none',
      color: theme.palette.primary.main,
      border: 'none',
      padding: 0,
      font: 'inherit',
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    errorState: {
      '& *': {
        color: '#f4f4f4 !important'
      }
    }
  });

interface Props {
  linode: Linode;
  token: string;
  refreshToken: () => Promise<void> | undefined;
}

interface State {
  activeVnc: boolean;
  connected: boolean;
  powered: boolean;
  /* used to prevent flickering of the progress indicator */
  initialConnect: boolean;
  isRetryingConnection: boolean;
  retryAttempts: number;
  error: string;
}

type CombinedProps = Props &
  WithStyles<ClassNames> &
  RouteComponentProps<{ linodeId?: string }>;

const maxRetryAttempts: number = 3;

class Glish extends React.Component<CombinedProps, State> {
  state: State = {
    activeVnc: true,
    connected: false,
    powered: true,
    initialConnect: false,
    isRetryingConnection: false,
    retryAttempts: 0,
    error: ''
  };

  mounted: boolean = false;
  lastDisconnect: number = Date.now();

  monitor: WebSocket;
  monitorInterval: number;
  renewInterval: number;

  componentDidMount() {
    this.mounted = true;
    const { linode, token } = this.props;

    resizeViewPort(1080, 840);

    const region = (linode as Linode).region;
    this.refreshMonitor(region, token as string);
    this.renewVncToken();
  }

  componentWillUnmount() {
    this.mounted = false;
    clearInterval(this.monitorInterval);
    clearInterval(this.renewInterval);
    if (this.monitor && this.monitor.readyState === this.monitor.OPEN) {
      this.monitor.close();
    }
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const { linode } = this.props;
    const region = (linode as Linode).region;

    /*
     * If we have a new token, refresh the console
     * and the websocket connection with the new token
     */
    if (this.props.token !== prevProps.token) {
      this.monitor.close();
    }

    /*
     * If refreshing the console failed, and we did not surpass the max number of
     * reconnection attempts, try to get a new lish token
     */
    const { retryAttempts, isRetryingConnection } = this.state;
    if (prevState.retryAttempts !== retryAttempts && isRetryingConnection) {
      setTimeout(() => {
        /*
         * It's okay to disregard typescript checking here
         * because the parent component <Lish /> handles
         * the situation where refreshToken() returns undefined
         */
        this.props
          .refreshToken()!
          .then(() => {
            this.refreshMonitor(region, this.props.token);
            this.renewVncToken();
          })
          .catch(e => e);
      }, 3000);
    }
  }

  onUpdateVNCState = (rfb: any, newState: string) => {
    switch (newState) {
      case 'normal':
        if (!this.mounted) {
          return;
        }
        this.setState({
          connected: true,
          initialConnect: true
        });
        break;
      case 'disconnected':
      case 'failed':
      case 'fatal':
        if (!this.mounted) {
          return;
        }
        this.setState({
          connected: false,
          activeVnc: false
        });
        setTimeout(() => {
          if (!this.mounted) {
            return;
          }
          this.setState({ activeVnc: true });
        }, 3000);
        break;
      default:
        break;
    }
  };

  linodeOnClick = (linodeID: number) => () => {
    window.opener.location = `/linodes/${linodeID}`;
  };

  linodeAnchor = (linodeID: number, linodeLabel: string) => {
    const { classes } = this.props;
    return (
      <button
        className={classNames('force-link', 'text-muted', {
          [classes.link]: true
        })}
        onClick={this.linodeOnClick(linodeID)}
        role="button"
        title={linodeLabel}
      >
        {linodeLabel}
      </button>
    );
  };

  renewVncToken = () => {
    // renew our VNC session every 5 minutes
    clearInterval(this.renewInterval);
    this.renewInterval = window.setInterval(() => {
      if (this.monitor.readyState === this.monitor.OPEN) {
        this.monitor.send(JSON.stringify({ action: 'renew' }));
      }
    }, 30 * 1000);
  };

  refreshMonitor = (region: string, token: string) => {
    this.connectMonitor(region, token);
    /* Get status every 5 seconds. */
    clearInterval(this.monitorInterval);
    this.monitorInterval = window.setInterval(() => {
      if (this.monitor.readyState === this.monitor.OPEN) {
        this.monitor.send(JSON.stringify({ action: 'status' }));
      }
    }, 5 * 1000);
  };

  connectMonitor = (region: string, token: string) => {
    const { retryAttempts } = this.state;

    if (this.monitor && this.monitor.readyState === this.monitor.OPEN) {
      this.monitor.close();
    }

    const url = `${getLishSchemeAndHostname(region)}:8080/${token}/monitor`;
    this.monitor = new WebSocket(url);
    this.monitor.addEventListener('message', ev => {
      const data = JSON.parse(ev.data);

      if (data.poweredStatus === 'Running') {
        if (!this.mounted) {
          return;
        }
        this.setState({ powered: true });
      } else if (data.poweredStatus === 'Powered Off') {
        if (!this.mounted) {
          return;
        }
        this.setState({ powered: false });
        return;
      }

      if (
        data.type === 'error' &&
        data.reason === 'Your session has expired.'
      ) {
        /*
         * We tried to reconnect 3 times
         */
        if (retryAttempts === maxRetryAttempts) {
          this.setState({
            error: 'Session could not be initialized. Please try again later'
          });
          return;
        }
        /*
         * We've tried less than 3 reconnects
         */
        this.setState({
          isRetryingConnection: true,
          retryAttempts: retryAttempts + 1
        });
        return;
      }

      if (data.type === 'kick') {
        this.refreshMonitor(region, token);
      }
    });
  };

  canvasResize = (width: number, height: number) => {
    resizeViewPort(width + 40, height + 70);
  };

  renderErrorState = () => {
    const { error } = this.state;
    const { classes } = this.props;
    return (
      <div className={classes.errorState}>
        <ErrorState errorText={error} />
      </div>
    );
  };

  renderRetryState = () => {
    const { classes } = this.props;
    const { retryAttempts } = this.state;

    return (
      <div className={classes.message}>
        {`Lish Token could not be validated. Retrying in 3 seconds...
          ${retryAttempts} / ${maxRetryAttempts}`}
        <CircleProgress mini />
      </div>
    );
  };

  render() {
    const { classes, linode, token } = this.props;
    const {
      activeVnc,
      initialConnect,
      powered,
      error,
      isRetryingConnection
    } = this.state;
    const region = linode && (linode as Linode).region;

    if (error) {
      return this.renderErrorState();
    }

    return (
      <div id="Glish">
        {!powered && (
          <div className={classes.errorState}>
            <ErrorState errorText="Please power on your Linode to use Glish" />
          </div>
        )}

        {/*
         * The loading states have to render with the VncDisplay component
         * because the messages from the websocket connection have to be send
         * if you're rendering a loading state, then get a message from websockets,
         * then render the VncDisplay, you end up with a blank black screen
         */}
        {powered && !initialConnect ? (
          isRetryingConnection ? (
            this.renderRetryState()
          ) : (
            <CircleProgress noInner />
          )
        ) : (
          <React.Fragment />
        )}

        {powered && activeVnc && token && region && (
          <div
            className={classes.container}
            style={!initialConnect ? { display: 'none' } : {}}
          >
            <VncDisplay
              url={`${getLishSchemeAndHostname(region)}:8080/${token}`}
              onUpdateState={this.onUpdateVNCState}
              onResize={this.canvasResize}
            />
          </div>
        )}
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(withRouter(Glish));
