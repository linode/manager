import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';

import NotificationListItem from './NotificationListItem';

export function sortNotifications(eventsDict) {
  const events = Object.values(eventsDict.events);
  if (!events.length) {
    return [];
  }

  // TODO: address with request filter
  return events.reverse();
}

export default class NotificationList extends Component {
  componentWillUpdate(nextProps) {
    const { open, events, eventSeen } = nextProps;
    const sortedEvents = sortNotifications(events);

    if (open && sortedEvents[0] && !sortedEvents[0].seen) {
      eventSeen(sortedEvents[0].id);
    }
  }

  render() {
    const { events, open, onClickItem } = this.props;
    const sortedEvents = sortNotifications(events);

    return (
      <div className={`NotificationList ${open ? 'NotificationList--open' : ''}`}>
        <div className="NotificationList-body">
          <header className="NotificationList-listItem text-xs-right">
            <Link to="/logout">Logout</Link>
          </header>
          <div>
            {sortedEvents.map((event, index) =>
              <NotificationListItem
                key={index}
                onClick={onClickItem}
                event={event}
              />)}
            <div className="NotificationList-end text-xs-center">
              No more notifications.
            </div>
          </div>
        </div>
      </div>
    );
  }
}

NotificationList.propTypes = {
  events: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClickItem: PropTypes.func.isRequired,
};

NotificationList.defaultProps = {
  open: false,
};
