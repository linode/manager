import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { ExternalLink } from 'linode-components/buttons';
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

  const withImages = props.images !== undefined ?
    _.map(Object.values(props.images), i => ({
      ...i,
      value: i.id,
      vendor: 'Images',
      vendorLower: 'images',
    })) : [];

  const vendorsUnsorted = _.map(
    _.groupBy(withVendorLowerCased.concat(withImages), 'vendorLower'),
    (v) => ({
      label: v[0].vendor,
      options: _.orderBy(v, ['recommended', 'created'], ['desc', 'desc']),
    })
  );

  const vendorByName = vendor => vendorsUnsorted.find(v => v.label.toLowerCase() === vendor);

  const options = [];

  if (props.allowNone) {
    options.push({ label: 'No distribution', value: 'none' });
  }

  for (const vendorName of DISTRIBUTION_DISPLAY_ORDER) {
    const byName = vendorByName(vendorName);

    if (byName) {
      options.push(byName);
    }
  }

  return (
    <div>
      <Select
        {...props}
        options={options}
      />
      <div>
        <small className="text-muted">
          <ExternalLink to="https://www.linode.com/distributions">Learn more</ExternalLink>
        </small>
      </div>
    </div>
  );
}

DistributionSelect.propTypes = {
  ...Select.propTypes,
  distributions: PropTypes.object.isRequired,
  images: PropTypes.object,
  allowNone: PropTypes.bool,
};
