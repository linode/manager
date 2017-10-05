import _ from 'lodash';
import React from 'react';

import { ExternalLink } from 'linode-components/buttons';
import { Select } from 'linode-components/forms';

import { REGION_MAP, UNAVAILABLE_ZONES } from '~/constants';


const options = _.map(REGION_MAP, (zones, region) => ({
  label: region,
  options: _.sortBy(zones.filter(z => UNAVAILABLE_ZONES.indexOf(z) === -1)
                         .map(zone => ({ value: zone, label: zone })), 'label'),
}));

export default function RegionSelect(props) {
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
  ...Select.propTypes,
};
