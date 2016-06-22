import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import SourceSelection from '../components/SourceSelection';
import ServiceSelection from '../components/ServiceSelection';
import DatacenterSelection from '../components/DatacenterSelection';
import OrderSummary from '../components/OrderSummary';

class CreateLinodePage extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
  }

  render() {
    return (
      <div className="create-page">
        <h1>Add a Linode</h1>
        <div className="card page-card">
          <SourceSelection />
        </div>
        <div className="card page-card">
          <DatacenterSelection />
        </div>
        <div className="card page-card">
          <ServiceSelection />
        </div>
        <div className="card page-card">
          <OrderSummary />
        </div>
      </div>
    );
  }
}

CreateLinodePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

function select() {
  return { };
}

export default connect(select)(CreateLinodePage);
