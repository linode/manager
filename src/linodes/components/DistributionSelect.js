import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { ExternalLink } from 'linode-components';
import { Select } from 'linode-components';

import { DISTRIBUTION_DISPLAY_ORDER } from '~/constants';


export default function DistributionSelect(props) {
  const vendorsOrdered = [...DISTRIBUTION_DISPLAY_ORDER];

  const imageFilter = im => im.status === 'available';
  const imageOptions = props.images !== undefined ?
    _.map(Object.values(props.images).filter(imageFilter), im => {
      const image = { ...im };
      // ensure that each image has a vendor
      if (!image.vendor) {
        image.vendor = 'Images';
      }
      image.vendorLower = _.lowerCase(image.vendor);
      // add the value prop for the sake of the Select
      image.value = image.id;
      // add the image's vendor to the order array if it's not already there
      if (!vendorsOrdered.includes(image.vendorLower) && image.vendorLower !== 'images') {
        vendorsOrdered.push(image.vendorLower);
      }
      return image;
    }) : [];

  // user created images are always displayed last
  vendorsOrdered.push('images');

  const vendoredOptions = _.map(
    _.groupBy(imageOptions, 'vendorLower'),
    (vendorOptions) => ({
      label: vendorOptions[0].vendor,
      options: _.orderBy(vendorOptions, ['recommended', 'created'], ['desc', 'desc']),
    })
  );

  const options = [];

  if (props.allowNone) {
    options.push({ label: 'No image', value: 'none' });
  }

  for (const vendorName of vendorsOrdered) {
    const byName = vendoredOptions.find(v => _.lowerCase(v.label) === vendorName);

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
