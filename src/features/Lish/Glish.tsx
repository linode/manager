import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { VncDisplay } from 'react-vnc-display';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import { LISH_ROOT, ZONES } from 'src/constants';
import { getLinode, getLinodeLishToken } from 'src/services/linodes';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {}

interface State {
  linode?: Linode.Linode;
  token?: string;
  activeVnc: boolean;
  connected: boolean;
  powered: boolean
}

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{ linodeId?: number }>;

class Glish extends React.Component<CombinedProps, State> {
  state = {
    activeVnc: true,
    connected: false,
    powered: true,
  };

  mounted: boolean = false;
  lastDisconnect: number = Date.now();

  monitorInterval: number;
  renewInterval: number;
  
  getLinodeData = () => {
    const { match: { params: { linodeId } } } = this.props;

    if (!linodeId) { throw new Error('No Linode ID'); }

    return getLinode(linodeId)
      .then((response) => {
        if (!this.mounted) {
          throw new Error('Component not mounted');
        }
        const { data: linode } = response;
        this.setState({ linode });
        return linode;
      })
      .catch(() => {
        if (!this.mounted) {
          throw new Error('Component not mounted');
        }
      });
  }

  getLishToken = () => {
    const { match: { params: { linodeId } } } = this.props;
    
    if (!linodeId) { throw new Error('No Linode ID'); }
    
    return getLinodeLishToken(linodeId)
      .then((response) => {
        if (!this.mounted) {
          throw new Error('Component not mounted');
        }
        const { data: { lish_token: token } } = response;
        this.setState({ token });
        return token;
      })
      .catch(() => {
        if (!this.mounted) {
          throw new Error('Component not mounted');
        }
      });
  }
  
  componentDidMount() {
    this.mounted = true;

    this.getLinodeData()
      .then((linode) => {
        return this.getLishToken()
          .then((token) => {
            return [linode, token];
          })
          .catch(() => {
            throw new Error('Uncaught error in getLishToken');
          });
      })
      .then(([linode, token]) => {
        const region = linode && ZONES[(linode as Linode.Linode).region];
        this.refreshMonitor(region, token);
        this.renewVncToken();
      })
      .catch(() => {
        if (!this.mounted) { return; }
        this.setState({ activeVnc: false });
      });
  }

  componentWillUnmount() {
    clearInterval(this.monitorInterval);
    clearInterval(this.renewInterval);
    if (this.monitor) {
      this.monitor.close();
    }
  }
  
  onUpdateVNCState = (rfb: any, newState: string) => {
    switch (newState) {
      case 'normal':
        this.setState({ connected: true });
        break;
      case 'disconnected':
      case 'failed':
      case 'fatal':
        this.setState({
          connected: false,
          activeVnc: false
        });
        setTimeout(() => this.setState({ activeVnc: true }), 3000);
        break;
      default:
        break;
    }
  }
  
  linodeOnClick = (linodeID: number) => {
    window.opener.location = `/linodes/${linodeID}`;
  }
  
  linodeAnchor = (linodeID: number, linodeLabel: string) => {
    return (
      <a
        className="force-link text-muted"
        onClick={() => this.linodeOnClick(linodeID)}
      >
        {linodeLabel}
      </a>
    );
  }

  render() {
    return (
      <div>Hello Glish</div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(withRouter(Glish));
