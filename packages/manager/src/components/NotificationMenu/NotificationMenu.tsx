import * as React from 'react';
import { useDispatch } from 'react-redux';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Events from 'src/features/NotificationCenter/Events';
import { NotificationData } from 'src/features/NotificationCenter/NotificationData/useNotificationData';
import Notifications from 'src/features/NotificationCenter/Notifications';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import useNotifications from 'src/hooks/useNotifications';
import usePrevious from 'src/hooks/usePrevious';
import { markAllSeen } from 'src/store/events/event.request';
import { ThunkDispatch } from 'src/store/types';

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
          <Events events={eventNotifications} />
        </>
      ) : null}
    </Paper>
  );
};

export default React.memo(NotificationMenu);
