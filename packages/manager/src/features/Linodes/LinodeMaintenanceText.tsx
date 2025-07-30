import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay/DateTimeDisplay';

interface LinodeMaintenanceTextProps {
  isOpened?: boolean;
  maintenanceStartTime: string;
}

export const LinodeMaintenanceText = ({
  isOpened = false,
  maintenanceStartTime,
}: LinodeMaintenanceTextProps) => {
  return (
    <>
      This Linode&rsquo;s maintenance window {isOpened ? 'opened' : 'opens'} at{' '}
      <DateTimeDisplay
        sx={(theme) => ({
          color: theme.tokens.alias.Content.Text.Secondary.Default,
        })}
        value={maintenanceStartTime}
      />
      {!isOpened && <>. For more information, see your open support tickets</>}.
    </>
  );
};
