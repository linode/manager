import * as React from 'react';
import { useDispatch } from 'react-redux';
import Bell from 'src/assets/icons/notification.svg';
import { useTheme, styled } from '@mui/material/styles';
import TopMenuIcon, { StyledTopMenuIconWrapper } from '../TopMenuIcon';
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
import Popper from '@mui/material/Popper';
import Events from 'src/features/NotificationCenter/Events';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import { markAllSeen } from 'src/store/events/event.request';
import { ThunkDispatch } from 'src/store/types';
import { useNotificationsQuery } from 'src/queries/accountNotifications';
import usePrevious from 'src/hooks/usePrevious';
import { isPropValid } from 'src/utilities/isPropValid';

const NotificationIconWrapper = styled(StyledTopMenuIconWrapper, {
  label: 'NotificationIconWrapper',
  shouldForwardProp: (prop) => isPropValid(['isMenuOpen'], prop),
})<{
  isMenuOpen: boolean;
}>(({ ...props }) => ({
  color: props.isMenuOpen ? '#606469' : '#c9c7c7',
}));

const NotificationIconBadge = styled('div')(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.color.green,
  borderRadius: '50%',
  color: 'white',
  display: 'flex',
  fontSize: '0.72rem',
  height: '1rem',
  justifyContent: 'center',
  left: 20,
  position: 'absolute',
  top: 2,
  width: '1rem',
}));

export const NotificationMenu = () => {
  const theme = useTheme();

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
          sx={{
            margin: 0,
            padding: 0,
            minWidth: 'unset',
            '&:hover': {
              backgroundColor: 'unset',
            },
          }}
          disableRipple
        >
          <NotificationIconWrapper isMenuOpen={notificationContext.menuOpen}>
            <Bell />
            {numNotifications > 0 ? (
              <NotificationIconBadge>{numNotifications}</NotificationIconBadge>
            ) : null}
          </NotificationIconWrapper>
        </Button>
      </TopMenuIcon>

      <Popper
        open={notificationContext.menuOpen}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        sx={{
          boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)',
          zIndex: 3000,
          top: '50px !important',
          left: 'auto !important',
          right: '15px',
          width: '430px',
          position: 'absolute !important',
          maxHeight: 'calc(100vh - 150px)',
          overflowY: 'auto',
          [theme.breakpoints.down('sm')]: {
            right: 0,
            width: '100%',
          },
        }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <MenuList
            id={menuId}
            autoFocusItem={notificationContext.menuOpen}
            onKeyDown={handleMenuListKeyDown}
          >
            <MenuItem
              sx={{
                boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)',
                whiteSpace: 'initial',
                border: 'none',
                padding: 0,
                cursor: 'default',
                display: 'block',
              }}
              disableRipple
            >
              <Paper
                sx={{
                  padding: '20px',
                  paddingTop: theme.spacing(2),
                  paddingBottom: 0,
                }}
              >
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
