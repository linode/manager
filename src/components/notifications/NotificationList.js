import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';

import NotificationListItem from './NotificationListItem';


export default class NotificationList extends Component {
  componentWillUpdate(nextProps) {
    const { open, events, eventSeen } = nextProps;

    if (open && events[0] && !events[0].seen) {
      eventSeen(events[0].id);
    }
  }

  render() {
    const { events, open, onClickItem } = this.props;

    return (
      <div className={`NotificationList ${open ? 'NotificationList--open' : ''}`}>
        <div className="NotificationList-body">
          <header className="NotificationList-listItem text-xs-right">
            <Link to="/logout">Logout</Link>
          </header>
          <div>
            {events.map((event, index) =>
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
  events: PropTypes.array.isRequired,
  open: PropTypes.bool.isRequired,
  onClickItem: PropTypes.func.isRequired,
};

NotificationList.defaultProps = {
  open: false,
};
