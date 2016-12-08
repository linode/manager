import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

export function PreloadIndicator(props) {
  const { mode } = props;
  const cls = mode === 'reset' ? '' : `PreloadIndicator--${mode}`;
  return <div className={`PreloadIndicator ${cls}`} />;
}

PreloadIndicator.propTypes = {
  mode: PropTypes.string.isRequired,
};

function select(state) {
  return {
    mode: state.preloadIndicator.mode,
  };
}

export default connect(select)(PreloadIndicator);
