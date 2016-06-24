import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import SourceSelection from '../components/SourceSelection';
import ServiceSelection from '../components/ServiceSelection';
import DatacenterSelection from '../components/DatacenterSelection';
import OrderSummary from '../components/OrderSummary';
import { fetchDistros } from '~/actions/api/distros';
import { changeSourceTab, selectSource } from '~/linodes/actions/create/source';

export class CreateLinodePage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchDistros());
  }

  render() {
    const {
      distros,
      create,
      dispatch,
    } = this.props;
    return (
      <div className="create-page">
        <h1>Add a Linode</h1>
        <div className="card page-card">
          <SourceSelection
            source={create.source.source}
            selectedTab={create.source.sourceTab}
            distros={distros.distributions}
            onTabChange={ix => dispatch(changeSourceTab(ix))}
            onSourceSelected={source => dispatch(selectSource(source.id))}
          />
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
  distros: PropTypes.object,
  create: PropTypes.object,
};

function select(state) {
  return {
    distros: state.api.distros,
    create: state.linodes.create,
  };
}

export default connect(select)(CreateLinodePage);
