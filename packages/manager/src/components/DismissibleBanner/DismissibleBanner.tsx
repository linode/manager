import Close from '@mui/icons-material/Close';
import Grid from '@mui/material/Unstable_Grid2';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { Box } from 'src/components/Box';
import {
  DismissibleNotificationOptions,
  useDismissibleNotifications,
} from 'src/hooks/useDismissibleNotifications';

import { StyledButton, StyledNotice } from './DismissibleBanner.styles';

import type { NoticeProps } from 'src/components/Notice/Notice';

interface Props {
  /**
   * Optional element to pass to the banner, good for triggering actions
   */
  actionButton?: JSX.Element;
  /**
   * Optional element to pass to the banner
   */
  children: JSX.Element;
  /**
   * Used to pass additional styles to the banner
   */
  className?: string;
  /**
   * Additional controls to pass to the Dismissible Banner
   */
  options?: DismissibleNotificationOptions;
  /**
   * Used for determining whether this banner has been dismissed or not
   */
  preferenceKey: string;
  /**
   * Additional styles to apply to the overall banner
   */
  sx?: SxProps;
}

type CombinedProps = Props & Partial<NoticeProps>;

/**
 * ## Usage
 *
 * Banners appear between the top nav and page content and are a visual interruption of the normal page layout. Their use must be approved by all project stakeholders.
 *
 * ## Design
 * - Banners are dismissible using an &rsquo;X&rsquo; icon.
 * - Consider adding a link to a doc or a guide for users to learn more.
 * - Banners should be considered as one part of a larger communications plan; messaging should be developed with the marketing team.
 *
 * ## Variants
 * Under the hood, banners use the [Notice](/docs/components-notifications-notices--success) component so they have the same variants such as:
 * - Success: Informs users of a new feature or improved service.
 * - Warning: Informs users of an impending change that will have an impact on their service(s).
 * - Call to action: Primary Button or text link allows a user to take action directly from the banner.
 */
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
