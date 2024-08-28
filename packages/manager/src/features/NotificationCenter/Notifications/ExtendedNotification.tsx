import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { Typography } from 'src/components/Typography';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import { StyledLink } from '../NotificationCenter.styles';
import { getEntityLinks } from '../utils';

import type { FormattedNotificationProps } from '../useFormattedNotifications';

export interface ExtendedNotificationProps {
  notification: FormattedNotificationProps;
  onClose: () => void;
}

export const ExtendedNotification = (props: ExtendedNotificationProps) => {
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
      dangerouslySetInnerHTML={{
        __html: sanitizeHTML({
          sanitizingTier: 'flexible',
          text: notification.message,
        }),
      }}
      sx={sxMessage}
    />
  );

  return (
    <>
      <Box
        sx={{
          alignItem: 'flex-start',
          display: 'flex',
        }}
        data-test-id={notification.type}
      >
        <Box
          sx={{
            paddingRight: theme.spacing(2),
          }}
        >
          <Box
            sx={{
              '& svg': {
                height: '1.25rem',
                width: '1.25rem',
              },
              display: 'flex',
              lineHeight: '1rem',
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
            <StyledLink onClick={onClose} to={linkTarget}>
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
