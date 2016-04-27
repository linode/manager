import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import SourceSelection from '../containers/create-linode/SourceSelection';
import DatacenterSelection from '../components/create-linode/DatacenterSelection';
import { fetchDistros } from '../actions/distros';
import { fetchDatacenters } from '../actions/datacenters';
import {
    changeSourceTab,
    selectSource,
    selectDatacenter
} from '../actions/ui/linode-creation';

class CreateLinodePage extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
  }

  componentDidMount() {
      const { dispatch } = this.props;
      dispatch(fetchDistros());
      dispatch(fetchDatacenters());
  }

  render() {
    const { ui, distros, datacenters, dispatch } = this.props;
    return (
      <div className="row">
        <div className="col-md-6 col-md-offset-3">
          <h1>Create a Linode</h1>
          <SourceSelection
            dispatch={dispatch}
            ui={ui}
            distros={distros} />
          <DatacenterSelection
            onSelection={dc => dispatch(selectDatacenter(dc))}
            onBack={() => dispatch(selectSource(null))}
            ui={ui}
            datacenters={datacenters} />
        </div>
      </div>
    );
  }
}

function select(state) {
  return {
    datacenters: state.datacenters.datacenters,
    distros: state.distros.distros,
    ui: state.ui.linodeCreation,
  };
}

export default connect(select)(CreateLinodePage);
