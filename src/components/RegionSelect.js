import omit from 'lodash/omit';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import React from 'react';

import { ExternalLink } from 'linode-components';
import { Select } from 'linode-components';

import { REGION_MAP, UNAVAILABLE_ZONES } from '~/constants';


function makeOptions(additionalFilter) {
  function filterZones(zones) {
    let filteredZones = zones.filter(z => UNAVAILABLE_ZONES.indexOf(z) === -1);
    if (additionalFilter) {
      filteredZones = filteredZones.filter(z => additionalFilter.indexOf(z) >= 0);
    }

    return filteredZones;
  }

  return map(REGION_MAP, (zones, region) => ({
    label: region,
    options: sortBy(filterZones(zones).map(zone => ({ value: zone, label: zone })), 'label'),
  }));
}

const defaultOptions = makeOptions();

export default function RegionSelect(props) {
  let options = defaultOptions;
  if (props.filter) {
    options = makeOptions(props.filter);
  }

  return (
    <div>
      <Select
        {...props}
        options={options}
      />
      <small>
        <ExternalLink to="https://www.linode.com/speedtest">Learn more</ExternalLink>
      </small>
    </div>
  );
}

RegionSelect.propTypes = {
  ...omit(Select.propTypes, 'options'),
  filter: PropTypes.array,
};
