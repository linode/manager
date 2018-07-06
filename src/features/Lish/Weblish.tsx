import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Terminal } from 'xterm';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import CircleProgress from 'src/components/CircleProgress';
import { getLinode, getLinodeLishToken } from 'src/services/linodes';

import { getLishSchemeAndHostname, resizeViewPort } from '.';

type ClassNames = 'progress';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  progress: {
    height: 'auto',
  },
});

interface State {
  token: string;
  renderingLish: boolean;
  linode?: Linode.Linode;
}

type CombinedProps = WithStyles<ClassNames> & RouteComponentProps<{ linodeId?: number }>;

export class Weblish extends React.Component<CombinedProps, State> {
  state: State = {
    token: '',
    renderingLish: true,
  };

  mounted: boolean = false;

  socket: WebSocket;

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
    resizeViewPort(1080, 730);
    this.getLinode();
  }

  componentWillUnmount() {
    this.mounted = false;
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
        this.socket = new WebSocket(
          `${getLishSchemeAndHostname(region)}:8181/${token}/weblish`);
        this.socket.addEventListener('open', () =>
          this.setState({ renderingLish: true }, () => this.renderTerminal()));
      });
  }

  renderTerminal() {
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

    terminal.on('data', (data: string) => this.socket.send(data));
    const terminalDiv = document.getElementById('terminal');
    terminal.open(terminalDiv as HTMLElement);

    terminal.writeln('\x1b[32mLinode Lish Console\x1b[m');

    this.socket.addEventListener('message', evt => terminal.write(evt.data));

    this.socket.addEventListener('close', () => {
      terminal.destroy();
      this.setState({ renderingLish: false });
    });

    const linodeLabel = group ? `${group}/${label}` : label;
    window.document.title = `${linodeLabel} - Linode Lish Console`;
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        {this.socket && (this.socket.readyState === this.socket.OPEN)
          ? <div id="terminal" className="terminal" />
          : <CircleProgress className={classes.progress} noInner/>
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(withRouter(Weblish));
