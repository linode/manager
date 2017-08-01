import _ from 'lodash';
import moment from 'moment-timezone';
import React, { PropTypes } from 'react';

import { getStorage } from '~/storage';


export default function TimeDisplay(props) {
  const timezone = getStorage('profile/timezone') || 'UTC';
  const utcTime = moment.utc(props.time, moment.iso_8601).tz(timezone);
  const aLongTimeFromNow = moment.utc(new Date()).tz(timezone).add(100, 'year');
  const label = utcTime > aLongTimeFromNow ? 'never' : utcTime.fromNow();

  return (
    <span
      title={utcTime.format('MMM D YYYY h:mm A z')}
    >{props.capitalize ? _.capitalize(label) : label}</span>
  );
}

TimeDisplay.propTypes = {
  time: PropTypes.string,
  capitalize: PropTypes.bool,
};
