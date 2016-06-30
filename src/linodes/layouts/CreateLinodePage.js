import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import SourceSelection from '../components/SourceSelection';
import ServiceSelection from '../components/ServiceSelection';
import DatacenterSelection from '../components/DatacenterSelection';
import OrderSummary from '../components/OrderSummary';
import { fetchDistros } from '~/actions/api/distros';
import { fetchDatacenters } from '~/actions/api/datacenters';
import { fetchServices } from '~/actions/api/services';
import { changeSourceTab, selectSource } from '~/linodes/actions/create/source';
import { selectDatacenter } from '~/linodes/actions/create/datacenter';
import { selectService } from '~/linodes/actions/create/service';

export class CreateLinodePage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchDistros());
    dispatch(fetchDatacenters());
    dispatch(fetchServices());
  }

  render() {
    const {
      distros,
      datacenters,
      services,
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
          <DatacenterSelection
            selected={create.datacenter.datacenter}
            datacenters={datacenters.datacenters}
            onDatacenterSelected={dc => dispatch(selectDatacenter(dc.id))}
          />
        </div>
        <div className="card page-card">
          <ServiceSelection
            selected={create.service.service}
            services={services.services}
            onServiceSelected={svc => dispatch(selectService(svc.id))}
          />
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
  services: PropTypes.object,
  create: PropTypes.object,
  datacenters: PropTypes.object,
};

function select(state) {
  return {
    distros: state.api.distros,
    datacenters: state.api.datacenters,
    services: state.api.services,
    create: state.linodes.create,
  };
}

export default connect(select)(CreateLinodePage);
