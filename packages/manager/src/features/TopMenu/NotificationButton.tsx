import * as React from 'react';
import Bell from 'src/assets/icons/notification.svg';
import { NotificationDrawer } from 'src/features/NotificationCenter';
import useNotificationData from 'src/features/NotificationCenter/NotificationData/useNotificationData';
import { notificationContext as _notificationContext } from '../NotificationCenter/NotificationContext';
import { useStyles } from './iconStyles';
import TopMenuIcon from './TopMenuIcon';

export const NotificationButton: React.FC<{}> = (_) => {
  const notificationContext = React.useContext(_notificationContext);

  const classes = useStyles();

  const notificationData = useNotificationData();

  const numNotifications =
    notificationData.eventNotifications.filter(
      (thisEvent) => thisEvent.countInTotal
    ).length +
    notificationData.formattedNotifications.filter(
      (thisEvent) => thisEvent.countInTotal
    ).length;

  return (
    <>
      <button
        aria-label="Notifications"
        className={classes.icon}
        onClick={notificationContext.openDrawer}
      >
        <TopMenuIcon title="Notifications">
          <Bell />
        </TopMenuIcon>
        {numNotifications > 0 ? (
          <span className={classes.badge}>{numNotifications}</span>
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
