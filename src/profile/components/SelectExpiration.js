import React, { PropTypes } from 'react';
import moment from 'moment';

import { Select } from '~/components/form';

export default function SelectExpiration(props) {
  return (
    <Select
      id={props.id}
      onChange={props.onChange}
      value={props.value}
      name={props.name}
    >
      <option value="0">Never</option>
      <option value="30">In 1 month</option>
      <option value="90">In 3 months</option>
      <option value="180">In 6 months</option>
    </Select>
  );
}

SelectExpiration.map = value =>
  value === '0' ? undefined : (
    moment()
      .add(value, 'days')
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss')
      .toString());

SelectExpiration.propTypes = {
  value: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
};
