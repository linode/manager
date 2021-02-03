import * as React from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles, Theme } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import usePrevious from 'src/hooks/usePrevious';
import { markAllSeen } from 'src/store/events/event.request';
import { ThunkDispatch } from 'src/store/types';
import { NotificationData } from './NotificationData/useNotificationData';
import Events from './Events';
import Notifications from './Notifications';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& .MuiDrawer-paper': {
      [theme.breakpoints.up('md')]: {
        width: 620
      },
      overflowX: 'hidden'
    }
  },
  notificationSectionContainer: {
    '& > div': {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3)
    }
  },
  actionHeader: {
    display: 'flex',
    paddingBottom: theme.spacing(),
    justifyContent: 'flex-end',
    borderBottom: `solid 1px ${theme.palette.divider}`,
    marginBottom: theme.spacing(3)
  }
}));

interface Props {
  data: NotificationData;
  open: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<Props> = props => {
  const { data, open, onClose } = props;
  const classes = useStyles();
  const dispatch = useDispatch<ThunkDispatch>();
  const { eventNotifications, formattedNotifications } = data;

  const wasOpen = usePrevious(open);

  React.useEffect(() => {
    if (wasOpen && !open) {
      // User has closed the drawer.
      dispatch(markAllSeen());
    }
  }, [dispatch, open, wasOpen]);

  return (
    <Drawer open={open} onClose={onClose} title="" className={classes.root}>
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
