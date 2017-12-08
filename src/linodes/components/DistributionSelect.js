import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { ExternalLink } from 'linode-components/buttons';
import { Select } from 'linode-components/forms';

import { DISTRIBUTION_DISPLAY_ORDER } from '~/constants';


export default function DistributionSelect(props) {
  const vendorsOrdered = [...DISTRIBUTION_DISPLAY_ORDER];
  const extendedImages = props.images !== undefined ?
    _.map(Object.values(props.images), i => {
      const x = { ...i };

      if (! i.is_public) {
        x.vendor = 'Images';
      }

      x.value = i.id;
      x.vendorLower = _.lowerCase(i.vendor);

      vendorsOrdered.includes(x.vendorLower) || vendorsOrdered.push(x.vendorLower);

      return x;
    }) : [];
  vendorsOrdered.push('images');

  const vendorsUnsorted = _.map(
    _.groupBy(extendedImages, 'vendorLower'),
    (v) => ({
      label: v[0].vendor,
      options: _.orderBy(v, ['recommended', 'created'], ['desc', 'desc']),
    })
  );

  const vendorByName = vendor => vendorsUnsorted.find(v => _.lowerCase(v.label) === vendor);

  const options = [];

  if (props.allowNone) {
    options.push({ label: 'No image', value: 'none' });
  }

  for (const vendorName of vendorsOrdered) {
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
  ..._.omit(Select.propTypes, 'options'),
  images: PropTypes.object.isRequired,
  allowNone: PropTypes.bool,
  options: PropTypes.array,
};
