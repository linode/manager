/* eslint-disable scanjs-rules/call_addEventListener */
import * as React from 'react';
import ErrorState from 'src/components/ErrorState';
import CircleProgress from 'src/components/CircleProgress';
import { Linode } from '@linode/api-v4/lib/linodes';
import { Terminal } from 'xterm';
import { getLishSchemeAndHostname, resizeViewPort } from './lishUtils';
import {
  createStyles,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';

type ClassNames = 'errorState';

const styles = () =>
  createStyles({
    errorState: {
      '& *': {
        color: '#f4f4f4 !important',
      },
    },
  });

interface Props {
  linode: Linode;
  token: string;
  refreshToken: () => Promise<void>;
}

interface State {
  renderingLish: boolean;
  error: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class Weblish extends React.Component<CombinedProps, State> {
  state: State = {
    renderingLish: true,
    error: '',
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

  componentDidUpdate(prevProps: CombinedProps) {
    /*
     * If we have a new token, refresh the webosocket connection
     * and console with the new token
     */
    if (this.props.token !== prevProps.token) {
      this.socket.close();
      this.terminal.dispose();
      this.connect();
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
    const { linode, refreshToken } = this.props;
    const { group, label } = linode;

    this.terminal = new Terminal({
      cols: 120,
      rows: 40,
      fontFamily: '"Ubuntu Mono", monospace, sans-serif',
      screenReaderMode: true,
    });

    this.terminal.onData((data: string) => this.socket.send(data));
    const terminalDiv = document.getElementById('terminal');
    this.terminal.open(terminalDiv as HTMLElement);

    this.terminal.writeln('\x1b[32mLinode Lish Console\x1b[m');

    this.socket.addEventListener('message', (evt) => {
      let data;

      /*
       * data is either going to be command line strings
       * or it's going to look like {type: 'error', reason: 'thing failed'}
       * the latter can be JSON parsed and the other cannot
       */
      try {
        data = JSON.parse(evt.data);
      } catch {
        data = evt.data;
      }

      if (
        data?.type === 'error' &&
        data?.reason?.toLowerCase() === 'your session has expired.'
      ) {
        refreshToken();
        return;
      }

      try {
        this.terminal.write(evt.data);
      } catch {
        /**
         * We've most likely hit a data flow limit.
         * This is fine and won't break anything. However,
         * by reloading the page, we can bring the window back
         * in sync with the screen session that Weblish is connecting
         * to.
         */

        window.location.reload();
      }
    });

    this.socket.addEventListener('close', () => {
      this.terminal.dispose();
      if (!this.mounted) {
        return;
      }

      this.setState({ renderingLish: false });
    });

    const linodeLabel = group ? `${group}/${label}` : label;
    window.document.title = `${linodeLabel} - Linode Lish Console`;
  }

  render() {
    const { error } = this.state;
    const { classes } = this.props;

    if (error) {
      return (
        <div className={classes.errorState}>
          <ErrorState errorText={error} />
        </div>
      );
    }

    /*
     * The loading states have to render with the terminal div because
     * the messages from the websocket connection are sent during this loading period,
     * and if you're rendering a loading state, then get a message from websockets,
     * then render the terminal div, you end up with a blank black screen
     */
    return (
      <div>
        {this.socket && this.socket.readyState === this.socket.OPEN ? (
          <div id="terminal" className="terminal" />
        ) : (
          <CircleProgress />
        )}
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(Weblish);
