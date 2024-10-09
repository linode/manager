/* eslint-disable scanjs-rules/call_addEventListener */
import { Terminal } from '@xterm/xterm';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { formatError, RetryLimiter } from 'src/features/Lish/Lish';

import type { Linode } from '@linode/api-v4/lib/linodes';
import type { LinodeLishData } from '@linode/api-v4/lib/linodes';

interface Props extends Pick<LinodeLishData, 'weblish_url' | 'ws_protocols'> {
  linode: Linode;
  refreshToken: () => Promise<void>;
}

interface State {
  error: string;
  renderingLish: boolean;
  setFocus: boolean;
}

export class Weblish extends React.Component<Props, State> {
  mounted: boolean = false;
  socket: WebSocket | null;
  retryLimiter: RetryLimiter = new RetryLimiter(3, 60000);
  lastMessage: string = '';

  state: State = {
    error: '',
    renderingLish: true,
    setFocus: false,
  };
  terminal: Terminal;

  componentDidMount() {
    this.mounted = true;
    this.connect();
  }

  componentDidUpdate(prevProps: Props) {
    /*
     * If we have a new token, refresh the websocket connection
     * and console with the new token
     */
    if (
      this.props.weblish_url !== prevProps.weblish_url ||
      JSON.stringify(this.props.ws_protocols) !==
        JSON.stringify(prevProps.ws_protocols)
    ) {
      this.socket?.close();
      this.terminal?.dispose();
      this.setState({ renderingLish: false });
      this.connect();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  connect() {
    const { weblish_url, ws_protocols } = this.props;

    /* When this.socket != origSocket, the socket from this connect()
     * call has been closed and possibly replaced by a new socket. */
    const origSocket = new WebSocket(weblish_url, ws_protocols);
    this.socket = origSocket;

    this.lastMessage = '';
    this.setState({error: ''});

    this.socket.addEventListener('open', () => {
      if (!this.mounted) {
        return;
      }
      this.setState({ renderingLish: true }, () => this.renderTerminal(origSocket));
    });

    this.socket.addEventListener('close', (evt) => {
      if (this.socket != origSocket) {
        return;
      }
      this.socket = null;
      this.terminal?.dispose();
      this.setState({ renderingLish: false });
      if (!this.mounted) {
        return;
      }

      let parsed = null;
      if (evt?.reason) {
        try {
          parsed = JSON.parse(evt.reason);
        } catch {
        }
      }
      if (parsed === null) {
        try {
          parsed = JSON.parse(this.lastMessage);
        } catch {
        }
      }

      if (this.retryLimiter.retryAllowed()) {
        if (parsed?.errors?.[0]?.reason === "expired" ||
            (parsed?.type === "error" &&
             typeof parsed?.reason === "string" &&
             parsed?.reason.toLowerCase() === "your session has expired.")) {
          const { refreshToken } = this.props;
          refreshToken();
        } else {
          this.connect();
        }
      } else {
        this.setState({error: formatError(parsed, "Unexpected WebSocket close")});
      }
    });
  }

  render() {
    const { error } = this.state;

    if (error) {
      const actionButton = {
        text: 'Retry Connection',
        onClick: ()=>{
          this.retryLimiter.reset();
          this.props.refreshToken();
        }
      };
      return (
        <ErrorState
          errorText={error}
          typographySx={(theme) => ({ color: theme.palette.common.white })}
          actionButton={actionButton}
        />
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
          <div
            style={{
              height: 'calc(100vh - 50px)',
              padding: 8,
            }}
            className="terminal"
            id="terminal"
          />
        ) : (
          <CircleProgress />
        )}
      </div>
    );
  }

  renderTerminal(origSocket: WebSocket) {
    const { linode } = this.props;
    const { group, label } = linode;

    if (this.socket === null) {
      return;
    }
    const socket: WebSocket = this.socket;

    if (socket != origSocket) {
      return;
    }

    /* The socket might have already started to fail by the time we
     * get here. Leave handling for the close handler. */
    if (socket.readyState !== socket.OPEN) {
      return;
    }

    this.terminal = new Terminal({
      cols: 80,
      cursorBlink: true,
      fontFamily: '"Ubuntu Mono", monospace, sans-serif',
      rows: 40,
      screenReaderMode: true,
    });

    this.setState({ setFocus: true }, () => this.terminal.focus());

    this.terminal.onData((data: string) => socket.send(data));
    const terminalDiv = document.getElementById('terminal');
    this.terminal.open(terminalDiv as HTMLElement);

    this.terminal.writeln('\x1b[32mLinode Lish Console\x1b[m');

    socket.addEventListener('message', (evt) => {
      /*
       * data is either going to be command line strings
       * or it's going to look like {type: 'error', reason: 'thing failed'}
       *
       * The actual handling of errors will be done in the 'close'
       * handler. Allow the error to be rendered in the terminal in
       * case it is actually valid session content that is not
       * then followed by a 'close' message.
       */
      this.lastMessage = evt.data;

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

    const linodeLabel = group ? `${group}/${label}` : label;
    window.document.title = `${linodeLabel} - Linode Lish Console`;
  }
}

export default Weblish;
