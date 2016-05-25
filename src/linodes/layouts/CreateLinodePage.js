import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import SourceSelection from '../components/SourceSelection';
import ServiceSelection from '../components/ServiceSelection';
import DatacenterSelection from '../components/DatacenterSelection';
import OrderSummary from '../components/OrderSummary';
import { fetchDistros } from '~/actions/api/distros';
import { fetchDatacenters } from '~/actions/api/datacenters';
import { fetchServices } from '~/actions/api/services';
import {
  changeSourceTab,
  selectSource,
  selectDatacenter,
  selectService,
  setLabel,
  generatePassword,
  toggleShowPassword,
  createLinode,
} from '../actions/create';

class CreateLinodePage extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
    this.onLabelChange = this.onLabelChange.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchDistros());
    dispatch(fetchDatacenters());
    dispatch(fetchServices());
    dispatch(generatePassword());
  }

  onLabelChange(e) {
    const { dispatch } = this.props;
    dispatch(setLabel(e.target.value));
  }

  render() {
    const { ui, distros, datacenters, services, dispatch } = this.props;
    return (
      <div className="row">
        <div className="col-md-8 col-md-offset-2">
          <h1>Create a Linode</h1>
          <SourceSelection
            dispatch={dispatch}
            ui={ui} distros={distros}
          />
          <DatacenterSelection
            onSelection={dc => dispatch(selectDatacenter(dc))}
            onBack={() => dispatch(selectSource(null))}
            ui={ui} datacenters={datacenters}
          />
          <ServiceSelection
            dispatch={dispatch}
            onSelection={s => dispatch(selectService(s))}
            onBack={() => dispatch(selectDatacenter(null))}
            ui={ui} services={services}
          />
          <OrderSummary ui={ui}
            onBack={() => dispatch(selectService(null))}
            onCreate={() => dispatch(createLinode())}
            onLabelChange={this.onLabelChange}
            onShowRootPassword={() => dispatch(toggleShowPassword())}
            services={services}
            datacenters={datacenters}
            distros={distros}
          />
        </div>
      </div>
    );
  }
}

function select(state) {
  return {
    datacenters: state.api.datacenters.datacenters,
    distros: state.api.distros.distributions,
    services: Object.values(state.api.services.services).filter(
        s => s.service_type === 'linode'),
    ui: state.linodes.create,
  };
}

export default connect(select)(CreateLinodePage);
