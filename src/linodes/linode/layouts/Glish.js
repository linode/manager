import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { VncDisplay } from 'react-vnc-display';

import { ZONES, LISH_ROOT } from '~/constants';
import { lishToken } from '~/api/ad-hoc/linodes';
import { getObjectByLabelLazily } from '~/api/util';

export class Glish extends Component {
  constructor(props) {
    super(props);
    this.state = {
      linode: null,
      token: null,
      powered: false,
      vncState: 'warn',
      vncMessage: 'Connecting',
      linodeMessage: undefined,
    };
  }

  async componentDidMount() {
    const { dispatch, params: { linodeLabel } } = this.props;

    const linode = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
    const region = linode && ZONES[linode.region];
    this.setState({ linode: linode });

    const { lish_token: token } = await dispatch(lishToken(linode.id));
    this.setState({ token: token });

    this.monitor_url = `wss://${region}.${LISH_ROOT}:8080/${token}/monitor`;
    this.monitor = new WebSocket(this.monitor_url);
    this.monitor.addEventListener('message', this.onUpdateLinodeMessage);
  }

  onUpdateLinodeMessage = (e) => {
    const data = JSON.parse(e.data);
    console.log('monitor: ', data);
    switch (data.type) {
      case 'status':
        if (data.poweredStatus === 'Running') {
          this.setState({ powered: true });
          this.setState({ linodeMessage: 'Your Linode is powered on' });
        } else {
          this.setState({ powered: false });
          this.setState({ linodeMessage: 'Your Linode is powered off' });
        }
        break;
      case 'error':
        this.setState({ powered: false });
        this.setState({ linodeMessage: data.reason });
        break;
      default:
        break;
    }
  }

  onUpdateVNCState = (rfb, newState, oldState, vncMessage) => {
    const valid = ['failed', 'fatal', 'normal', 'disconnected', 'loaded'];

    if (valid.indexOf(newState) !== -1) {
      this.setState({ vncState: newState });
    } else {
      this.setState({ vncState: 'warn' });
    }

    if (newState === 'disconnected') {
      this.setState({ vncMessage: 'Disconnected' });
    } else if (vncMessage) {
      this.setState({ vncMessage });
    }

    console.log('onUpdateVNCState', newState, oldState, vncMessage);
  }

  render() {
    const { vncState, vncMessage, linodeMessage, powered, token, linode } = this.state;
    const region = linode && ZONES[linode.region];
    return (
      <div>
        <GlishStatus vncState={vncState} vncMessage={vncMessage} linodeMessage={linodeMessage} />
        <div className="text-center">
          {powered && token && region &&
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

export function GlishStatus(props) {
  return (
    <div id="glish-warning">
      VNC State: {props.vncState}<br />
      VNC Message: {props.vncMessage}<br />
      Linode Message: {props.linodeMessage}<br />
      <button onClick={props.reload}>Reconnect &#x27f3;</button>
    </div>
  );
}

GlishStatus.propTypes = {
  reload: PropTypes.func.isRequired,
  vncState: PropTypes.string.isRequired,
  vncMessage: PropTypes.string.isRequired,
  linodeMessage: PropTypes.string.isRequired,
};
