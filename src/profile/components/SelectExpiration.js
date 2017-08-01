import React, { PropTypes } from 'react';
import moment from 'moment';

import { Select } from 'linode-components/forms';


export default function SelectExpiration(props) {
  const options = [
    { value: 180, label: 'In 6 months' },
    { value: 90, label: 'In 3 months' },
    { value: 30, label: 'In 1 month' },
    { value: 0, label: 'Never' },
  ];

  return (
    <Select
      id={props.id}
      onChange={props.onChange}
      value={props.value}
      name={props.name}
      options={options}
    />
  );
}

SelectExpiration.map = function (value) {
  return value === 0 ? undefined : moment()
    .add(value, 'days')
    .utc()
    .format('YYYY-MM-DDTHH:mm:ss')
    .toString();
};

SelectExpiration.propTypes = {
  value: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
};
