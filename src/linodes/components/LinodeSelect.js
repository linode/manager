import omit from 'lodash/omit';
import PropTypes from 'prop-types';
import React from 'react';

import { Select } from 'linode-components';

import { transform } from '~/api/util';


export default function LinodeSelect(props) {
  const { groups } = transform(props.linodes);
  const options = groups.map(({ name, data }) => ({
    label: name || '-- No Group --',
    options: data.map(({ label, id }) => ({ label, value: id })),
  }));

  if (props.thisLinode) {
    options.unshift({ value: props.thisLinode.id, label: 'This Linode' });
  }

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
  ...omit(Select.propTypes, 'options'),
  linodes: PropTypes.object.isRequired,
  thisLinode: PropTypes.object,
  allowNone: PropTypes.bool,
};
