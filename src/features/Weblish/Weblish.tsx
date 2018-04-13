import * as React from 'react';
import Axios from 'axios';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Terminal } from 'xterm';

import { ZONES, LISH_ROOT, API_ROOT } from 'src/constants';

import 'typeface-ubuntu-mono';

export function weblishLaunch(linodeId: string) {
  window.open(
    `${window.location.protocol}//${window.location.host}/linodes/${linodeId}/weblish`,
    `weblish_con_${linodeId}`,
    'left=100,top=100,width=1024,height=640,toolbar=0,resizable=1',
  );
}

interface Props {
}

interface State {
  token: string;
  renderingLish: boolean;
  linode?: Linode.Linode;
}

type CombinedProps = Props & RouteComponentProps<{ linodeId?: number }>;

export class Weblish extends React.Component<CombinedProps, State> {
  state: State = {
    token: '',
    renderingLish: true,
  };

  getLinode() {
    const { match: { params: { linodeId } } } = this.props;
    Axios.get(`${API_ROOT}/linode/instances/${linodeId}`)
      .then((response) => {
        const { data: linode } = response;
        this.setState({ linode }, this.connect);
      })
      .catch(() => {
        this.setState({ renderingLish: false });
      });
  }

  componentWillMount() {
    const webLishCss = import('' + '../../assets/weblish/weblish.css');
    const xtermCss = import('' + '../../assets/weblish/xterm.css');
    Promise.all([webLishCss, xtermCss])
      .then(() => this.getLinode());
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

    Axios.post(`${API_ROOT}/linode/instances/${id}/lish_token`)
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
      fontFamily: '"Ubuntu Mono", "PT Mono", sans-serif',
    });

    terminal.on('data', (data: string) => socket.send(data));
    terminal.open(document.getElementById('root') as HTMLElement);

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
    return this.state.renderingLish ? null : (
      <div>
        <div id="disconnected">
          <h2>Connection Lost</h2>
          {this.state.linode === undefined
            ? <p>Data for this Linode is unavailble.</p>
            : <p>Lish appears to be temporarily unavailable.</p>
          }
          {this.state.linode !== undefined &&
            <button onClick={() => this.connect()}>Reconnect &#x27f3;</button>
          }
        </div>
      </div>
    );
  }
}

export default withRouter(Weblish);
