import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { VncDisplay } from 'react-vnc-display';

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
    const { dispatch, params: { linodeLabel } } = this.props;

    const linode = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
    this.setState({ linode: linode });

    const { lish_token: token } = await dispatch(lishToken(linode.id));
    this.setState({ token: token });
    this.refreshVNCSession(linode.id);

    const region = linode && ZONES[linode.region];
    this.connectMonitor(region, token);
  }

  componentWillUnmount() {
    clearTimeout(this.refreshTimeout);
    this.monitor.close();
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

  refreshVNCSession = (linodeId) => {
    this.refreshTimeout = setTimeout(async () => {
      const { lish_token: token } = await this.props.dispatch(lishToken(linodeId));
      this.setState({ token: token });
      this.refreshVNCSession(linodeId); // refresh our VNC session every 5 minutes
    }, 5 * 60 * 1000);
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
    const {
      linode,
      token,
      activeVnc,
      connected,
      powered,
    } = this.state;

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
        <GlishControls powered={powered} connected={connected} message={message} />
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
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string.isRequired,
  }).isRequired,
};

export default withRouter(connect()(Glish));
