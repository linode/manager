import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router'; 
import { Terminal } from 'term.js';

import { LISH_ROOT } from '~/constants';
import { lishToken } from '~/api/linodes';

export class Weblish extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      renderingLish: false,
    };
  }

  renderTerminal(socket) {
    const terminal = new Terminal({
      cols: 120,
      rows: 32,
      screenKeys: false,
      debug: true,
      useStyle: true,
    });

    terminal.on('data', data => socket.send(data));
    terminal.open(document.body);

    terminal.write('\x1b[32mLinode Lish Console\x1b[m\r\n');

    socket.addEventListener('message', evt =>
      terminal.write(evt.data));

    socket.addEventListener('close', () => {
      terminal.destroy();
      this.setState({ renderingLish: false });
    });
    window.terminal = terminal;
    window.document.title = 'Linode Lish Console';
  }

  async connect() {
    const { dispatch, params: { linodeId } } = this.props;
    const { lish_token } = await dispatch(lishToken(linodeId));
    const socket = new WebSocket(`${LISH_ROOT}:8181/${lish_token}/weblish`);
    socket.addEventListener('open', () =>
      this.setState({ renderingLish: true }, this.renderTerminal(socket)));
  }
  
  componentWillMount() {
    this.connect();
  }

  render() {
    return this.state.renderingLish ? null : (
      <div>
        <link rel="stylesheet" href="/linodes/linode/weblish/PowerlineFonts.css" />
        <link rel="stylesheet" href="/linodes/linode/weblish/weblish.css" />
        <div id="disconnected">
          <h2>Connection Lost</h2>
          <p>Lish appears to be temporarily unavailable.</p>
          <button onClick={() => this.connect()}>Reload &#x27f3;</button>
        </div>
      </div>
    );
  }
}

Weblish.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string.isRequired,
  }).isRequired,
}

export default withRouter(connect()(Weblish));
