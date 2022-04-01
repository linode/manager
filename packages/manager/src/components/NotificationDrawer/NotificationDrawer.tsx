import * as React from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles, Theme } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import useNotifications from 'src/hooks/useNotifications';
import usePrevious from 'src/hooks/usePrevious';
import { markAllSeen } from 'src/store/events/event.request';
import { ThunkDispatch } from 'src/store/types';
import { NotificationData } from 'src/features/NotificationCenter/NotificationData/useNotificationData';
import Events from 'src/features/NotificationCenter/Events';
import Notifications from 'src/features/NotificationCenter/Notifications';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& .MuiDrawer-paper': {
      boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)',
      overflowX: 'hidden',
      padding: 20,
      paddingBottom: 0,
      top: 50,
      // Prevents the drawer from being aligned on the left since the it is anchored to the top
      left: 'auto',
      // Overrides the built-in animation so it matches the UserMenu
      transition: 'none !important',
      [theme.breakpoints.up('md')]: {
        maxHeight: 'calc(100% - 150px)',
        width: 430,
      },

      [theme.breakpoints.down('sm')]: {
        height: '100%',
      },
    },
  },
  notificationSectionContainer: {
    '& > div': {
      marginTop: theme.spacing(3),
      [theme.breakpoints.down('sm')]: {
        marginBottom: theme.spacing(3),
      },
    },
  },
}));

export interface Props {
  data: NotificationData;
  open: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { data, open, onClose } = props;
  const { eventNotifications, formattedNotifications } = data;
  const { dismissNotifications } = useDismissibleNotifications();
  const notifications = useNotifications();
  const dispatch = useDispatch<ThunkDispatch>();

  const wasOpen = usePrevious(open);

  React.useEffect(() => {
    if (wasOpen && !open) {
      // User has closed the drawer.
      dispatch(markAllSeen());
      dismissNotifications(notifications, { prefix: 'notificationDrawer' });
    }
  }, [dismissNotifications, notifications, dispatch, open, wasOpen]);

  return (
    <Drawer
      className={classes.root}
      open={open}
      onClose={onClose}
      title="Notification Drawer"
      isNotificationDrawer
    >
      <div className={classes.notificationSectionContainer}>
        <Notifications
          notificationsList={formattedNotifications}
          onClose={onClose}
        />
        <Events events={eventNotifications} onClose={onClose} />
      </div>
    </Drawer>
  );
};

export default React.memo(NotificationDrawer);
