import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import moment from 'moment';

import { Event } from '~/api/objects/Event';

function getLinodeName(event, linodes) {
  const linodeIfCached = linodes && linodes.linodes[event.getLinodeId()];
  if (linodeIfCached) {
    return linodeIfCached.label;
  }
  switch (event.getType()) {
    case Event.LINODE_BACKUPS_ENABLE:
    case Event.LINODE_BACKUPS_DISABLE:
      return event._event.entity.split(' ')[3];
    default:
      return event._event.entity.split(' ')[2];
  }
}

function linodeNotificationMessage(event, linodes, objectType, tempText,
    doneText, view) {
  const linodeName = getLinodeName(event, linodes);
  const eventFinished = event.getProgress() === 100;

  return (
    <span>
      <Link
        to="#"
        onClick={view}
        className="Notification-subject"
      >{linodeName}</Link>
      {objectType}&nbsp;
      {eventFinished ? doneText : tempText}&nbsp;
      {event._event.status === 'failed' ? 'failed' : ''}
    </span>
  );
}

function notificationMessage(event, linodes, view) {
  switch (event.getType()) {
    case Event.LINODE_REBOOT:
      return linodeNotificationMessage(event, linodes, 'Linode', 'rebooting', 'rebooted', view);
    case Event.LINODE_BOOT:
      return linodeNotificationMessage(event, linodes, 'Linode', 'booting', 'booted', view);
    case Event.LINODE_POWER_OFF:
      return linodeNotificationMessage(event, linodes, 'Linode', 'being shut down', 'shut down',
        view);
    case Event.LINODE_CREATE:
      return linodeNotificationMessage(event, linodes, 'Linode', 'provisioning', 'created', view);
    case Event.LINODE_DELETE:
      return linodeNotificationMessage(event, linodes, 'Linode', 'being deleted', 'deleted', view);

    case Event.LINODE_BACKUPS_ENABLE:
      return linodeNotificationMessage(event, linodes, 'Backups', 'enabled', 'enabled', view);
    case Event.LINODE_BACKUPS_DISABLE:
      return linodeNotificationMessage(event, linodes, 'Backups', 'disabled', 'disabled', view);

    case Event.LINODE_DISK_DELETE:
      return linodeNotificationMessage(event, linodes, 'Disk', 'being deleted', 'deleted', view);
    case Event.LINODE_DISK_CREATE:
      return linodeNotificationMessage(event, linodes, 'Disk', 'being created', 'created', view);
    case Event.LINODE_DISK_RESIZE:
      return linodeNotificationMessage(event, linodes, 'Disk', 'being resized', 'resized', view);

    default:
      return '';
  }
}

export function Notification(props) {
  const event = new Event(props);

  function handleNotificationClick() {
    return props.readNotification(props.id);
  }

  function handleNotificationView(e) {
    if (!props.read) {
      props.readNotification(props.id);
    }

    let page = `/linodes/${getLinodeName(event, props.linodes)}`;

    switch (event.getType()) {
      case Event.LINODE_DELETE:
        // No page to change to.
        return;

      case Event.LINODE_REBOOT:
      case Event.LINODE_BOOT:
      case Event.LINODE_POWER_OFF:
      case Event.LINODE_CREATE:
        break; // Default is good

      case Event.LINODE_DISK_DELETE:
      case Event.LINODE_DISK_CREATE:
      case Event.LINODE_DISK_RESIZE:
        page = `${page}/settings/advanced`;
        break;

      case Event.LINODE_BACKUPS_ENABLE:
      case Event.LINODE_BACKUPS_DISABLE:
        page = `${page}/backups`;
        break;

      default:
        break;
    }

    props.gotoPage(page);
    return props.hideShowNotifications(e);
  }

  return (
    <div
      className={`Notification ${props.read ? '' : 'Notification--unread'}`}
      onClick={handleNotificationClick}
    >
      <header className="Notification-header">
        <div className="Notification-text">
          {notificationMessage(event, props.linodes, handleNotificationView)}
        </div>
        <div className="Notification-time">
          {moment.utc(props.updated, moment.ISO_8601).fromNow()}
        </div>
      </header>
    </div>
  );
}

Notification.propTypes = {
  id: PropTypes.number.isRequired,
  read: PropTypes.bool.isRequired,
  readNotification: PropTypes.func.isRequired,
  gotoPage: PropTypes.func.isRequired,
  updated: PropTypes.string.isRequired,
  linode_id: PropTypes.number,
  nodebalancer_id: PropTypes.number,
  stackscript_id: PropTypes.number,
  linodes: PropTypes.object.isRequired,
  hideShowNotifications: PropTypes.func.isRequired,
};

export function sortNotifications(eventsDict) {
  const events = Object.values(eventsDict.events);
  if (!events.length) {
    return [];
  }

  events.sort((e1, e2) => {
    const timeDelta = new Date(e2.updated) - new Date(e1.updated);
    return timeDelta !== 0 ? timeDelta : e2.id - e1.id;
  });
  return events;
}

export default class Notifications extends Component {
  componentWillUpdate(nextProps) {
    const { open, events, eventSeen } = nextProps;
    const sortedEvents = sortNotifications(events);

    if (open && sortedEvents[0] && !sortedEvents[0].seen) {
      eventSeen(sortedEvents[0].id);
    }
  }

  render() {
    const {
      open, hideShowNotifications, readNotification, events, linodes, gotoPage,
    } = this.props;

    const sortedEvents = sortNotifications(events);

    return (
      <div className={`Notifications ${open ? 'Notifications--open' : ''}`}>
        <div
          className="Notifications-overlay"
          onClick={hideShowNotifications}
        />
        <div className="Notifications-body">
          <header className="Notifications-header text-xs-right">
            <Link to="/logout">Logout</Link>
          </header>
          <div>
            {sortedEvents.map((e, index) =>
              <Notification
                key={index}
                readNotification={readNotification}
                gotoPage={gotoPage}
                linodes={linodes}
                hideShowNotifications={hideShowNotifications}
                {...e}
              />)}
            <div className="Notifications-end text-xs-center">
              No more notifications.
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Notifications.propTypes = {
  open: PropTypes.bool.isRequired,
  hideShowNotifications: PropTypes.func.isRequired,
  readNotification: PropTypes.func.isRequired,
  gotoPage: PropTypes.func.isRequired,
  events: PropTypes.object,
  linodes: PropTypes.object,
  eventSeen: PropTypes.func.isRequired,
};

Notifications.defaultProps = {
  open: false,
};
