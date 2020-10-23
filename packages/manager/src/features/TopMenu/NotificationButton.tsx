import * as React from 'react';
import Bell from 'src/assets/icons/bell_new.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import { NotificationDrawer } from 'src/features/NotificationCenter';
import useNotificationData from 'src/features/NotificationCenter/NotificationData/useNotificationData';
import { notificationContext as _notificationContext } from '../NotificationCenter/NotificationContext';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    order: 3,
    width: 74,
    height: 34,
    padding: `0px ${theme.spacing(2)}`,
    backgroundColor: theme.cmrBGColors.bgSecondaryButton,
    border: `1px solid ${theme.cmrBorderColors.borderNotificationCenter}`,
    borderRadius: 3,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'space-around',
    cursor: 'pointer',
    '& svg': {
      color: theme.cmrTextColors.textAction
    }
  },
  text: {
    color: theme.cmrTextColors.textAction,
    fontSize: 16,
    lineHeight: 1.25
  }
}));

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
        onClick={notificationContext.openDrawer}
        className={classes.root}
        aria-label="Click to view notifications drawer"
      >
        <Bell aria-hidden />
        <strong className={classes.text}>{numEvents}</strong>
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
