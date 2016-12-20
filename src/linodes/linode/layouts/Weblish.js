import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { LISH_ROOT } from '~/secrets';
import { linodes } from '~/api';
import { lishToken } from '~/api/linodes';
import { getLinode } from './IndexPage';

export function addCSSLink(url) {
  const head = window.document.querySelector('head');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = url;
  head.appendChild(link);
}

export function addJSScript(url) {
  const head = window.document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  head.appendChild(script);
}

export class Weblish extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);

    this.state = {
      token: '',
      renderingLish: false,
    };

    addCSSLink('/assets/weblish/weblish-fonts.css');
    addCSSLink('/assets/weblish/weblish.css');
    addJSScript('/assets/weblish/xterm.js');
    addCSSLink('/assets/weblish/xterm.css');
  }

  async componentWillMount() {
    const { dispatch, params: { linodeId } } = this.props;
    await dispatch(linodes.one([linodeId]));
    await this.connect();
  }

  async connect() {
    const { dispatch, params: { linodeId } } = this.props;
    const { lish_token: token } = await dispatch(lishToken(linodeId));
    const socket = new WebSocket(`${LISH_ROOT}:8181/${token}/weblish`);
    socket.addEventListener('open', () =>
      this.setState({ renderingLish: true }, this.renderTerminal(socket)));
  }

  renderTerminal(socket) {
    const { group, label } = this.getLinode();
    const terminal = new window.Terminal({
      cols: 120,
      rows: 32,
    });

    terminal.on('data', data =>
      socket.send(data));
    terminal.open(document.body);

    terminal.writeln('\x1b[32mLinode Lish Console\x1b[m');

    socket.addEventListener('message', evt =>
      terminal.write(evt.data));

    socket.addEventListener('close', () => {
      terminal.destroy();
      this.setState({ renderingLish: false });
    });
    window.terminal = terminal;

    const linodeLabel = group ? `${group}/${label}` : label;
    window.document.title = `${linodeLabel} - Linode Lish Console`;
  }

  render() {
    return this.state.renderingLish ? null : (
      <div>
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
  linodes: PropTypes.object,
  params: PropTypes.shape({
    linodeId: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default withRouter(connect(select)(Weblish));
