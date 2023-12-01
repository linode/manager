import Popper from '@mui/material/Popper';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import Bell from 'src/assets/icons/notification.svg';
import { Button } from 'src/components/Button/Button';
import { ClickAwayListener } from 'src/components/ClickAwayListener';
import { WrapperMenuItem } from 'src/components/MenuItem/MenuItem';
import { MenuList } from 'src/components/MenuList';
import { Paper } from 'src/components/Paper';
import Events from 'src/features/NotificationCenter/Events';
import {
  notificationContext as _notificationContext,
  menuButtonId,
  menuId,
} from 'src/features/NotificationCenter/NotificationContext';
import { useEventNotifications } from 'src/features/NotificationCenter/NotificationData/useEventNotifications';
import { useFormattedNotifications } from 'src/features/NotificationCenter/NotificationData/useFormattedNotifications';
import Notifications from 'src/features/NotificationCenter/Notifications';
import { useDismissibleNotifications } from 'src/hooks/useDismissibleNotifications';
import { usePrevious } from 'src/hooks/usePrevious';
import { useNotificationsQuery } from 'src/queries/accountNotifications';
import { useMarkEventsAsSeen } from 'src/queries/events';
import { ThunkDispatch } from 'src/store/types';
import { omittedProps } from 'src/utilities/omittedProps';

import { StyledTopMenuIconWrapper, TopMenuIcon } from '../TopMenuIcon';

const NotificationIconWrapper = styled(StyledTopMenuIconWrapper, {
  label: 'NotificationIconWrapper',
  shouldForwardProp: omittedProps(['isMenuOpen']),
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
  const { mutateAsync: markEventsAsSeen } = useMarkEventsAsSeen();

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
      if (eventNotifications.length > 0) {
        markEventsAsSeen(eventNotifications[0].eventId);
      }
      dismissNotifications(notifications ?? [], { prefix: 'notificationMenu' });
    }
  }, [
    notificationContext.menuOpen,
    dismissNotifications,
    eventNotifications,
    notifications,
    dispatch,
    prevOpen,
  ]);

  return (
    <>
      <TopMenuIcon title="Notifications">
        <Button
          sx={{
            '&:hover': {
              backgroundColor: 'unset',
            },
            margin: 0,
            minWidth: 'unset',
            padding: 0,
          }}
          aria-haspopup="true"
          aria-label="Notifications"
          disableRipple
          id={menuButtonId}
          onClick={handleNotificationMenuToggle}
          ref={anchorRef}
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
        sx={{
          boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)',
          left: 'auto !important',
          maxHeight: 'calc(100vh - 150px)',
          overflowY: 'auto',
          position: 'absolute !important',
          right: '15px',
          [theme.breakpoints.down('sm')]: {
            right: 0,
            width: '100%',
          },
          top: '50px !important',
          width: '430px',
          zIndex: 3000,
        }}
        anchorEl={anchorRef.current}
        disablePortal
        open={notificationContext.menuOpen}
        transition
      >
        <ClickAwayListener onClickAway={handleClose}>
          <MenuList
            autoFocusItem={notificationContext.menuOpen}
            id={menuId}
            onKeyDown={handleMenuListKeyDown}
          >
            <WrapperMenuItem
              sx={{
                border: 'none',
                boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)',
                cursor: 'default',
                display: 'block',
                padding: 0,
                whiteSpace: 'initial',
              }}
              disableRipple
            >
              <Paper
                sx={{
                  padding: `${theme.spacing(2)} 0 0 0`,
                  paddingBottom: 0,
                }}
              >
                <Notifications />
                <Events />
              </Paper>
            </WrapperMenuItem>
          </MenuList>
        </ClickAwayListener>
      </Popper>
    </>
  );
};
