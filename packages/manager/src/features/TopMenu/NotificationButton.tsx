import { Menu, MenuButton, MenuItems, MenuPopover } from '@reach/menu-button';
import * as React from 'react';
import Bell from 'src/assets/icons/notification.svg';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { NotificationMenu } from 'src/features/NotificationCenter';
import {
  menuId,
  notificationContext as _notificationContext,
} from '../NotificationCenter/NotificationContext';
import { useStyles } from './iconStyles';
import TopMenuIcon from './TopMenuIcon';
import { useFormattedNotifications } from '../NotificationCenter/NotificationData/useFormattedNotifications';
import { useEventNotifications } from '../NotificationCenter/NotificationData/useEventNotifications';

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
      [theme.breakpoints.down('sm')]: {
        right: 0,
        width: '100%',
      },
      height: 'auto',
      maxHeight: 'calc(90% - 50px)',
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

export const NotificationButton = () => {
  const iconClasses = useStyles();
  const classes = useMenuStyles();

  const formattedNotifications = useFormattedNotifications();
  const eventNotifications = useEventNotifications();
  const notificationContext = React.useContext(_notificationContext);

  const numNotifications =
    eventNotifications.filter((thisEvent) => thisEvent.countInTotal).length +
    formattedNotifications.filter((thisEvent) => thisEvent.countInTotal).length;

  return (
    <Menu id={menuId}>
      <>
        <TopMenuIcon title="Notifications">
          <MenuButton
            aria-label="Notifications"
            className={`${iconClasses.icon} ${classes.menuButton} ${
              notificationContext.menuOpen ? iconClasses.hover : ''
            }`}
            onClick={
              notificationContext.menuOpen
                ? notificationContext.closeMenu
                : notificationContext.openMenu
            }
            onKeyDown={(e) =>
              e.key === 'Enter'
                ? notificationContext.menuOpen
                  ? notificationContext.closeMenu
                  : notificationContext.openMenu
                : null
            }
          >
            <Bell />
            {numNotifications > 0 ? (
              <div className={iconClasses.badge}>
                <p>{numNotifications}</p>
              </div>
            ) : null}
          </MenuButton>
        </TopMenuIcon>
        <MenuPopover className={classes.menuPopover}>
          <MenuItems className={classes.menuItem}>
            <NotificationMenu open={notificationContext.menuOpen} />
          </MenuItems>
        </MenuPopover>
      </>
    </Menu>
  );
};

export default NotificationButton;
