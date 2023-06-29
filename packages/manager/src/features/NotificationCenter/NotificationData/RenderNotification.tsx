import { NotificationType } from '@linode/api-v4/lib/account';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { useTheme, styled } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import Box from '@mui/material/Box';
import { Link } from 'src/components/Link';
import { sanitizeHTML } from 'src/utilities/sanitize-html';
import { ExtendedNotification } from './useFormattedNotifications';

interface Props {
  notification: ExtendedNotification;
  onClose: () => void;
}

export type CombinedProps = Props;

export const RenderNotification: React.FC<Props> = (props) => {
  const theme = useTheme();
  const { notification, onClose } = props;

  const severity = notification.severity;

  const linkTarget = getEntityLinks(
    notification?.type,
    notification?.entity?.type,
    notification?.entity?.id
  );

  const sxMessage = {
    color: severity === 'critical' ? theme.color.red : undefined,
    marginLeft: notification.severity === 'minor' ? '1.25rem' : undefined,
  };

  const message = (
    <Typography
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(notification.message) }}
      sx={sxMessage}
    />
  );

  return (
    <>
      <Box
        data-test-id={notification.type}
        sx={{
          display: 'flex',
          alignItem: 'flex-start',
        }}
      >
        <Box
          sx={{
            paddingRight: theme.spacing(2),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              lineHeight: '1rem',
              '& svg': {
                height: '1.25rem',
                width: '1.25rem',
              },
            }}
          >
            {severity === 'critical' ? (
              <ErrorIcon
                sx={{
                  fill: theme.color.red,
                }}
                data-test-id={severity + 'Icon'}
              />
            ) : null}
            {severity === 'major' ? (
              <WarningIcon
                sx={{
                  fill: theme.palette.warning.dark,
                }}
                data-test-id={severity + 'Icon'}
              />
            ) : null}
          </Box>
        </Box>
        <Box>
          {/* If JSX has already been put together from interceptions in useFormattedNotifications.tsx, use that */}
          {notification.jsx ? (
            notification.jsx
          ) : linkTarget ? (
            <StyledLink to={linkTarget} onClick={onClose}>
              {message}
            </StyledLink>
          ) : (
            message
          )}
        </Box>
      </Box>
      <Divider />
    </>
  );
};

const StyledLink = styled(Link)<Partial<Props>>(({ theme, ...props }) => ({
  ...(props.notification?.severity === 'critical' && {
    color: `${theme.color.red} !important`,
    '&:hover': {
      textDecoration: `${theme.color.red} underline`,
    },
  }),
}));

const getEntityLinks = (
  notificationType?: NotificationType,
  entityType?: string,
  id?: number
) => {
  // Handle specific notification types
  if (notificationType === 'ticket_abuse') {
    return `/support/tickets/${id}`;
  }

  // The only entity.type we currently expect and can handle for is "linode"
  return entityType === 'linode' ? `/linodes/${id}` : null;
};

export default React.memo(RenderNotification);
