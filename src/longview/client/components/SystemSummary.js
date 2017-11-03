import PropTypes from 'prop-types';
import React from 'react';

export default function SystemSummary(props, state) {
  return (
    <section>
      JSON: {JSON.stringify(props)}
    </section>
  );
}

SystemSummary.propTypes = {
  system: PropTypes.object,
  lvclient: PropTypes.object,
  dispatch: PropTypes.func,
};