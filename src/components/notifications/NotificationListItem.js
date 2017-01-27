import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';

import EventTypeMap from './EventTypes';


export default function NotificationListItem(props) {
  const event = props.event;
  const timeRemaining = event.time_remaining;
  const eventOptions = EventTypeMap[event.type];

  const timestamp = moment.utc(event.updated, moment.ISO_8601);
  let message;

  if (timeRemaining !== null && timeRemaining > 0) {
    message = (
      <span>
        <span>
          {`${eventOptions.presentTenseAction} `}
          <strong>{event.entity}</strong>
        </span>
        <small className="text-muted">
          {/* TODO: Time remaining estimation */}
          {/* {` ${_rate} Estimated ${_time_remaining}`} */}
        </small>
      </span>
    );
  } else {
    const timestampMessage = (
      <small className="NotificationList-listItem-time text-muted">
        {/* TODO: user_id calculation */}
        {timestamp.fromNow()}
      </small>
    );

    // TODO: check against upcoming API Change
    if (event.status === 'failed') {
      message = (
        <span>
          <span>
            {`${eventOptions.presentTenseAction} `}
            <strong>{event.entity}</strong> failed
          </span>
          {timestampMessage}
        </span>
      );
    } else if (eventOptions.pastTensePrefix) {
      message = (
        <div>
          <div>
            {`${eventOptions.pastTensePrefix} `}
            <strong>{event.entity}</strong>
            {` ${eventOptions.pastTenseAction} `}
          </div>
          {timestampMessage}
        </div>
      );
    } else {
      message = (
        <span>
          <span>
            <strong>{event.entity}</strong>
            {` ${eventOptions.pastTenseAction} `}
          </span>
          {timestampMessage}
        </span>
      );
    }
  }

  const baseCls = 'NotificationList-listItem';
  let className = baseCls;

  if (event.read) {
    className += ` ${baseCls}--read`;
  } else {
    className += ` ${baseCls}--unread`;
  }

  return (
    <Link
      to={eventOptions.redirectUrl(event.entity)}
      className={className}
      onClick={() => props.onClick(event)}
    >
      {message}
    </Link>
  );
}

NotificationListItem.propTypes = {
  onClick: PropTypes.func.isRequired,
};
