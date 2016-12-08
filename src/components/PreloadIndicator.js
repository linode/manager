import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { preloadStart } from '~/actions/preload_indicator';

export class PreloadIndicator extends Component {
  render() {
    const { mode } = this.props;
    const cls = mode === 'reset' ? '' : `PreloadIndicator--${mode}`;
    return <div className={ `PreloadIndicator ${cls}` } />;
  }
}

PreloadIndicator.propTypes = {
  mode: PropTypes.string.isRequired,
};

function select(state) {
  return {
    mode: state.preload_indicator.mode,
  };
}

export default connect(select)(PreloadIndicator);
