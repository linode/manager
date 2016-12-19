import React, { PropTypes } from 'react';
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
      return event._event.label.split(' ')[3];
    default:
      return event._event.label.split(' ')[2];
  }
}

function linodeNotificationMessage(event, linodes, objectType, tempText, doneText) {
  const linodeName = getLinodeName(event, linodes);
  const eventFinished = event.getProgress() === 100;

  return (
    <span>
      <span className="Notification-subject">
        {linodeName}
      </span>
      {objectType}&nbsp;
      {eventFinished ? doneText : tempText}&nbsp;
      {event._event.status === 'failed' ? 'failed' : ''}
    </span>
  );
}

function notificationMessage(event, linodes) {
  switch (event.getType()) {
    case Event.LINODE_REBOOT:
      return linodeNotificationMessage(event, linodes, 'Linode', 'rebooting', 'rebooted');
    case Event.LINODE_BOOT:
      return linodeNotificationMessage(event, linodes, 'Linode', 'booting', 'booted');
    case Event.LINODE_POWER_OFF:
      return linodeNotificationMessage(event, linodes, 'Linode', 'being shut down', 'shut down');
    case Event.LINODE_CREATE:
      return linodeNotificationMessage(event, linodes, 'Linode', 'provisioning', 'created');
    case Event.LINODE_DELETE:
      return linodeNotificationMessage(event, linodes, 'Linode', 'being deleted', 'deleted');

    case Event.LINODE_BACKUPS_ENABLE:
      return linodeNotificationMessage(event, linodes, 'Backups', 'enabled', 'enabled');
    case Event.LINODE_BACKUPS_DISABLE:
      return linodeNotificationMessage(event, linodes, 'Backups', 'disabled', 'disabled');

    case Event.LINODE_DISK_DELETE:
      return linodeNotificationMessage(event, linodes, 'Disk', 'being deleted', 'deleted');
    case Event.LINODE_DISK_CREATE:
      return linodeNotificationMessage(event, linodes, 'Disk', 'being created', 'created');
    case Event.LINODE_DISK_RESIZE:
      return linodeNotificationMessage(event, linodes, 'Disk', 'being resized', 'resized');

    default:
      return '';
  }
}

export function Notification(props) {
  const event = new Event(props);

  function handleNotificationClick() {
    if (props.read) {
      let page = `/linodes/${props.linode_id}`;

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

      return props.gotoPage(page);
    }

    return props.readNotification(props.id);
  }

  return (
    <div
      className={`Notification ${props.read ? '' : 'Notification--unseen'}`}
      onClick={handleNotificationClick}
    >
      <header className="Notification-header">
        <div className="Notification-text">{notificationMessage(event, props.linodes)}</div>
        <div className="Notification-time">
          {moment.utc(props.updated, moment.ISO_8601).fromNow()}
        </div>
      </header>
    </div>
  );
}

Notification.propTypes = {
  id: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  read: PropTypes.bool.isRequired,
  label_message: PropTypes.string.isRequired,
  readNotification: PropTypes.func.isRequired,
  gotoPage: PropTypes.func.isRequired,
  updated: PropTypes.string.isRequired,
  linode_id: PropTypes.number,
  nodebalancer_id: PropTypes.number,
  stackscript_id: PropTypes.number,
  linodes: PropTypes.object.isRequired,
};

export function sortNotifications(eventsDict) {
  const events = Object.values(eventsDict.events);
  if (!events.length) {
    return [];
  }

  events.sort((e1, e2) =>
    new Date(e2.updated) - new Date(e1.updated));
  return events;
}

export default function Notifications(props) {
  const {
    open, hideShowNotifications, readNotification, events, linodes, gotoPage,
  } = props;

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
          {sortNotifications(events).map((e, index) =>
            <Notification
              key={index}
              readNotification={readNotification}
              gotoPage={gotoPage}
              linodes={linodes}
              {...e}
            />)}
          <div className="Notifications-end text-xs-center">No more notifications.</div>
        </div>
      </div>
    </div>
  );
}

Notifications.propTypes = {
  open: PropTypes.bool.isRequired,
  hideShowNotifications: PropTypes.func.isRequired,
  readNotification: PropTypes.func.isRequired,
  gotoPage: PropTypes.func.isRequired,
  events: PropTypes.object,
  linodes: PropTypes.object,
};

Notifications.defaultProps = {
  open: false,
};
