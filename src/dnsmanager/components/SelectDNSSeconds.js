import React, { PropTypes } from 'react';

import { Select } from '~/components/form';

export const FIVE_MINUTES = 300;
export const ONE_HOUR = FIVE_MINUTES * 12;
export const TWO_HOURS = ONE_HOUR * 2;
export const FOUR_HOURS = ONE_HOUR * 4;
export const EIGHT_HOURS = ONE_HOUR * 8;
export const SIXTEEN_HOURS = ONE_HOUR * 16;
export const ONE_DAY = ONE_HOUR * 24;
export const TWO_DAYS = ONE_DAY * 2;
export const FOUR_DAYS = ONE_DAY * 4;
export const ONE_WEEK = ONE_DAY * 7;
export const TWO_WEEKS = ONE_WEEK * 2;
export const FOUR_WEEKS = ONE_WEEK * 4;

const DNS_SECONDS_PRETTY = {
  [FIVE_MINUTES]: '5 minutes',
  [ONE_HOUR]: '1 hour',
  [TWO_HOURS]: '2 hours',
  [FOUR_HOURS]: '4 hours',
  [EIGHT_HOURS]: '8 hours',
  [SIXTEEN_HOURS]: '16 hours',
  [ONE_DAY]: '1 day',
  [TWO_DAYS]: '2 days',
  [FOUR_DAYS]: '4 days',
  [ONE_WEEK]: '1 week',
  [TWO_WEEKS]: '2 weeks',
  [FOUR_WEEKS]: '4 weeks',
};

export function formatDNSSeconds(dnsSeconds, defaultSeconds = ONE_DAY) {
  const actual = !dnsSeconds || +dnsSeconds === +defaultSeconds ? defaultSeconds : dnsSeconds;
  const pretty = DNS_SECONDS_PRETTY[actual];
  return `${actual === defaultSeconds ? 'Default' : actual}${pretty ? ` (${pretty})` : ''}`;
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
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  defaultSeconds: PropTypes.number,
  id: PropTypes.string,
  name: PropTypes.string,
};
