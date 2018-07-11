import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Terminal } from 'xterm';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import CircleProgress from 'src/components/CircleProgress';

import { getLishSchemeAndHostname, resizeViewPort } from '.';

type ClassNames = 'progress';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  progress: {
    height: 'auto',
  },
});

interface Props {
  linode: Linode.Linode;
  token: string;
}

interface State {
  renderingLish: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{ linodeId?: number }>;

export class Weblish extends React.Component<CombinedProps, State> {
  state: State = {
    renderingLish: true,
  };

  mounted: boolean = false;

  socket: WebSocket;

  componentDidMount() {
    this.mounted = true;
    resizeViewPort(1080, 730);
    this.connect();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  connect() {
    const { linode, token } = this.props;
    const { region } = linode;

    this.socket = new WebSocket(
      `${getLishSchemeAndHostname(region)}:8181/${token}/weblish`);
    this.socket.addEventListener('open', () => {
      if (!this.mounted) { return; }
      this.setState(
        { renderingLish: true },
        () => this.renderTerminal()
      );
    });
  }

  renderTerminal() {
    const { linode } = this.props;
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
      if (!this.mounted) { return; }
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
