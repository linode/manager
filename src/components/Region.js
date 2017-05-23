import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import { Card, CardHeader } from 'linode-components/cards';
import { flags } from '~/assets';
import { regionMap } from '~/constants';

export default class Region extends Component {
  renderZone = (region) => {
    const { selected, onRegionSelected } = this.props;
    const dcClass = region.id === selected ? 'selected' : '';

    return (
      <div className="col-sm-3">
        <div
          className={`region ${dcClass}`}
          key={region.id}
          onClick={() => onRegionSelected(region.id)}
        >
          <header>
            <div className="title">{region.label}</div>
          </header>
          <div className="option-contents">
            <img
              src={flags[region.country]}
              width={64}
              height={64}
              alt={region.label}
            />
          </div>
        </div>
      </div>
    );
  }

  renderRegion = (zonesInRegion, region) => {
    const allRealRegions = this.props.regions;
    const regions = Object.values(allRealRegions).filter(({ id }) =>
      zonesInRegion.indexOf(id) !== -1);

    return regions.length ? (
      <div className="region-group" key={region}>
        <h3>{region}</h3>
        <div>
          <div className="row">
            {regions.map(this.renderZone)}
          </div>
        </div>
      </div>
      ) : null;
  }

  renderDisabled() {
    const { selected, regions } = this.props;
    const zone = Object.values(regions).find(zone => zone.id === selected);
    return (
      <Card header={<CardHeader title="Region" />}>
        <p>
          The source you selected limits the regions you may deploy
          your new Linode to.
        </p>
        {this.renderZone(zone)}
      </Card>
    );
  }

  render() {
    if (this.props.disabled) {
      return this.renderDisabled();
    }

    return (
      <Card header={<CardHeader title="Region" />}>
        {_.map(regionMap, this.renderRegion)}
      </Card>
    );
  }
}

Region.propTypes = {
  selected: PropTypes.string,
  regions: PropTypes.object.isRequired,
  onRegionSelected: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
