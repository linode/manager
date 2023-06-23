import Close from '@mui/icons-material/Close';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import * as React from 'react';
import type { NoticeProps } from 'src/components/Notice/Notice';
import { Notice } from 'src/components/Notice/Notice';
import Box from 'src/components/core/Box';
import useDismissibleNotifications, {
  DismissibleNotificationOptions,
} from 'src/hooks/useDismissibleNotifications';

interface Props {
  preferenceKey: string;
  children: JSX.Element;
  className?: string;
  options?: DismissibleNotificationOptions;
  sx?: SxProps;
  actionButton?: JSX.Element;
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
        onClick={handleDismiss}
        data-testid="notice-dismiss"
      >
        <Close />
      </StyledButton>
    </Grid>
  );

  return (
    <StyledNotice className={className} {...rest}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        {children}
        <Box display="flex" alignItems="center">
          {actionButton}
          {dismissibleButton}
        </Box>
      </Box>
    </StyledNotice>
  );
};

export default DismissibleBanner;

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
