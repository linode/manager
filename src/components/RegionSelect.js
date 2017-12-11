import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { ExternalLink } from 'linode-components/buttons';
import { Select } from 'linode-components/forms';

import { REGION_MAP, UNAVAILABLE_ZONES } from '~/constants';


function makeOptions(additionalFilter) {
  function filterZones(zones) {
    let filteredZones = zones.filter(z => UNAVAILABLE_ZONES.indexOf(z) === -1);
    if (additionalFilter) {
      filteredZones = filteredZones.filter(z => additionalFilter.indexOf(z) >= 0);
    }

    return filteredZones;
  }

  return _.map(REGION_MAP, (zones, region) => ({
    label: region,
    options: _.sortBy(filterZones(zones).map(zone => ({ value: zone, label: zone })), 'label'),
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
  ..._.omit(Select.propTypes, 'options'),
  filter: PropTypes.array,
};
