import * as React from 'react';
import { useDispatch } from 'react-redux';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Events from 'src/features/NotificationCenter/Events';
import Notifications from 'src/features/NotificationCenter/Notifications';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import usePrevious from 'src/hooks/usePrevious';
import { markAllSeen } from 'src/store/events/event.request';
import { ThunkDispatch } from 'src/store/types';
import { useNotificationsQuery } from 'src/queries/accountNotifications';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: 20,
    paddingTop: theme.spacing(2),
    paddingBottom: 0,
  },
}));

export interface Props {
  open: boolean;
}

export const NotificationMenu = (props: Props) => {
  const { open } = props;

  const classes = useStyles();
  const { dismissNotifications } = useDismissibleNotifications();
  const { data: notifications } = useNotificationsQuery();
  const dispatch = useDispatch<ThunkDispatch>();

  const wasOpen = usePrevious(open);

  React.useEffect(() => {
    if (wasOpen && !open) {
      // User has closed the menu.
      dispatch(markAllSeen());
      dismissNotifications(notifications ?? [], { prefix: 'notificationMenu' });
    }
  }, [dismissNotifications, notifications, dispatch, open, wasOpen]);

  return (
    <Paper className={classes.root}>
      {open ? (
        <>
          <Notifications />
          <Events />
        </>
      ) : null}
    </Paper>
  );
};

export default React.memo(NotificationMenu);
