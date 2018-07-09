import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { VncDisplay } from 'react-vnc-display';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import { getLinode, getLinodeLishToken } from 'src/services/linodes';

import { getLishSchemeAndHostname, resizeViewPort } from '.';

type ClassNames = 'container' | 'errorState';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  container: {
    '& canvas': {
      margin: 'auto',
      display: 'block',
    }
  },
  errorState: {
    '& *': {
      color: '#f4f4f4 !important',
    }
  }
});

interface State {
  linode?: Linode.Linode;
  token?: string;
  activeVnc: boolean;
  connected: boolean;
  powered: boolean;
  /* used to prevent flickering of the progress indicator */
  initialConnect: boolean;
}

type CombinedProps = WithStyles<ClassNames> & RouteComponentProps<{ linodeId?: number }>;

class Glish extends React.Component<CombinedProps, State> {
  state: State = {
    activeVnc: true,
    connected: false,
    powered: true,
    initialConnect: false,
  };

  mounted: boolean = false;
  lastDisconnect: number = Date.now();

  monitor: WebSocket;
  monitorInterval: number;
  renewInterval: number;
  
  getLinodeData = () => {
    const { match: { params: { linodeId } } } = this.props;

    if (!linodeId) { throw new Error('No Linode ID'); }

    return getLinode(linodeId)
      .then((response) => {
        const { data: linode } = response;
        if (!this.mounted) { throw new Error('Component not mounted'); }
        this.setState({ linode });
        return linode;
      })
      .catch(() => {
        throw new Error('Uncaught Error in getLinodeData');
      });
  }

  getLishToken = () => {
    const { match: { params: { linodeId } } } = this.props;
    
    if (!linodeId) { throw new Error('No Linode ID'); }
    
    return getLinodeLishToken(linodeId)
      .then((response) => {
        const { data: { lish_token: token } } = response;
        if (!this.mounted) { throw new Error('Component not mounted'); }
        this.setState({ token });
        return token;
      })
      .catch(() => {
        throw new Error('Uncaught Error in getLishToken');
      });
  }
  
  componentDidMount() {
    this.mounted = true;

    resizeViewPort(1080, 840);

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
        const region = (linode as Linode.Linode).region;
        this.refreshMonitor(region, token as string);
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
    this.mounted = false;
  }
  
  onUpdateVNCState = (rfb: any, newState: string) => {
    switch (newState) {
      case 'normal':
        if (!this.mounted) { return; }
        this.setState({ 
          connected: true,
          initialConnect: true,
        });
        break;
      case 'disconnected':
      case 'failed':
      case 'fatal':
        if (!this.mounted) { return; }
        this.setState({
          connected: false,
          activeVnc: false
        });
        setTimeout(() => {
          if (!this.mounted) { return; }
          this.setState({ activeVnc: true });
        }, 3000);
        break;
      default:
        break;
    }
  }
  
  linodeOnClick = (linodeID: number) => () => {
    window.opener.location = `/linodes/${linodeID}`;
  }
  
  linodeAnchor = (linodeID: number, linodeLabel: string) => {
    return (
      <a
        className="force-link text-muted"
        onClick={this.linodeOnClick(linodeID)}
      >
        {linodeLabel}
      </a>
    );
  }

  renewVncToken = () => {
    // renew our VNC session every 5 minutes
    clearInterval(this.renewInterval);
    this.renewInterval = window.setInterval(() => {
      if (this.monitor.readyState === this.monitor.OPEN) {
        this.monitor.send(JSON.stringify({ action: 'renew' }));
      }
    }, 5 * 60 * 1000);
  }
  
  refreshMonitor = (region: string, token: string) => {
    this.connectMonitor(region, token);
    /* Renew our monitor connection every 5 seconds.
       We do this because the monitor only sends us power info once, and we need
       to detect when a linode shuts down if it was powered-on to begin-with */
    clearInterval(this.monitorInterval);
    this.monitorInterval = window.setInterval(() => {
      if (this.monitor) {
        this.monitor.close();
      }
      this.connectMonitor(region, token);
    }, 5 * 1000);
  }

  connectMonitor = (region: string, token: string) => {
    const url = `${getLishSchemeAndHostname(region)}:8080/${token}/monitor`;
    this.monitor = new WebSocket(url);
    this.monitor.addEventListener('message', ev => {
      const data = JSON.parse(ev.data);
      if (data.poweredStatus === 'Running') {
        if (!this.mounted) { return; }
        this.setState({ powered: true });
      } else if (data.poweredStatus === 'Powered Off') {
        if (!this.mounted) { return; }
        this.setState({ powered: false });
      }
    });
  }

  render() {
    const { classes } = this.props;
    const { linode, token, activeVnc, initialConnect, powered } = this.state;
    const region = linode && (linode as Linode.Linode).region;

    return (
      <div id="Glish">
        {!powered &&
          <div className={classes.errorState}>
            <ErrorState errorText="Please power on your Linode to use Glish" />
          </div>
        }

        {(powered && !initialConnect) &&
          <CircleProgress noInner/>
        }

        {(powered &&activeVnc && token && region) &&
          <div
            className={classes.container}
            style={!initialConnect ? { display: 'none' } : {}}
          >
            <VncDisplay
              url={`${getLishSchemeAndHostname(region)}:8080/${token}`}
              onUpdateState={this.onUpdateVNCState}
            />
          </div>
        }
      </div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(withRouter(Glish));
