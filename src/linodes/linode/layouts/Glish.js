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
      powered: true,
      vncState: 'warn',
      message: '',
    };
    this.lastDisconnect = Date.now();
  }

  async componentDidMount() {
    const { dispatch, params: { linodeLabel } } = this.props;

    const linode = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
    this.setState({ linode: linode });

    const { lish_token: token } = await dispatch(lishToken(linode.id));
    this.setState({ token: token });
  }

  componentWillUnmount() {
    clearInterval(this.renewInterval);
  }

  onUpdateVNCState = (rfb, newState) => {
    this.setState({ vncState: newState });

    switch (newState) {
      case 'normal':
        this.setState({ message: `Connected to Linode ${this.state.linode.id}` });
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = undefined;
        break;
      case 'disconnected':
      case 'failed':
      case 'fatal':
        if (!this.reconnectInterval) {
          this.setState({ message: 'Connecting...' });
          this.reconnectInterval = setInterval(() => {
            this.setState({ powered: false });
            setTimeout(() => this.setState({ powered: true }), 1000);
          }, 3000);
        }
        break;
      default:
        break;
    }
  }

  render() {
    const { vncState, message, powered, token, linode } = this.state;
    const region = linode && ZONES[linode.region];
    return (
      <div id="Glish" className="h-100">
        <GlishControls vncState={vncState} message={message} />
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
