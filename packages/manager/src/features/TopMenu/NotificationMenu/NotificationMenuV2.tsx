import AutorenewIcon from '@mui/icons-material/Autorenew';
import { IconButton } from '@mui/material';
import Popover from '@mui/material/Popover';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import Bell from 'src/assets/icons/notification.svg';
import { Chip } from 'src/components/Chip';
import { EventsV2 } from 'src/features/NotificationCenter/EventsV2';
import {
  notificationContext as _notificationContext,
  menuButtonId,
} from 'src/features/NotificationCenter/NotificationContext';
import { useEventNotificationsV2 } from 'src/features/NotificationCenter/NotificationData/useEventNotificationsV2';
import { useFormattedNotifications } from 'src/features/NotificationCenter/NotificationData/useFormattedNotifications';
import Notifications from 'src/features/NotificationCenter/Notifications';
import { useDismissibleNotifications } from 'src/hooks/useDismissibleNotifications';
import { usePrevious } from 'src/hooks/usePrevious';
import { useNotificationsQuery } from 'src/queries/account/notifications';
import { useMarkEventsAsSeen } from 'src/queries/events/events';
import { rotate360 } from 'src/styles/keyframes';

import { TopMenuTooltip, topMenuIconButtonSx } from '../TopMenuTooltip';

import type { ThunkDispatch } from 'src/store/types';

export const NotificationMenuV2 = () => {
  const { dismissNotifications } = useDismissibleNotifications();
  const { data: notifications } = useNotificationsQuery();
  const formattedNotifications = useFormattedNotifications();
  const eventNotifications = useEventNotificationsV2();
  const notificationContext = React.useContext(_notificationContext);
  const { mutateAsync: markEventsAsSeen } = useMarkEventsAsSeen();

  const numNotifications =
    eventNotifications.filter(
      (notificationItem) => notificationItem.countInTotal
    ).length +
    formattedNotifications.filter(
      (notificationItem) => notificationItem.countInTotal
    ).length;
  const showInProgressEventIcon = eventNotifications.some(
    (notificationItem) => notificationItem.showProgress
  );

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

  const handleClose = () => {
    notificationContext.closeMenu();
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
    markEventsAsSeen,
  ]);

  const id = notificationContext.menuOpen ? 'notifications-popover' : undefined;

  return (
    <>
      <TopMenuTooltip title="Notifications">
        <IconButton
          sx={(theme) => ({
            ...topMenuIconButtonSx(theme),
            color: notificationContext.menuOpen ? '#606469' : '#c9c7c7',
          })}
          aria-describedby={id}
          aria-haspopup="true"
          aria-label="Notifications"
          id={menuButtonId}
          onClick={handleNotificationMenuToggle}
          ref={anchorRef}
        >
          <Bell height="20px" width="20px" />
          {numNotifications > 0 && (
            <StyledChip
              color="primary"
              data-testid="events-count-notification"
              label={numNotifications > 9 ? '9+' : numNotifications}
              showPlus={numNotifications > 9}
              size="small"
            />
          )}
          {showInProgressEventIcon && (
            <StyledAutorenewIcon data-testid="in-progress-event-icon" />
          )}
        </IconButton>
      </TopMenuTooltip>
      <Popover
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        slotProps={{
          paper: {
            sx: (theme) => ({
              maxHeight: 'calc(100vh - 150px)',
              maxWidth: 430,
              py: 2,
              [theme.breakpoints.down('sm')]: {
                left: '0 !important',
                minWidth: '100%',
                right: '0 !important',
              },
            }),
          },
        }}
        anchorEl={anchorRef.current}
        id={id}
        onClose={handleClose}
        open={notificationContext.menuOpen}
      >
        <Notifications />
        <EventsV2
          eventNotifications={eventNotifications}
          onCloseNotificationCenter={() => notificationContext.closeMenu()}
        />
      </Popover>
    </>
  );
};

const StyledChip = styled(Chip, {
  label: 'StyledEventNotificationChip',
  shouldForwardProp: (prop) => prop !== 'showPlus',
})<{ showPlus: boolean }>(({ theme, ...props }) => ({
  '& .MuiChip-label': {
    paddingLeft: 2,
    paddingRight: 2,
  },
  borderRadius: props.showPlus ? 12 : '50%',
  fontFamily: theme.font.bold,
  fontSize: '0.72rem',
  height: 18,
  justifyContent: 'center',
  left: 20,
  padding: 0,
  position: 'absolute',
  top: 0,
  width: props.showPlus ? 22 : 18,
}));

const StyledAutorenewIcon = styled(AutorenewIcon)(({ theme }) => ({
  animation: `${rotate360} 2s linear infinite`,
  bottom: 4,
  color: theme.palette.primary.main,
  fontSize: 18,
  position: 'absolute',
  right: 2,
}));
