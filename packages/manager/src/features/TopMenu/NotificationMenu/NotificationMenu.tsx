import * as React from 'react';
import { useDispatch } from 'react-redux';
import Bell from 'src/assets/icons/notification.svg';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { useStyles } from '../iconStyles';
import TopMenuIcon from '../TopMenuIcon';
import Notifications from 'src/features/NotificationCenter/Notifications';
import {
  menuId,
  menuButtonId,
  notificationContext as _notificationContext,
} from 'src/features/NotificationCenter/NotificationContext';
import { useFormattedNotifications } from 'src/features/NotificationCenter/NotificationData/useFormattedNotifications';
import { useEventNotifications } from 'src/features/NotificationCenter/NotificationData/useEventNotifications';
import MenuItem from 'src/components/MenuItem';
import Button from 'src/components/Button';
import ClickAwayListener from 'src/components/core/ClickAwayListener';
import MenuList from 'src/components/core/MenuList';
import Paper from 'src/components/core/Paper';
import Popper from 'src/components/core/Popper';
import Events from 'src/features/NotificationCenter/Events';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import { markAllSeen } from 'src/store/events/event.request';
import { ThunkDispatch } from 'src/store/types';
import { useNotificationsQuery } from 'src/queries/accountNotifications';
import usePrevious from 'src/hooks/usePrevious';

const useMenuStyles = makeStyles((theme: Theme) => ({
  menuButton: {
    margin: 0,
    padding: 0,
    minWidth: 'unset',
    '&&': {
      backgroundColor: 'unset',
    },
    '&:focus span, &:hover span': {
      color: '#606469',
    },
  },
  menuPopover: {
    boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)',
    zIndex: 3000,
    top: '50px !important',
    left: 'auto !important',
    right: 8,
    width: 430,
    maxHeight: 'calc(90% - 50px)',
    height: 'auto',
    // overflowX: 'hidden', // TODO: fix lack of menu scroll
    // overflowY: 'auto',
    [theme.breakpoints.down('sm')]: {
      right: 0,
      width: '100%',
    },
  },
  menuItem: {
    boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)',
    whiteSpace: 'initial',
    border: 'none',
    padding: 0,
    cursor: 'default',
  },
  menuPaper: {
    padding: 20,
    paddingTop: theme.spacing(2),
    paddingBottom: 0,
  },
  notificationIcon: {
    '&:first-of-type': {
      marginLeft: 0,
    },
  },
  focused: {
    color: '#606469',
  },
  unfocused: {
    color: '#c9c7c7',
  },
}));

export const NotificationMenu = () => {
  const iconClasses = useStyles();
  const classes = useMenuStyles();

  const { dismissNotifications } = useDismissibleNotifications();
  const { data: notifications } = useNotificationsQuery();
  const formattedNotifications = useFormattedNotifications();
  const eventNotifications = useEventNotifications();
  const notificationContext = React.useContext(_notificationContext);

  const numNotifications =
    eventNotifications.filter((thisEvent) => thisEvent.countInTotal).length +
    formattedNotifications.filter((thisEvent) => thisEvent.countInTotal).length;

  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const prevOpen = usePrevious(notificationContext.menuOpen);

  const dispatch = useDispatch<ThunkDispatch>();

  const handleNotificationMenuToggle = () => {
    if (!notificationContext.menuOpen) {
      notificationContext.openMenu();
    } else {
      notificationContext.closeMenu();
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

  const handleMenuListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      notificationContext.closeMenu();
      anchorRef.current!.focus(); // Refocus the notification menu button after the menu has closed.
    }
  };

  React.useEffect(() => {
    if (prevOpen && !notificationContext.menuOpen) {
      // Dismiss seen notifications after the menu has closed.
      dispatch(markAllSeen());
      dismissNotifications(notifications ?? [], { prefix: 'notificationMenu' });
    }
  }, [
    notificationContext.menuOpen,
    dismissNotifications,
    notifications,
    dispatch,
    prevOpen,
  ]);

  return (
    <>
      <TopMenuIcon title="Notifications">
        <Button
          id={menuButtonId}
          ref={anchorRef}
          aria-label="Notifications"
          aria-haspopup="true"
          onClick={handleNotificationMenuToggle}
          className={classes.menuButton}
          disableRipple
        >
          <span
            className={`${iconClasses.icon} ${classes.notificationIcon} ${
              notificationContext.menuOpen ? classes.focused : classes.unfocused
            }`}
          >
            <Bell />
            {numNotifications > 0 ? (
              <div className={iconClasses.badge}>
                <p>{numNotifications}</p>
              </div>
            ) : null}
          </span>
        </Button>
      </TopMenuIcon>
      <Popper
        open={notificationContext.menuOpen}
        anchorEl={anchorRef.current}
        className={classes.menuPopover}
        transition
        disablePortal
        style={{ position: 'absolute' }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <MenuList
            id={menuId}
            autoFocusItem={notificationContext.menuOpen}
            onKeyDown={handleMenuListKeyDown}
          >
            <MenuItem className={classes.menuItem} disableRipple>
              <Paper className={`${classes.menuPaper} ${classes.menuPopover}`}>
                <Notifications />
                <Events />
              </Paper>
            </MenuItem>
          </MenuList>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default NotificationMenu;
