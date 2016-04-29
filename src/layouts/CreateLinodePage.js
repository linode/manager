import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import SourceSelection from '../containers/create-linode/SourceSelection';
import ServiceSelection from '../containers/create-linode/ServiceSelection';
import DatacenterSelection from '../components/create-linode/DatacenterSelection';
import OrderSummary from '../components/create-linode/OrderSummary';
import { fetchDistros } from '../actions/distros';
import { fetchDatacenters } from '../actions/datacenters';
import { fetchServices } from '../actions/services';
import {
  changeSourceTab,
  selectSource,
  selectDatacenter,
  selectService,
  setLabel,
  generatePassword,
  toggleShowPassword,
  createLinode
} from '../actions/ui/linode-creation';

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
            ui={ui} distros={distros} />
          <DatacenterSelection
            onSelection={dc => dispatch(selectDatacenter(dc))}
            onBack={() => dispatch(selectSource(null))}
            ui={ui} datacenters={datacenters} />
          <ServiceSelection
            dispatch={dispatch}
            onSelection={s => dispatch(selectService(s))}
            onBack={() => dispatch(selectDatacenter(null))}
            ui={ui} services={services} />
          <OrderSummary ui={ui}
            onBack={() => dispatch(selectService(null))}
            onCreate={() => dispatch(createLinode())}
            onLabelChange={this.onLabelChange}
            onShowRootPassword={() => dispatch(toggleShowPassword())}
            services={services}
            datacenters={datacenters}
            distros={distros} />
        </div>
      </div>
    );
  }
}

function select(state) {
  return {
    datacenters: state.datacenters.datacenters,
    distros: state.distros.distributions,
    services: Object.values(state.services.services).filter(
        s => s.service_type === 'linode'),
    ui: state.ui.linodeCreation,
  };
}

export default connect(select)(CreateLinodePage);
