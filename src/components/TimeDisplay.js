import React, { PropTypes } from 'react';
import moment from 'moment-timezone';

import { getStorage } from '~/storage';

export default function TimeDisplay(props) {
  const timezone = getStorage('authentication/timezone') || 'UTC';
  const utcTime = moment.utc(props.time, moment.iso_8601);
  utcTime.tz(timezone);
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
