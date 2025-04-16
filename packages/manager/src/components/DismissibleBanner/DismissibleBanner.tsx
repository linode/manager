import { CloseIcon, IconButton, Notice, Stack } from '@linode/ui';
import * as React from 'react';

import { useDismissibleNotifications } from 'src/hooks/useDismissibleNotifications';

import type { NoticeProps } from '@linode/ui';
import type { DismissibleNotificationOptions } from 'src/hooks/useDismissibleNotifications';

interface Props extends NoticeProps {
  /**
   * Optional element to pass to the banner to trigger actions
   */
  actionButton?: JSX.Element;
  /**
   * Additional controls to pass to the Dismissible Banner
   */
  options?: DismissibleNotificationOptions;
  /**
   * Used to check if this banner has already been dismissed
   */
  preferenceKey: string;
}

/**
 * ## Usage
 *
 * Banners appear between the top nav and page content and are a visual interruption of the normal page layout. Their use must be approved by all project stakeholders.
 *
 * ## Design
 * - Banners are dismissible using an 'X' icon.
 * - Consider adding a link to a doc or a guide for users to learn more.
 * - Banners should be considered as one part of a larger communications plan; messaging should be developed with the marketing team.
 *
 * ## Variants
 * Under the hood, banners use the [Notice](/docs/components-notifications-notices--success) component so they have the same variants such as:
 * - Success: Informs users of a new feature or improved service.
 * - Warning: Informs users of an impending change that will have an impact on their service(s).
 * - Call to action: Primary Button or text link allows a user to take action directly from the banner.
 */
export const DismissibleBanner = (props: Props) => {
  const { actionButton, children, options, preferenceKey, ...rest } = props;

  const { handleDismiss, hasDismissedBanner } = useDismissibleBanner(
    preferenceKey,
    options
  );

  if (hasDismissedBanner) {
    return null;
  }

  const dismissibleButton = (
    <IconButton
      aria-label={`Dismiss ${preferenceKey} banner`}
      data-testid="notice-dismiss"
      onClick={handleDismiss}
      sx={{ padding: 1, paddingRight: 2 }}
    >
      <CloseIcon />
    </IconButton>
  );

  return (
    <Notice
      bgcolor={(theme) => theme.palette.background.paper}
      display="flex"
      gap={1}
      justifyContent="space-between"
      {...rest}
    >
      {children}
      <Stack alignItems="center" direction="row" spacing={1}>
        {actionButton}
        {dismissibleButton}
      </Stack>
    </Notice>
  );
};

// Hook that contains the nuts-and-bolts of the DismissibleBanner component.
// Extracted out as its own hook so other components can use it.
export const useDismissibleBanner = (
  preferenceKey: string,
  options?: DismissibleNotificationOptions
) => {
  const { dismissNotifications, hasDismissedNotifications } =
    useDismissibleNotifications();

  const hasDismissedBanner = hasDismissedNotifications([preferenceKey]);

  const handleDismiss = () => {
    dismissNotifications([preferenceKey], options);
  };

  return { handleDismiss, hasDismissedBanner };
};
