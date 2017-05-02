import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { getObjectByLabelLazily } from '~/api/util';
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

export class Glish extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);

    this.state = {
      token: '',
      renderingLish: false,
    };
    addJSScript('/assets/glish/novnc/util.js');
    addJSScript('//cdnjs.cloudflare.com/ajax/libs/knockout/3.3.0/knockout-min.js');
    addJSScript('/assets/glish/glish.js');
    addCSSLink('/assets/glish/glish.css');
  }

  async componentWillMount() {
    const { dispatch, params: { linodeLabel } } = this.props;
    await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
  }

  render() {
    return this.state.renderingLish ? null : (
      <div>
        <div id="bar" data-bind="attr: { class: 'status status-' + state() }">
          <div id="power-controls" data-bind="visible: state() !== 'error'">
            <button
              className="osx"
              data-bind="click: powerOff, attr: { title: powered() ? 'Power off' : 'Power on' }"
            >
              <i className="fa fa-power-off"></i>
            </button>
            <button
              className="osx"
              title="Reboot"
              data-bind="click: reboot, visible: state() !== 'off'"
            >
              Reboot
            </button>
          </div>
          <div id="meta-controls">
            <button
              className="osx"
              title="Send Ctrl+Alt+Del"
              data-bind="click: ctrlAltDelete, visible: state() === 'normal'"
            >
              Ctrl+Alt+Del
            </button>
          </div>
          <div data-bind="text: statusMessage"></div>
        </div>
        <canvas id="canvas" width="640px" height="20px">
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

function select(state) {
  return { linodes: state.api.linodes };
}

export default withRouter(connect(select)(Glish));
