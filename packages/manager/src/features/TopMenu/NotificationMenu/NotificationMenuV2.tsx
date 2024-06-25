import AutorenewIcon from '@mui/icons-material/Autorenew';
import { IconButton } from '@mui/material';
import Popover from '@mui/material/Popover';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import Bell from 'src/assets/icons/notification.svg';
import { Box } from 'src/components/Box';
import { Chip } from 'src/components/Chip';
import { Divider } from 'src/components/Divider';
import { LinkButton } from 'src/components/LinkButton';
import { Typography } from 'src/components/Typography';
import {
  notificationContext as _notificationContext,
  menuButtonId,
} from 'src/features/NotificationCenter/NotificationContext';
import { RenderEventV2 } from 'src/features/NotificationCenter/NotificationData/RenderEventV2';
import { useFormattedNotifications } from 'src/features/NotificationCenter/NotificationData/useFormattedNotifications';
import Notifications from 'src/features/NotificationCenter/Notifications';
import { useDismissibleNotifications } from 'src/hooks/useDismissibleNotifications';
import { usePrevious } from 'src/hooks/usePrevious';
import { useNotificationsQuery } from 'src/queries/account/notifications';
import { isInProgressEvent } from 'src/queries/events/event.helpers';
import {
  useEventsInfiniteQuery,
  useMarkEventsAsSeen,
} from 'src/queries/events/events';
import { rotate360 } from 'src/styles/keyframes';

import { TopMenuTooltip, topMenuIconButtonSx } from '../TopMenuTooltip';

export const NotificationMenuV2 = () => {
  const history = useHistory();
  const { dismissNotifications } = useDismissibleNotifications();
  const { data: notifications } = useNotificationsQuery();
  const formattedNotifications = useFormattedNotifications();
  const notificationContext = React.useContext(_notificationContext);

  const { data, events } = useEventsInfiniteQuery();
  const { mutateAsync: markEventsAsSeen } = useMarkEventsAsSeen();

  const numNotifications =
    (events?.filter((event) => !event.seen).length ?? 0) +
    formattedNotifications.filter(
      (notificationItem) => notificationItem.countInTotal
    ).length;

  const showInProgressEventIcon = events?.some(isInProgressEvent);

  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const prevOpen = usePrevious(notificationContext.menuOpen);

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
      if (events && events.length >= 1 && !events[0].seen) {
        markEventsAsSeen(events[0].id);
      }
      dismissNotifications(notifications ?? [], { prefix: 'notificationMenu' });
    }
  }, [notificationContext.menuOpen]);

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
        <Box>
          <Box display="flex" justifyContent="space-between" px={2}>
            <Typography variant="h3">Events</Typography>
            <LinkButton
              onClick={() => {
                history.push('/events');
                handleClose();
              }}
            >
              View all events
            </LinkButton>
          </Box>
          <Divider spacingBottom={0} />
          {data?.pages[0].data.slice(0, 20).map((event) => (
            <RenderEventV2 event={event} key={event.id} onClose={handleClose} />
          ))}
        </Box>
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
