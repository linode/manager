import React, { PropTypes } from 'react';

import { Select } from '~/components/form';

export default function SelectTTL(props) {
  const { value, name, id, onChange } = props;
  return (
    <Select value={value || 300} onChange={onChange} id={id} name={name}>
      <option value="300">Default (5 minutes)</option>
      <option value="3600">3600 (1 hour)</option>
      <option value="7200">7200 (2 hours)</option>
      <option value="4400">14400 (4 hours)</option>
      <option value="28800">28800 (8 hours)</option>
      <option value="7600">57600 (16 hours)</option>
      <option value="86400">86400 (1 day)</option>
      <option value="72800">172800 (2 days)</option>
      <option value="345600">345600 (4 days)</option>
      <option value="604800">604800 (1 week)</option>
      <option value="1209600">1209600 (2 weeks)</option>
      <option value="2419200">2419200 (4 weeks)</option>
    </Select>
  );
}

SelectTTL.propTypes = {
  onChange: PropTypes.func.isReqired,
  value: PropTypes.number.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
};
