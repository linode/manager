import React from 'react';
import { connect } from 'react-redux';

export function SummaryPage() {
  return (
    <section className="card graphs">
      TODO
    </section>
  );
}

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(SummaryPage);
