import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Terminal } from 'xterm';

import { LISH_ROOT, ZONES } from 'src/constants';
import { getLinode, getLinodeLishToken } from 'src/services/linodes';

interface State {
  token: string;
  renderingLish: boolean;
  linode?: Linode.Linode;
}

type CombinedProps = RouteComponentProps<{ linodeId?: number }>;

export class Weblish extends React.Component<CombinedProps, State> {
  state: State = {
    token: '',
    renderingLish: true,
  };

  mounted: boolean = false;

  getLinode = () => {
    const { match: { params: { linodeId } } } = this.props;

    if (!linodeId) { return; }

    getLinode(linodeId)
      .then((response) => {
        if (!this.mounted) { return; }
        const { data: linode } = response;
        this.setState({ linode }, this.connect);
      })
      .catch(() => {
        if (!this.mounted) { return; }
        this.setState({ renderingLish: false });
      });
  }

  componentDidMount() {
    this.mounted = true;
    this.getLinode();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getLishSchemeAndHostname(region: string): string {
    if (LISH_ROOT.includes('alpha')) {
      /* Note: This is only the case for pre-production environments! */
      return `wss://${LISH_ROOT}`;
    }
    return `wss://${ZONES[region]}.${LISH_ROOT}`;
  }

  connect() {
    const { linode } = this.state;
    if (linode === undefined) {
      throw new Error('No Linode data before attempting to connect to Weblish.');
    }

    const { id, region } = linode;

    getLinodeLishToken(id)
      .then((response) => {
        const { data: { lish_token: token } } = response;
        this.setState({ token });
        const socket = new WebSocket(
          `${this.getLishSchemeAndHostname(region)}:8181/${token}/weblish`);
        socket.addEventListener('open', () =>
          this.setState({ renderingLish: true }, () => this.renderTerminal(socket)));
      });
  }

  renderTerminal(socket: WebSocket) {
    const { linode } = this.state;
    if (linode === undefined) {
      throw new Error('No Linode data before attempting to render Weblish.');
    }

    const { group, label } = linode;

    const terminal = new Terminal({
      cols: 120,
      rows: 40,
      fontFamily: '"Ubuntu Mono", monospace, sans-serif',
    });

    terminal.on('data', (data: string) => socket.send(data));
    const terminalDiv = document.getElementById('terminal');
    terminal.open(terminalDiv as HTMLElement);

    terminal.writeln('\x1b[32mLinode Lish Console\x1b[m');

    socket.addEventListener('message', evt => terminal.write(evt.data));

    socket.addEventListener('close', () => {
      terminal.destroy();
      this.setState({ renderingLish: false });
    });

    const linodeLabel = group ? `${group}/${label}` : label;
    window.document.title = `${linodeLabel} - Linode Lish Console`;
  }

  render() {
    return <React.Fragment>
      <div id="terminal" className="terminal" />
      {!this.state.renderingLish &&
        <div>
          <div id="disconnected">
            <h2>Connection Lost</h2>
            {this.state.linode === undefined
              ? <p>Data for this Linode is unavailble.</p>
              : <p>Lish appears to be temporarily unavailable.</p>
            }
            {this.state.linode !== undefined &&
              <button onClick={this.connect}>Reconnect &#x27f3;</button>
            }
          </div>
        </div>
      }
    </React.Fragment>;
  }
}

export default withRouter(Weblish);
