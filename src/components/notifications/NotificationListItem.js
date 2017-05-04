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

  let entity;
  let message;
  if (!event.read) {
    entity = (<strong>{event.entity.label}</strong>);
    className += ` ${baseCls}--unread`;
  } else {
    entity = event.entity.label;
    className += ` ${baseCls}--read`;
  }

  if (timeRemaining !== null && timeRemaining > 0) {
    message = (
      <span>
        <span>
          {`${eventOptions.presentTenseAction} `}
          {entity}
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
        <TimeDisplay time={event.created} /> by <b>{event.username}</b>
      </small>
    );

    // TODO: check against upcoming API Change
    if (event.status === 'failed') {
      message = (
        <span>
          <span>
            {`${eventOptions.presentTenseAction} `}
            {entity} failed
          </span>
          {timestampMessage}
        </span>
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
        <span>
          <span>
            {entity}
            {` ${eventOptions.pastTenseAction} `}
          </span>
          {timestampMessage}
        </span>
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
