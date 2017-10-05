import React, { PropTypes } from 'react';

import { Link } from 'react-router';
import TimeDisplay from '~/components/TimeDisplay';

import EventTypeMap from './EventTypes';


export default function NotificationListItem(props) {
  const event = props.event;
  const timeRemaining = event.time_remaining;
  const eventOptions = EventTypeMap[event.action];

  const baseCls = 'NotificationList-listItem';
  let className = baseCls;

  // This should not happen (it is a bug in the db). But if it does, don't blow up.
  if (!event.entity) {
    return null;
  }

  const entity = <strong>{event.entity.label}</strong>;
  let message;
  if (!event.read) {
    className += ` ${baseCls}--unread`;
  } else {
    className += ` ${baseCls}--read`;
  }

  if (timeRemaining !== null && timeRemaining > 0) {
    message = (
      <div>
        <div>
          {`${eventOptions.presentTenseAction} `}
          {entity}
        </div>
        <small className="text-muted">
          {/* TODO: Time remaining estimation */}
          {/* {` ${_rate} Estimated ${_time_remaining}`} */}
        </small>
      </div>
    );
  } else {
    const timestampMessage = (
      <div>
        <small>
          <span className="text-muted">
            <TimeDisplay time={event.created} /> by&nbsp;
          </span>
          <strong>{event.username}</strong>
        </small>
      </div>
    );

    // TODO: check against upcoming API Change
    if (event.status === 'failed') {
      message = (
        <div>
          <div>
            {`${eventOptions.presentTenseAction} `}
            {entity} failed
          </div>
          {timestampMessage}
        </div>
      );
    } else if (eventOptions.pastTensePrefix) {
      message = (
        <div>
          <div>
            {`${eventOptions.pastTensePrefix} `}
            {entity}
            {` ${eventOptions.pastTenseAction} `}
          </div>
          {timestampMessage}
        </div>
      );
    } else {
      message = (
        <div>
          <div>
            {entity}
            {` ${eventOptions.pastTenseAction} `}
          </div>
          {timestampMessage}
        </div>
      );
    }
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
  onClick: PropTypes.func,
};
