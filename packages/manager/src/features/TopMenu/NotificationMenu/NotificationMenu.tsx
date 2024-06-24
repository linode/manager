// TODO eventMessagesV2: delete when flag is removed
import { IconButton } from '@mui/material';
import Popover from '@mui/material/Popover';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import Bell from 'src/assets/icons/notification.svg';
import { Chip } from 'src/components/Chip';
import Events from 'src/features/NotificationCenter/Events';
import {
  notificationContext as _notificationContext,
  menuButtonId,
} from 'src/features/NotificationCenter/NotificationContext';
import { useEventNotifications } from 'src/features/NotificationCenter/NotificationData/useEventNotifications';
import { useFormattedNotifications } from 'src/features/NotificationCenter/NotificationData/useFormattedNotifications';
import Notifications from 'src/features/NotificationCenter/Notifications';
import { useDismissibleNotifications } from 'src/hooks/useDismissibleNotifications';
import { usePrevious } from 'src/hooks/usePrevious';
import { useNotificationsQuery } from 'src/queries/account/notifications';
import { useMarkEventsAsSeen } from 'src/queries/events/events';
import { ThunkDispatch } from 'src/store/types';

import { TopMenuTooltip, topMenuIconButtonSx } from '../TopMenuTooltip';

const StyledChip = styled(Chip)(() => ({
  '& .MuiChip-label': {
    paddingLeft: 2,
    paddingRight: 2,
  },
  fontSize: '0.72rem',
  height: '1rem',
  justifyContent: 'center',
  left: 20,
  padding: 0,
  position: 'absolute',
  top: 4,
}));

export const NotificationMenu = () => {
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
            <StyledChip color="success" label={numNotifications} size="small" />
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
        <Events />
      </Popover>
    </>
  );
};
