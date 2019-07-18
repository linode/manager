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
import { Terminal } from 'xterm';
import { getLishSchemeAndHostname, resizeViewPort } from '.';

type ClassNames = 'progress' | 'message' | 'errorState';

const styles = (theme: Theme) =>
  createStyles({
    progress: {
      height: 'auto'
    },
    message: {
      color: 'white',
      textAlign: 'center',
      minHeight: '30px',
      margin: theme.spacing(2)
    },
    errorState: {
      '& *': {
        color: '#f4f4f4 !important'
      }
    }
  });

interface Props {
  linode: Linode.Linode;
  token: string;
  refreshToken: () => Promise<void> | undefined;
}

interface State {
  renderingLish: boolean;
  retryingConnection: boolean;
  retryAttempts: number;
  error: string;
}

type CombinedProps = Props &
  WithStyles<ClassNames> &
  RouteComponentProps<{ linodeId?: string }>;

const maxRetryAttempts: number = 3;

export class Weblish extends React.Component<CombinedProps, State> {
  state: State = {
    renderingLish: true,
    retryingConnection: false,
    retryAttempts: 0,
    error: ''
  };

  mounted: boolean = false;

  socket: WebSocket;

  terminal: Terminal;

  componentDidMount() {
    this.mounted = true;
    resizeViewPort(1080, 730);
    this.connect();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const { retryAttempts, retryingConnection } = this.state;

    /*
     * If we have a new token, refresh the webosocket connection
     * and console with the new token
     */
    if (this.props.token !== prevProps.token) {
      this.socket.close();
      this.terminal.destroy();
    }

    /*
     * If our connection failed, and we did not surpass the max number of
     * reconnection attempts, try to reconnect
     */
    if (prevState.retryAttempts !== retryAttempts && retryingConnection) {
      setTimeout(() => {
        /*
         * It's okay to disregard typescript checking here
         * because the parent component <Lish /> handles
         * the situation where refreshToken() returns undefined
         */
        this.props
          .refreshToken()!
          .then(() => this.connect())
          .catch(e => e);
      }, 3000);
    }
  }

  connect() {
    const { linode, token } = this.props;
    const { region } = linode;

    this.socket = new WebSocket(
      `${getLishSchemeAndHostname(region)}:8181/${token}/weblish`
    );

    this.socket.addEventListener('open', () => {
      if (!this.mounted) {
        return;
      }
      this.setState({ renderingLish: true }, () => this.renderTerminal());
    });
  }

  renderTerminal() {
    const { linode } = this.props;
    const { retryAttempts } = this.state;
    const { group, label } = linode;

    this.terminal = new Terminal({
      cols: 120,
      rows: 40,
      fontFamily: '"Ubuntu Mono", monospace, sans-serif'
    });

    this.terminal.on('data', (data: string) => this.socket.send(data));
    const terminalDiv = document.getElementById('terminal');
    this.terminal.open(terminalDiv as HTMLElement);

    this.terminal.writeln('\x1b[32mLinode Lish Console\x1b[m');

    this.socket.addEventListener('message', evt => {
      let data;

      /*
       * data is either going to be command line strings
       * or it's going to look like {type: 'error', reason: 'thing failed'}
       * the latter be JSON parsed and the other cannot
       */
      try {
        data = JSON.parse(evt.data);
      } catch {
        data = evt.data;
      }

      if (
        data.type &&
        data.type === 'error' &&
        data.reason.toLowerCase() === 'your session has expired.'
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
          retryingConnection: true,
          retryAttempts: retryAttempts + 1
        });
        return;
      }
      this.setState({
        retryingConnection: false,
        retryAttempts: 0
      });
      this.terminal.write(evt.data);
    });

    this.socket.addEventListener('close', () => {
      this.terminal.destroy();
      if (!this.mounted) {
        return;
      }

      this.setState({ renderingLish: false });
    });

    const linodeLabel = group ? `${group}/${label}` : label;
    window.document.title = `${linodeLabel} - Linode Lish Console`;
  }

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
    const { classes } = this.props;
    const { error, retryingConnection } = this.state;

    if (error) {
      return this.renderErrorState();
    }

    /*
     * The loading states have to render with the terminal div because
     * the messages from the websocket connection are sent during this loading period,
     * and if you're rendering a loading state, then get a message from websockets,
     * then render the terminal div, you end up with a blank black screen
     */
    return (
      <React.Fragment>
        {this.socket && this.socket.readyState === this.socket.OPEN ? (
          <div id="terminal" className="terminal" />
        ) : !retryingConnection ? ( // basically are we switching tabs after the lish token expired?
          <CircleProgress className={classes.progress} noInner />
        ) : (
          this.renderRetryState()
        )}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(withRouter(Weblish));
