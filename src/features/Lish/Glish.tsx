import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';

import { getLishSchemeAndHostname, resizeViewPort } from '.';
import VncDisplay from './VncDisplay';

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

interface Props {
  linode: Linode.Linode;
  token: string;
}

interface State {
  activeVnc: boolean;
  connected: boolean;
  powered: boolean;
  /* used to prevent flickering of the progress indicator */
  initialConnect: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{ linodeId?: number }>;

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
  
  componentDidMount() {
    this.mounted = true;
    const { linode, token } = this.props;

    resizeViewPort(1080, 840);

    const region = (linode as Linode.Linode).region;
    this.refreshMonitor(region, token as string);
    this.renewVncToken();
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
    const { classes, linode, token } = this.props;
    const { activeVnc, initialConnect, powered } = this.state;
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
