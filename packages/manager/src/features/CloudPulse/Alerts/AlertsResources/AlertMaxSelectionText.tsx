import { Typography } from '@linode/ui';
import React from 'react';

interface AlertMaxSelectionTextProps {
  /**
   * The maximum selection count that needs to displayed in the text
   */
  maxSelectionCount: number;
}

export const AlertMaxSelectionText = React.memo(
  (props: AlertMaxSelectionTextProps) => {
    const { maxSelectionCount } = props;
    return (
      <Typography data-testid="warning-tip">
        You can select up to {maxSelectionCount} resources.
      </Typography>
    );
  }
);
