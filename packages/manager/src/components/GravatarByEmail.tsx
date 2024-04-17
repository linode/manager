import Avatar from '@mui/material/Avatar';
import * as React from 'react';

import UserIcon from 'src/assets/icons/account.svg';
import { sendHasGravatarEvent } from 'src/utilities/analytics';
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

const waitForAdobeAnalyticsToBeLoaded = () =>
  new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (window._satellite) {
        resolve();
        clearInterval(interval);
      }
    }, 1000);
  });

async function checkForGravatarAndSendEvent(url: string) {
  await waitForAdobeAnalyticsToBeLoaded();

  try {
    const response = await fetch(url);

    if (response.status === 200) {
      sendHasGravatarEvent(true);
    }
    if (response.status === 404) {
      sendHasGravatarEvent(false);
    }
  } catch (error) {
    // Unable to make fetch (probably due to a network error)
    // Don't report any analytics when this happens.
  }
}
