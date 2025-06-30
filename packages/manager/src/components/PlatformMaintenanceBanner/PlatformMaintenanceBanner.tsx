import { Notice, Typography } from '@linode/ui';
import React from 'react';

import { usePlatformMaintenance } from 'src/hooks/usePlatformMaintenance';

import { Link } from '../Link';

/**
 * This banner will be used in the event of VM platform maintenance,
 * that requires a reboot, e.g., QEMU upgrades. Since these are
 * urgent and affect a large portion of Linodes, we are displaying
 * them separately from the standard MaintenanceBanner.
 */

export const PlatformMaintenanceBanner = ({
  pathname,
}: {
  pathname?: string;
}) => {
  const { accountHasPlatformMaintenance, linodesWithPlatformMaintenance } =
    usePlatformMaintenance();

  const hideAccountMaintenanceLink = pathname === '/account/maintenance';

  if (!accountHasPlatformMaintenance) return null;

  return (
    <Notice variant="warning">
      <Typography>
        <strong>
          {linodesWithPlatformMaintenance.size > 0
            ? linodesWithPlatformMaintenance.size
            : 'One or more'}{' '}
          Linode{linodesWithPlatformMaintenance.size !== 1 && 's'}
        </strong>{' '}
        need{linodesWithPlatformMaintenance.size === 1 && 's'} to be rebooted
        for critical platform maintenance.
        {!hideAccountMaintenanceLink && (
          <>
            {' '}
            See which Linodes are <strong>scheduled</strong> for reboot on the{' '}
            <Link to="/account/maintenance">Account Maintenance</Link> page.
          </>
        )}
      </Typography>
    </Notice>
  );
};
