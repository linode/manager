import { useNotificationsQuery } from '@linode/queries';
import { Box, Chip, Divider, Typography, rotate360 } from '@linode/ui';
import { usePrevious } from '@linode/utilities';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { IconButton } from '@mui/material';
import Popover from '@mui/material/Popover';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import Bell from 'src/assets/icons/notification.svg';
import { LinkButton } from 'src/components/LinkButton';
import { NotificationCenterEvent } from 'src/features/NotificationCenter/Events/NotificationCenterEvent';
import {
  notificationCenterContext as _notificationContext,
  menuButtonId,
} from 'src/features/NotificationCenter/NotificationCenterContext';
import { NotificationCenterNotificationsContainer } from 'src/features/NotificationCenter/Notifications/NotificationCenterNotificationsContainer';
import { useFormattedNotifications } from 'src/features/NotificationCenter/useFormattedNotifications';
import { useDismissibleNotifications } from 'src/hooks/useDismissibleNotifications';
import { isInProgressEvent } from 'src/queries/events/event.helpers';
import {
  useEventsInfiniteQuery,
  useMarkEventsAsSeen,
} from 'src/queries/events/events';

import { TopMenuTooltip, topMenuIconButtonSx } from '../TopMenuTooltip';

export const NotificationMenu = () => {
  const history = useHistory();
  const { dismissNotifications } = useDismissibleNotifications();
  const { data: notifications } = useNotificationsQuery();
  const formattedNotifications = useFormattedNotifications();
  const notificationContext = React.useContext(_notificationContext);

  const { data } = useEventsInfiniteQuery();

  // Just use the first page of events because we `slice` to get the first 20 events anyway
  const events = data?.pages[0].data ?? [];

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
  }, [
    notificationContext.menuOpen,
    events,
    notifications,
    markEventsAsSeen,
    dismissNotifications,
    prevOpen,
  ]);

  const id = notificationContext.menuOpen ? 'notifications-popover' : undefined;

  return (
    <>
      <TopMenuTooltip title="Notifications">
        <IconButton
          sx={(theme) => ({
            ...topMenuIconButtonSx(theme),
            color: notificationContext.menuOpen
              ? theme.tokens.component.GlobalHeader.Icon.Active
              : theme.tokens.component.GlobalHeader.Icon.Default,
          })}
          aria-describedby={id}
          aria-haspopup="true"
          aria-label="Notifications"
          disableRipple
          id={menuButtonId}
          onClick={handleNotificationMenuToggle}
          ref={anchorRef}
        >
          <Bell height="24px" width="24px" />
          {numNotifications > 0 && (
            <StyledChip
              adjustBorderRadius={
                numNotifications > 9 || showInProgressEventIcon
              }
              icon={
                Boolean(showInProgressEventIcon) ? (
                  <StyledAutorenewIcon data-testid="in-progress-event-icon" />
                ) : undefined
              }
              color="error"
              data-testid="events-count-notification"
              label={numNotifications > 9 ? '9+' : numNotifications}
              size="small"
            />
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
        data-qa-notification-menu
        id={id}
        onClose={handleClose}
        open={notificationContext.menuOpen}
      >
        <NotificationCenterNotificationsContainer />
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

          {events.length > 0 ? (
            events
              .slice(0, 20)
              .map((event) => (
                <NotificationCenterEvent
                  event={event}
                  key={event.id}
                  onClose={handleClose}
                />
              ))
          ) : (
            <Box pt={2} px={2}>
              No recent events to display
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

const StyledChip = styled(Chip, {
  label: 'StyledEventNotificationChip',
  shouldForwardProp: (prop) => prop !== 'adjustBorderRadius',
})<{ adjustBorderRadius: boolean }>(({ theme, ...props }) => ({
  '& .MuiChip-icon': {
    margin: 0,
    marginLeft: theme.tokens.spacing.S2,
  },
  '& .MuiChip-label': {
    padding: 0,
  },
  backgroundColor: theme.tokens.component.GlobalHeader.Badge.Background,
  borderRadius: props.adjustBorderRadius ? theme.tokens.spacing.S12 : '50%',
  color: theme.tokens.component.GlobalHeader.Badge.Text,
  flexDirection: 'row-reverse',
  font: theme.tokens.alias.Typography.Label.Bold.Xs,
  justifyContent: 'center',
  left: 20,
  padding: `${theme.tokens.spacing.S4} ${theme.tokens.spacing.S6}`,
  position: 'absolute',
  top: '-3px',
}));

export const StyledAutorenewIcon = styled(AutorenewIcon)(({ theme }) => ({
  animation: `${rotate360} 2s linear infinite`,
  fill: theme.tokens.component.GlobalHeader.Badge.Icon,
  height: '12px',
  width: '12px',
}));
