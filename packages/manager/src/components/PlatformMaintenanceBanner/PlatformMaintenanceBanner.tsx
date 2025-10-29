import { Notice, Typography } from '@linode/ui';
import { useLocation } from '@tanstack/react-router';
import React from 'react';

import { usePlatformMaintenance } from 'src/hooks/usePlatformMaintenance';

import { Link } from '../Link';

/**
 * This banner will be used in the event of VM platform maintenance,
 * that requires a reboot, e.g., QEMU upgrades. Since these are
 * urgent and affect a large portion of Linodes, we are displaying
 * them separately from the standard MaintenanceBanner.
 */

export const PlatformMaintenanceBanner = () => {
  const { accountHasPlatformMaintenance, linodesWithPlatformMaintenance } =
    usePlatformMaintenance();
  const location = useLocation();

  const hideAccountMaintenanceLink = location.pathname === '/maintenance';

  if (!accountHasPlatformMaintenance) return null;
  // Do not render if there are no specific Linodes with platform maintenance
  if (linodesWithPlatformMaintenance.size === 0) return null;

  return (
    <Notice data-testid="platform-maintenance-banner" variant="warning">
      <Typography>
        <strong>
          {linodesWithPlatformMaintenance.size} Linode
          {linodesWithPlatformMaintenance.size !== 1 && 's'}
        </strong>{' '}
        need{linodesWithPlatformMaintenance.size === 1 && 's'} to be rebooted
        for critical platform maintenance.
        {!hideAccountMaintenanceLink && (
          <span data-testid="platform-maintenance-link-section">
            {' '}
            See which Linodes are <strong>scheduled</strong> for reboot on the{' '}
            <Link pendoId="platform-maintenance-banner-link" to="/maintenance">
              Account Maintenance
            </Link>{' '}
            page.
          </span>
        )}
      </Typography>
    </Notice>
  );
};
