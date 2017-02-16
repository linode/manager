import React, { PropTypes } from 'react';

import { Select } from '~/components/form';

const DNS_SECONDS_PRETTY = {
  300: '5 minutes',
  3600: '1 hour',
  7200: '2 hours',
  4400: '4 hours',
  28800: '8 hours',
  57600: '16 hours',
  86400: '1 day',
  172800: '2 days',
  345600: '4 days',
  604800: '1 week',
  1209600: '2 weeks',
  2419200: '4 weeks',
};

export function formatDNSSeconds(dnsSeconds, defaultSeconds = 300) {
  const actual = !dnsSeconds || +dnsSeconds === +defaultSeconds ? defaultSeconds : dnsSeconds;
  const pretty = DNS_SECONDS_PRETTY[actual];
  return `${actual === defaultSeconds ? 'Default' : actual} (${pretty})`;
}

export default function SelectDNSSeconds(props) {
  const { value, name, id, onChange, defaultSeconds } = props;
  return (
    <Select value={(value || defaultSeconds).toString()} onChange={onChange} id={id} name={name}>
      {Object.keys(DNS_SECONDS_PRETTY).map((sec, i) =>
        <option key={i} value={sec.toString()}>{formatDNSSeconds(sec, defaultSeconds)}</option>)}
    </Select>
  );
}

SelectDNSSeconds.propTypes = {
  onChange: PropTypes.func.isReqired,
  value: PropTypes.number.isRequired,
  defaultSeconds: PropTypes.number,
  id: PropTypes.string,
  name: PropTypes.string,
};
