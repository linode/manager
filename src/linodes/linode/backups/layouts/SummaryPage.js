import React from 'react';
import { connect } from 'react-redux';

export function SummaryPage() {
  return (
    <div>
      TODO
    </div>
  );
}

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(SummaryPage);
