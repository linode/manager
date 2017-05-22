import React, { PropTypes } from 'react';
import moment from 'moment-timezone';

import { getStorage } from '~/storage';


const timezone = getStorage('profile/timezone') || 'UTC';

export function formatGraphTime(time) {
  return moment.utc(time).tz(timezone).format('HH:mm');
}

export default function TimeDisplay(props) {
  const utcTime = moment.utc(props.time, moment.iso_8601).tz(timezone);
  return (
    <span
      title={utcTime.format('MMM D YYYY h:mm A z')}
    >
      {utcTime.fromNow()}
    </span>
  );
}

TimeDisplay.propTypes = {
  time: PropTypes.string,
};
