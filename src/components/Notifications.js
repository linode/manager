import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';

function pastTensify(verb) {
  // TODO: complete this

  // Special cases:
  if (verb === 'shutdown') {
    // Pulled from power dropdown
    return 'powered off';
  } else if (verb === 'boot') {
    // Pulled from power dropdown
    return 'powered on';
  } else if (verb === 'scheduled') {
    return 'was scheduled';
  }

  if (verb.charAt(verb.length - 1) === 'e') {
    return `${verb}d`;
  } else if (verb.lastIndexOf('ed') === verb.length - 2) {
    return verb;
  }

  return `${verb}ed`;
}

function notificationCategoryAndAction(event) {
  return event.event_type.split('_').map(s => s.toLowerCase());
}

function notificationTitle(event) {
  // TODO: more consistent wording
  const [category, action] = notificationCategoryAndAction(event);

  if (event.linode_id) {
    if (category === 'linode') {
      return `Linode ${pastTensify(action)}`;
    } else if (category === 'disk') {
      return `Disk ${pastTensify(action)}`;
    } else if (category === 'backups') {
      return `Backups ${pastTensify(action)}`;
    }
  } else if (event.nodebalancer_id) {
    // TODO: support nodebalancer events
  } else if (event.stackscript_id) {
    // TODO: support stackscript events
  }

  return '';
}

function notificationMessage(event) {
  // TODO: more consistent wording
  const hostJobTitle = event.label;
  const [category, action] = notificationCategoryAndAction(event);

  if (event.linode_id) {
    const linodeIfCached = event.linodes.linodes[event.linode_id];
    const linodeName = linodeIfCached && linodeIfCached.label || hostJobTitle.split(' ')[2];
    if (category === 'linode') {
      return (
        <span>
          The requested {action} for <span className="Notification-subject">{linodeName}</span>
          &nbsp;{pastTensify(event.status)} successfully.
        </span>
      );
    } else if (category === 'disk') {
      return (
        <span>
          The requested disk {action} for <span className="Notification-subject">{linodeName}</span>
          &nbsp;{pastTensify(event.status)} successfully.
        </span>
      );
    } else if (category === 'backups') {
      return (
        <span>
          Backups for <span className="Notification-subject">{linodeName}</span>
          &nbsp;were {pastTensify(action)} sucessfully.
        </span>
      );
    }
  } if (event.nodebalancer_id) {
    // TODO: support nodebalancer events
  } else if (event.stackscript_id) {
    // TODO: support stackscript events
  }

  return '';
}

export function Notification(props) {
  function handleNotificationClick() {
    if (props.read) {
      let page = `/linodes/${props.linode_id}`;

      if (props.linode_id) {
        const [category] = notificationCategoryAndAction(props);
        if (category === 'backups') {
          page = `${page}/backups`;
        } else if (category === 'disk') {
          page = `${page}/settings/advanced`;
        }
      } else if (props.stackscript_id) {
        page = `/stackscripts/${props.stackscript_id}`;
      } else if (props.nodebalancer_id) {
        page = `/nodebalancer/${props.nodebalancer_id}`;
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
      <header className="Notification-header clearfix">
        <div className="Notification-title float-xs-left">{notificationTitle(props)}</div>
        <div className="Notification-time float-xs-right">
          {moment.utc(props.updated, moment.ISO_8601).fromNow()}
        </div>
      </header>
      <div className="Notification-text">{notificationMessage(props)}</div>
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
};

function sortNotifications(eventsDict) {
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
