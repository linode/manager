import { Typography } from '@linode/ui';
import React from 'react';

export interface DelayedLoadingMessageProps {
  /**
   * Optional custom message to display. Defaults to standard large dataset message.
   */
  message?: string;
}

/**
 * Displays a message to users informing them that loading is taking longer than expected.
 * Typically used in conjunction with useDelayedLoadingIndicator hook.
 */
export const DelayedLoadingMessage = React.memo(
  ({ message }: DelayedLoadingMessageProps) => {
    return (
      <Typography variant="body1">
        {message ||
          'This is taking a bit longer than usual. Loading a large number of entities can take additional time.'}
      </Typography>
    );
  }
);
