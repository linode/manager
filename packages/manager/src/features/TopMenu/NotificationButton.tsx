import * as React from 'react';
import Bell from 'src/assets/icons/bell_new.svg';
import { NotificationDrawer } from 'src/features/NotificationCenter';
import useNotificationData from 'src/features/NotificationCenter/NotificationData/useNotificationData';
import { notificationContext as _notificationContext } from '../NotificationCenter/NotificationContext';
import { useStyles } from './iconStyles';

export const NotificationButton: React.FC<{}> = _ => {
  const notificationContext = React.useContext(_notificationContext);

  const classes = useStyles();

  const notificationData = useNotificationData();

  const numEvents =
    notificationData.community.events.length +
    notificationData.support.data.length +
    notificationData.pendingActions.length +
    notificationData.statusNotifications.length;

  return (
    <>
      <button
        aria-label="Notifications"
        className={classes.icon}
        onClick={notificationContext.openDrawer}
      >
        <Bell />
        {numEvents > 0 ? (
          <span className={classes.badge}>{numEvents}</span>
        ) : null}
      </button>
      <NotificationDrawer
        open={notificationContext.drawerOpen}
        onClose={notificationContext.closeDrawer}
        data={notificationData}
      />
    </>
  );
};

export default NotificationButton;
