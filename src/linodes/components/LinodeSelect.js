import _ from 'lodash';
import React, { PropTypes } from 'react';

import { Select } from 'linode-components/forms';


export default function LinodeSelect(props) {
  const sortedLinodes = _.sortBy(props.linodes, 'label').map(l => ({ ...l, value: l.id }));
  const options = _.map(_.groupBy(sortedLinodes, 'group'), (group) => ({
    label: group[0].label,
    options: group,
  }));

  if (props.allowNone) {
    options.unshift({ label: '-- None --', value: LinodeSelect.EMPTY });
  }

  return (
    <Select
      {...props}
      options={options}
    />
  );
}

LinodeSelect.EMPTY = '-- None --';

LinodeSelect.propTypes = {
  ...Select.propTypes,
  linodes: PropTypes.object.isRequired,
  allowNone: PropTypes.bool,
};
