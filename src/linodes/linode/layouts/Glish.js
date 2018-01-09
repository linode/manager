import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { VncDisplay } from 'react-vnc-display';
import { compose } from 'redux';

import { ZONES, LISH_ROOT } from '~/constants';
import { lishToken } from '~/api/ad-hoc/linodes';
import { getObjectByLabelLazily } from '~/api/util';

import GlishControls from '~/linodes/linode/components/GlishControls';

export class Glish extends Component {
  constructor(props) {
    super(props);
    this.state = {
      linode: null,
      token: null,
      activeVnc: true,
      connected: false,
      powered: true,
    };
    this.lastDisconnect = Date.now();
  }

  async componentDidMount() {
    const { getCurrentLinode, getLishToken } = this.props;

    const linode = await getCurrentLinode();
    this.setState({ linode: linode });

    const { lish_token: token } = await getLishToken(linode.id);
    this.setState({ token: token });

    const region = linode && ZONES[linode.region];
    this.refreshMonitor(region, token);
    this.renewVncToken();
  }

  componentWillUnmount() {
    clearInterval(this.monitorInterval);
    clearInterval(this.renewInterval);
    if (this.monitor) {
      this.monitor.close();
    }
  }

  onUpdateVNCState = (rfb, newState) => {
    switch (newState) {
      case 'normal':
        this.setState({ connected: true });
        break;
      case 'disconnected':
      case 'failed':
      case 'fatal':
        this.setState({ connected: false });
        this.setState({ activeVnc: false });
        setTimeout(() => this.setState({ activeVnc: true }), 3000);
        break;
      default:
        break;
    }
  }

  renewVncToken = () => {
    // renew our VNC session every 5 minutes
    clearInterval(this.renewInterval);
    this.renewInterval = setInterval(() => {
      if (this.monitor) {
        this.monitor.send(JSON.stringify({ action: 'renew' }));
      }
    }, 5 * 60 * 1000);
  }

  refreshMonitor = (region, token) => {
    this.connectMonitor(region, token);
    /* Renew our monitor connection every 5 seconds.
       We do this because the monitor only sends us power info once, and we need
       to detect when a linode shuts down if it was powered-on to begin-with */
    clearInterval(this.monitorInterval);
    this.monitorInterval = setInterval(() => {
      if (this.monitor) {
        this.monitor.close();
      }
      this.connectMonitor(region, token);
    }, 5 * 1000);
  }

  connectMonitor = (region, token) => {
    const url = `wss://${region}.${LISH_ROOT}:8080/${token}/monitor`;
    this.monitor = new WebSocket(url);
    this.monitor.addEventListener('message', ev => {
      const data = JSON.parse(ev.data);
      if (data.poweredStatus === 'Running') {
        this.setState({ powered: true });
      } else {
        this.setState({ powered: false });
      }
    });
  }

  render() {
    const { linode, token, activeVnc, connected, powered } = this.state;

    const region = linode && ZONES[linode.region];

    let message = 'Connecting...';
    if (linode && powered === false) {
      message = `Linode ${linode.id} is powered off`;
    }
    if (linode && connected === true) {
      message = `Connected to Linode ${linode.id}`;
    }

    return (
      <div id="Glish" className="h-100">
        <GlishControls
          powered={powered}
          connected={connected}
          message={message}
          linodeId={linode && linode.id}
        />
        <div className="text-center">
          {activeVnc && token && region &&
            <VncDisplay
              url={`wss://${region}.${LISH_ROOT}:8080/${token}`}
              onUpdateState={this.onUpdateVNCState}
            />
          }
        </div>
      </div>
    );
  }
}

Glish.propTypes = {
  getCurrentLinode: PropTypes.func.isRequired,
  getLishToken: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string.isRequired,
  }).isRequired,
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { params: { linodeLabel } } = ownProps;
  return {
    getCurrentLinode: () => dispatch(getObjectByLabelLazily('linodes', linodeLabel)),
    getLishToken: (linodeId) => dispatch(lishToken(linodeId)),
  };
};

export default compose(
  connect(null, mapDispatchToProps),
  withRouter
)(Glish);
