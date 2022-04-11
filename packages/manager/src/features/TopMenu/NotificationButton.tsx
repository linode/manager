import { Menu, MenuButton, MenuItems, MenuPopover } from '@reach/menu-button';
import * as React from 'react';
import Bell from 'src/assets/icons/notification.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import { NotificationDrawer } from 'src/features/NotificationCenter';
import useNotificationData from 'src/features/NotificationCenter/NotificationData/useNotificationData';
import { notificationContext as _notificationContext } from '../NotificationCenter/NotificationContext';
import { useStyles } from './iconStyles';
import TopMenuIcon from './TopMenuIcon';

const useMenuStyles = makeStyles((theme: Theme) => ({
  menuButton: {
    '&[data-reach-menu-button]': {
      margin: 0,
    },
    '& svg': {
      marginTop: 1,
    },
    '& span': {
      top: -1,
    },
  },
  menuPopover: {
    '&[data-reach-menu], &[data-reach-menu-popover]': {
      boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)',
      position: 'absolute',
      zIndex: 3000,
      width: 430,
      top: '50px !important',
      left: 'auto !important',
      right: 8,
      [theme.breakpoints.down('xs')]: {
        right: 0,
        width: '100%',
      },
      height: 'auto',
      maxHeight: 'calc(100% - 50px)',
      overflowX: 'hidden',
      overflowY: 'auto',
    },
  },
  menuItem: {
    boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)',
    '&[data-reach-menu-items]': {
      whiteSpace: 'initial',
      border: 'none',
      padding: 0,
    },
  },
}));

const menuId = 'notification-events-menu';

export const NotificationButton: React.FC<{}> = (_) => {
  const iconClasses = useStyles();
  const classes = useMenuStyles();

  const notificationContext = React.useContext(_notificationContext);
  const notificationData = useNotificationData();

  const numNotifications =
    notificationData.eventNotifications.filter(
      (thisEvent) => thisEvent.countInTotal
    ).length +
    notificationData.formattedNotifications.filter(
      (thisEvent) => thisEvent.countInTotal
    ).length;

  const handleNotificationButtonClick = () => {
    notificationContext.toggleDrawer();
  };

  const handleAnyClick = React.useCallback(
    (e: any) => {
      /**
       * Ignore clicks from inside the menu
       */
      if (e?.path.some((element: any) => element.id === menuId)) {
        return;
      }

      /**
       * Prevent the notification bell click event from being called
       * otherwise the menu will immediately re-open
       */
      e.stopImmediatePropagation();
      notificationContext.closeDrawer();
    },
    [notificationContext]
  );

  React.useEffect(() => {
    if (notificationContext.drawerOpen) {
      // eslint-disable-next-line
      document.addEventListener('click', handleAnyClick, true);

      // clean up the event when the component is re-rendered
      return () => document.removeEventListener('click', handleAnyClick, true);
    } else {
      return () => null;
    }
  }, [handleAnyClick, notificationContext.drawerOpen]);

  return (
    <Menu id={menuId}>
      <TopMenuIcon title="Notifications">
        <MenuButton
          className={`${iconClasses.icon} ${classes.menuButton}`}
          onClick={handleNotificationButtonClick}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
              notificationContext.closeDrawer();
            }
          }}
          aria-expanded={notificationContext.drawerOpen}
        >
          <Bell />
          {numNotifications > 0 ? (
            <span className={iconClasses.badge}>{numNotifications}</span>
          ) : null}
        </MenuButton>
      </TopMenuIcon>
      <MenuPopover
        className={classes.menuPopover}
        hidden={!notificationContext.drawerOpen}
      >
        <MenuItems className={classes.menuItem}>
          <NotificationDrawer
            open={notificationContext.drawerOpen}
            data={notificationData}
          />
        </MenuItems>
      </MenuPopover>
    </Menu>
  );
};

export default NotificationButton;
