import React from 'react';

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
      {maintenanceStartTime}
      {!isOpened && <>. For more information, see your open support tickets</>}.
    </>
  );
};
