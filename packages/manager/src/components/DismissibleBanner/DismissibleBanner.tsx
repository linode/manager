import Close from '@mui/icons-material/Close';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Notice } from 'src/components/Notice/Notice';
import {
  DismissibleNotificationOptions,
  useDismissibleNotifications,
} from 'src/hooks/useDismissibleNotifications';

import type { NoticeProps } from 'src/components/Notice/Notice';

interface Props {
  actionButton?: JSX.Element;
  children: JSX.Element;
  className?: string;
  options?: DismissibleNotificationOptions;
  preferenceKey: string;
  sx?: SxProps;
}

type CombinedProps = Props & Partial<NoticeProps>;

export const DismissibleBanner = (props: CombinedProps) => {
  const {
    actionButton,
    children,
    className,
    options,
    preferenceKey,
    ...rest
  } = props;

  const { handleDismiss, hasDismissedBanner } = useDismissibleBanner(
    preferenceKey,
    options
  );

  if (hasDismissedBanner) {
    return null;
  }

  const dismissibleButton = (
    <Grid>
      <StyledButton
        aria-label={`Dismiss ${preferenceKey} banner`}
        data-testid="notice-dismiss"
        onClick={handleDismiss}
      >
        <Close />
      </StyledButton>
    </Grid>
  );

  return (
    <StyledNotice className={className} {...rest}>
      <Box
        alignItems="center"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        {children}
        <Box alignItems="center" display="flex">
          {actionButton}
          {dismissibleButton}
        </Box>
      </Box>
    </StyledNotice>
  );
};

// Hook that contains the nuts-and-bolts of the DismissibleBanner component.
// Extracted out as its own hook so other components can use it.
export const useDismissibleBanner = (
  preferenceKey: string,
  options?: DismissibleNotificationOptions
) => {
  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

  const hasDismissedBanner = hasDismissedNotifications([preferenceKey]);

  const handleDismiss = () => {
    dismissNotifications([preferenceKey], options);
  };

  return { handleDismiss, hasDismissedBanner };
};

const StyledNotice = styled(Notice)(({ theme }) => ({
  '&&': {
    p: {
      lineHeight: '1.25rem',
    },
  },
  alignItems: 'center',
  background: theme.bg.bgPaper,
  borderRadius: 1,
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(),
  padding: theme.spacing(2),
}));

const StyledButton = styled('button')(({ theme }) => ({
  ...theme.applyLinkStyles,
  color: theme.textColors.tableStatic,
  display: 'flex',
  marginLeft: 20,
}));
