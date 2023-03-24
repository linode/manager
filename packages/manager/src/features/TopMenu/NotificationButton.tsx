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
import MenuItem from 'src/components/MenuItem';
import Button from 'src/components/Button';
import ClickAwayListener from 'src/components/core/ClickAwayListener';
import MenuList from 'src/components/core/MenuList';
import Popper from 'src/components/core/Popper';

const useMenuStyles = makeStyles((theme: Theme) => ({
  menuButton: {
    margin: 0,
    '& svg': {
      marginTop: 1,
    },
    '& span': {
      top: -1,
    },
  },
  menuPopover: {
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
      height: 'auto',
      maxHeight: 'calc(90% - 50px)',
      overflowX: 'hidden',
      overflowY: 'auto',
    },
  },
  menuItem: {
    boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)',
    whiteSpace: 'initial',
    border: 'none',
    padding: 0,
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

  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const prevOpen = React.useRef(notificationContext.menuOpen);

  const handleNotificationMenuToggle = () => {
    if (notificationContext.menuOpen) {
      notificationContext.closeMenu();
    } else {
      notificationContext.openMenu();
    }
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    notificationContext.closeMenu();
  };

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      notificationContext.closeMenu();
    } else if (event.key === 'Escape') {
      notificationContext.closeMenu();
    }
  };

  // Refocus the notification menu button after menu has closed.
  React.useEffect(() => {
    if (prevOpen.current && !notificationContext.menuOpen) {
      anchorRef.current!.focus();
    }

    prevOpen.current = notificationContext.menuOpen;
  }, [notificationContext.menuOpen]);

  return (
    <>
      <TopMenuIcon title="Notifications">
        <Button
          ref={anchorRef}
          aria-label="Notifications"
          aria-haspopup="true"
          aria-expanded={notificationContext.menuOpen ? 'true' : undefined}
          onClick={handleNotificationMenuToggle}
          className={`${iconClasses.icon} ${classes.menuButton} ${
            notificationContext.menuOpen ? iconClasses.hover : ''
          }`}
        >
          <Bell />
          {numNotifications > 0 ? (
            <div className={iconClasses.badge}>
              <p>{numNotifications}</p>
            </div>
          ) : null}
        </Button>
      </TopMenuIcon>
      <Popper
        open={notificationContext.menuOpen}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        className={classes.menuPopover}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <MenuList
            autoFocusItem={notificationContext.menuOpen}
            id={menuId}
            onKeyDown={handleListKeyDown}
          >
            <MenuItem className={classes.menuItem}>
              <NotificationMenu open={notificationContext.menuOpen} />
            </MenuItem>
          </MenuList>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default NotificationButton;
