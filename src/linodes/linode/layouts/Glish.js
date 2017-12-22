import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { VncDisplay } from 'react-vnc-display';

import { ZONES } from '~/constants';
import { lishToken } from '~/api/ad-hoc/linodes';
import { getObjectByLabelLazily } from '~/api/util';

export class Glish extends Component {
  constructor(props) {
    super(props);
    this.state = {
      linode: null,
      session: null,
      state: 'warn',
      message: 'Connecting',
    };
  }

  async componentDidMount() {
    const { dispatch, params: { linodeLabel } } = this.props;

    const linode = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
    this.setState({ linode: linode });

    const session = await dispatch(lishToken(linode.id));
    this.setState({ session: session.lish_token });

    this.monitor_url = `wss://${this.host}:8080/${this.session}/monitor`;
    this.monitor = new WebSocket(this.monitor_url);
    this.monitor.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);
      console.log(data);
    });
  }

  onUpdateState = (rfb, newState, oldState, message) => {
    console.log('onUpdateState', newState, oldState, message);

    const valid = ['failed', 'fatal', 'normal', 'disconnected', 'loaded'];

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
  }

  render() {
    const { state, message, session, linode } = this.state;
    const region = linode && ZONES[linode.region];
    return (
      <div>
        <GlishStatus state={state} message={message} />
        <div className="text-center">
          {session && region &&
            <VncDisplay
              url={`wss://${region}.webconsole.linode.com:8080/${session}`}
              onUpdateState={this.onUpdateState}
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
      State is {props.state}; Message is {props.message}<br />
      <button onClick={props.reload}>Reconnect &#x27f3;</button>
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