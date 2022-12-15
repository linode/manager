import * as React from 'react';
import { useDispatch } from 'react-redux';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Events from 'src/features/NotificationCenter/Events';
import { NotificationData } from 'src/features/NotificationCenter/NotificationData/useNotificationData';
import { NotificationItem } from 'src/features/NotificationCenter/NotificationSection';
import Notifications from 'src/features/NotificationCenter/Notifications';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import useNotifications from 'src/hooks/useNotifications';
import usePrevious from 'src/hooks/usePrevious';
import { markAllSeen } from 'src/store/events/event.request';
import { ThunkDispatch } from 'src/store/types';
import { removeBlocklistedEvents } from 'src/utilities/eventUtils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: 20,
    paddingTop: theme.spacing(2),
    paddingBottom: 0,
  },
}));

export interface Props {
  data: NotificationData;
  open: boolean;
}

const isNotificationEventObj = (
  body: string | JSX.Element
): body is JSX.Element => {
  return typeof (body as JSX.Element) === typeof {};
};

/**
 * Filter notifications based on a list of filtered events.
 * NotificationItems may have a body containing a string or an event object.
 */
const filterNotifications = (eventNotifications: NotificationItem[]) => {
  // Extract events from notification items.
  const events = eventNotifications.map((notification: NotificationItem) => {
    return isNotificationEventObj(notification.body)
      ? notification.body?.props.event
      : notification.body;
  });
  const filteredEvents = removeBlocklistedEvents(events);

  // Include all notifications that are non-blocklisted events.
  return eventNotifications.filter((notification) => {
    return (
      (isNotificationEventObj(notification.body) &&
        filteredEvents.includes(notification.body.props.event)) ||
      !isNotificationEventObj(notification.body)
    );
  });
};

export const NotificationMenu: React.FC<Props> = (props) => {
  const {
    data: { eventNotifications, formattedNotifications },
    open,
  } = props;

  const classes = useStyles();
  const { dismissNotifications } = useDismissibleNotifications();
  const notifications = useNotifications();
  const dispatch = useDispatch<ThunkDispatch>();

  const wasOpen = usePrevious(open);

  const filteredEventNotifications = filterNotifications(eventNotifications);

  React.useEffect(() => {
    if (wasOpen && !open) {
      // User has closed the menu.
      dispatch(markAllSeen());
      dismissNotifications(notifications, { prefix: 'notificationMenu' });
    }
  }, [dismissNotifications, notifications, dispatch, open, wasOpen]);

  return (
    <Paper className={classes.root}>
      {open ? (
        <>
          <Notifications notificationsList={formattedNotifications} />
          <Events events={filteredEventNotifications} />
        </>
      ) : null}
    </Paper>
  );
};

export default React.memo(NotificationMenu);
