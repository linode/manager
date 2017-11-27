import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { VncDisplay } from 'react-vnc-display';

import { ZONES } from '~/constants';
import { lishToken } from '~/api/generic/linodes';
import { getObjectByLabelLazily } from '~/api/util';

import { addJSScript } from './Weblish';


export class Glish extends Component {
  constructor(props) {
    super(props);
    this.state = { state: 'warn', message: 'Connecting' };
    this.session = '';
    this.host = '';
  }

  componentDidMount() {
    this.refresh_timer = setInterval(this.renew, 1000 * 60);
  }

  componentWillUnmount() {
    clearInterval(this.refresh_timer);
  }

  onload = async () => {
    const { dispatch, params: { linodeLabel } } = this.props;
    const { id, region } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
    const { lish_token: session } = await dispatch(lishToken(id));

    this.session = session;
    this.host = `${ZONES[region.id]}.webconsole.linode.com`;

    this.rfb = new RFB({
      target: this.refs.canvas,
      encrypt: true,
      repeaterID: '',
      true_color: true,
      local_cursor: true,
      shared: true,
      view_only: false,
      onUpdateState: this.onUpdateState,
    });

    this.monitor_url = `wss://${this.host}:8080/${this.session}/monitor`;
    this.monitor = new WebSocket(this.monitor_url);

    this.monitor.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);
      console.log('message received', data);
      if (data.poweredStatus === 'Running') {
        this.connect();
      }
    });


    this.connect();
  }

  onUpdateState = (rfb, newState, oldState, message) => {
    // const valid = ["normal", "loaded"];
    const valid = ['failed', 'fatal', 'normal', 'disconnected', 'loaded'];
    // "connect",
    if (valid.indexOf(newState) !== -1) {
      this.setState({ state: newState });
    } else {
      this.setState({ state: 'warn' });
    }

    if (newState === 'disconnected') {
      this.setState({ message: 'Disconnected' });
    } else if (message) {
      this.setState({ message });
    }

    console.log('onUpdateStatus', newState, oldState, message);
    /* switch (newState) {
     *   case 'ProtocolVersion':
     *     setTimeout(this.connect, 3000);
     * }*/
  }

  renew = () => {
    if (this.monitor.readyState === 1) {
      this.monitor.send(JSON.stringify({ action: 'renew' }));
    }
  }

  connect = () => {
    this.rfb.connect(this.host, 8080, '', this.session);
  }

  render() {
    console.log('Render', this.state.state, this.state.message);
    return (
      <div>
        <GlishStatus
          {...this.state.state}
          {...this.state.message}
          {...this.host}
          {...this.session}
          reload={this.connect.bind(this)}
        />
        <VncDisplay url="wss://some-remote-display:5991/path" />
          <canvas ref="canvas" style={{ width: '1024px', height: '655px' }}>
            Canvas not supported.
          </canvas>
      </div>
    );
  }
}

Glish.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string.isRequired,
  }).isRequired,
};

export function GlishStatus(props) {
  return (
    <div id="glish-warning" style={{ color: 'black', background: 'red' }}>
      State is {props.state}; Message is {props.message}<br/>
      Host is {props.host}; Session is {props.session}<br/>
      <button onClick={this.props.reload}>Reconnect &#x27f3;</button>
    </div>
  );
}

GlishStatus.propTypes = {
  reload: PropTypes.func.isRequired,
  state: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  host: PropTypes.string.isRequired,
  session: PropTypes.string.isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default withRouter(connect(select)(Glish));
