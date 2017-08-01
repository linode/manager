import _ from 'lodash';
import React, { PropTypes } from 'react';

import { Select } from 'linode-components/forms';

import { DISTRIBUTION_DISPLAY_ORDER } from '~/constants';


export default function DistributionSelect(props) {
  // The API returns vendors with inconsistent casing, so we normalize that before
  // we group on vendor.
  const withVendorLowerCased = _.map(Object.values(props.distributions), d => ({
    ...d,
    value: d.id,
    vendorLower: d.vendor.toLowerCase(),
  }));

  const vendorsUnsorted = _.map(
    _.groupBy(withVendorLowerCased, 'vendorLower'),
    (v) => ({
      label: v[0].vendor,
      options: _.orderBy(v, ['recommended', 'created'], ['desc', 'desc']),
    })
  );

  const vendorByName = vendor => vendorsUnsorted.find(v => v.label.toLowerCase() === vendor);

  const options = [];

  for (const vendorName of DISTRIBUTION_DISPLAY_ORDER) {
    const byName = vendorByName(vendorName);

    if (byName) {
      options.push(byName);
    }
  }

  return (
    <Select
      {...props}
      options={options}
    />
  );
}

DistributionSelect.propTypes = {
  ...Select.propTypes,
  distributions: PropTypes.object.isRequired,
};
