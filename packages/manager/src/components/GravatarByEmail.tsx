import Avatar from '@mui/material/Avatar';
import * as React from 'react';

import UserIcon from 'src/assets/icons/account.svg';
import { sendHasGravatarEvent } from 'src/utilities/analytics/customEventAnalytics';
import { waitForAdobeAnalyticsToBeLoaded } from 'src/utilities/analytics/utils';
import { getGravatarUrl } from 'src/utilities/gravatar';

export const DEFAULT_AVATAR_SIZE = 28;

interface Props {
  /**
   * Captures a "has gravatar" event when when the component is mounted
   * @default false
   */
  captureAnalytics?: boolean;
  className?: string;
  email: string;
  height?: number;
  width?: number;
}

export const GravatarByEmail = (props: Props) => {
  const {
    captureAnalytics,
    className,
    email,
    height = DEFAULT_AVATAR_SIZE,
    width = DEFAULT_AVATAR_SIZE,
  } = props;

  const url = getGravatarUrl(email);

  React.useEffect(() => {
    if (captureAnalytics) {
      checkForGravatarAndSendEvent(url);
    }
  }, []);

  return (
    <Avatar
      alt={`Avatar for user ${email}`}
      className={className}
      src={url}
      sx={{ height, width }}
    >
      <UserIcon />
    </Avatar>
  );
};

/**
 * Given a Gravatar URL, this function waits for Adobe Analytics
 * to load (if it is not already loaded) and captures an Analytics
 * event saying whether or not the user has a Gravatar.
 *
 * Make sure the URL passed has `?d=404`
 */
async function checkForGravatarAndSendEvent(url: string) {
  try {
    await waitForAdobeAnalyticsToBeLoaded();

    const response = await fetch(url);

    if (response.status === 200) {
      sendHasGravatarEvent(true);
    }
    if (response.status === 404) {
      sendHasGravatarEvent(false);
    }
  } catch (error) {
    // Analytics didn't load or the fetch to Gravatar
    // failed. Event won't be logged.
  }
}
