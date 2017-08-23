import React, { PropTypes } from 'react';

import { Select } from 'linode-components/forms';

import { transform } from '~/api/util';


export default function LinodeSelect(props) {
  const { groups } = transform(props.linodes);
  const options = groups.map(({ name, data }) => ({
    label: name || '-- No Group --',
    options: data.map(({ label, id }) => ({ label, value: id })),
  }));

  if (props.allowNone) {
    options.unshift({ label: LinodeSelect.EMPTY, value: LinodeSelect.EMPTY });
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
