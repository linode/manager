import { CircleProgress, ErrorState } from '@linode/ui';
import { Terminal } from '@xterm/xterm';
import * as React from 'react';

import {
  ParsePotentialLishErrorString,
  RetryLimiter,
} from 'src/features/Lish/Lish';

import type { LinodeLishData } from '@linode/api-v4/lib/linodes';
import type { Linode } from '@linode/api-v4/lib/linodes';
import type {
  LishErrorInterface,
  RetryLimiterInterface,
} from 'src/features/Lish/Lish';

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
  lastMessage: string = '';
  mounted: boolean = false;
  retryLimiter: RetryLimiterInterface = RetryLimiter(3, 60000);
  socket: null | WebSocket;

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
    this.setState({ error: '' });

    this.socket.addEventListener('open', () => {
      if (!this.mounted) {
        return;
      }
      this.setState({ renderingLish: true }, () =>
        this.renderTerminal(origSocket)
      );
    });

    this.socket.addEventListener('close', (evt) => {
      /* If this event is not for the currently active socket, just
       * ignore it. */
      if (this.socket !== origSocket) {
        return;
      }
      this.socket = null;
      this.terminal?.dispose();
      this.setState({ renderingLish: false });
      /* If the control has been unmounted, the cleanup above is
       * sufficient. */
      if (!this.mounted) {
        return;
      }

      const parsed: LishErrorInterface | null =
        ParsePotentialLishErrorString(evt?.reason) ||
        ParsePotentialLishErrorString(this.lastMessage);

      if (!this.retryLimiter.retryAllowed()) {
        this.setState({
          error: parsed?.formatted || 'Unexpected WebSocket close',
        });
        return;
      }
      if (parsed?.isExpired) {
        const { refreshToken } = this.props;
        refreshToken();
        return;
      }
      this.connect();
    });
  }

  render() {
    const { error } = this.state;

    if (error) {
      const actionButtonProps = {
        onClick: () => {
          this.retryLimiter.reset();
          this.props.refreshToken();
        },
        text: 'Retry Connection',
      };
      return (
        <ErrorState
          actionButtonProps={actionButtonProps}
          errorText={error}
          typographySx={(theme) => ({ color: theme.palette.common.white })}
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
            className="terminal"
            id="terminal"
            style={{
              height: 'calc(100vh - 50px)',
              padding: 8,
            }}
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

    const socket: null | WebSocket = this.socket;
    if (socket === null || socket !== origSocket) {
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
