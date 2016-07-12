import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import { flags } from '~/assets';
import { countryMap, regionMap } from '~/constants';

export default class DatacenterSelection extends Component {
  constructor() {
    super();
    this.renderRegion = this.renderRegion.bind(this);
  }

  renderHeader() {
    return (
      <header>
        <h2>Select a datacenter</h2>
      </header>
    );
  }

  renderDatacenter(datacenter) {
    const { selected, onDatacenterSelected } = this.props;
    const dcClass = datacenter.id === selected ? 'selected' : '';
    return (
      <div
        className={`datacenter ${dcClass}`}
        key={datacenter.id}
        onClick={() => onDatacenterSelected(datacenter.id)}
      >
        <header>
          <div className="title">{datacenter.label}</div>
        </header>
        <div>
          <img
            src={flags[countryMap[datacenter.id]]}
            width={64}
            height={64}
            alt={datacenter.label}
          />
        </div>
      </div>
    );
  }

  renderRegion(datacentersInRegion, region) {
    const allRealDatacenters = this.props.datacenters;
    const datacenters = Object.values(allRealDatacenters).filter(({ id }) =>
      datacentersInRegion.indexOf(id) !== -1);

    return datacenters.length ? (
      <div key={region}>
        <h3>{region}</h3>
        <div className="datacenter-group">
          {datacenters.map(this.renderDatacenter.bind(this))}
        </div>
      </div>
    ) : null;
  }

  render() {
    return (
      <div>
        {this.renderHeader()}
        <div className="datacenters">
          {_.map(regionMap, this.renderRegion)}
        </div>
      </div>
    );
  }
}

DatacenterSelection.propTypes = {
  selected: PropTypes.string,
  datacenters: PropTypes.object.isRequired,
  onDatacenterSelected: PropTypes.func.isRequired,
};
