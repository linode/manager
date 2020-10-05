import * as React from 'react';
import Bell from 'src/assets/icons/bell_new.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import { NotificationDrawer } from 'src/features/NotificationCenter';
import useNotificationData from 'src/features/NotificationCenter/NotificationData/useNotificationData';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    order: 3,
    width: 74,
    height: 34,
    padding: `0px theme.spacing(2)`,
    backgroundColor: theme.bg.lightBlue, // '#e5f1ff',
    border: 'none',
    borderRadius: 3,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'space-around',
    cursor: 'pointer'
  },
  text: {
    color: '#3683dc',
    fontSize: 16,
    lineHeight: 1.25
  }
}));

export const NotificationButton: React.FC<{}> = _ => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const classes = useStyles();

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const notificationData = useNotificationData();

  const numEvents =
    notificationData.community.events.length +
    notificationData.support.data.length +
    notificationData.pendingActions.length +
    notificationData.statusNotifications.length;

  return (
    <>
      <button
        onClick={openDrawer}
        className={classes.root}
        aria-label="Click to view notifications drawer"
      >
        <Bell aria-hidden />
        <strong className={classes.text}>{numEvents}</strong>
      </button>
      <NotificationDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        data={notificationData}
      />
    </>
  );
};

export default NotificationButton;
