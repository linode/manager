import _ from 'lodash';
import React, { PropTypes } from 'react';

import { Select } from 'linode-components/forms';


export default function DistributionSelect(props) {
  const sortedLinodes = _.sortBy(props.linodes, 'label').map(l => ({ ...l, value: l.id }));
  const options = _.map(_.groupBy(sortedLinodes, 'group'), (group) => ({
    label: group[0].label,
    options: group,
  }));

  console.log(options);
  return (
    <Select
      {...props}
      options={options}
    />
  );
}

DistributionSelect.propTypes = {
  ...Select.propTypes,
  linodes: PropTypes.object.isRequired,
};
