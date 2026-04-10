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
          'Loading data. Processing time may be longer for large datasets.'}
      </Typography>
    );
  }
);
DelayedLoadingMessage.displayName = 'DelayedLoadingMessage';
