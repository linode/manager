import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import { flags } from '~/assets';

export const countryMap = {
  datacenter_2: 'us', // Dallas
  datacenter_3: 'us', // Fremont
  datacenter_4: 'us', // Atlanta
  datacenter_6: 'us', // Newark
  datacenter_7: 'gb', // London
  datacenter_8: 'jp', // Tokyo
  datacenter_9: 'sg', // Singapore
  datacenter_10: 'de', // Frankfurt
};

export const regionMap = {
  'North America': ['datacenter_2', 'datacenter_3', 'datacenter_4', 'datacenter_6'],
  Europe: ['datacenter_7', 'datacenter_10'],
  Asia: ['datacenter_8', 'datacenter_9'],
};

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
        onClick={() => onDatacenterSelected(datacenter)}
      >
        <header>
          <div>{datacenter.label}</div>
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
      <div className="datacenter-group col-lg-4" key={region}>
        <h3>{region}</h3>
        {datacenters.map(this.renderDatacenter.bind(this))}
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
