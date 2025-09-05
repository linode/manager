import { useAllAccountMaintenanceQuery } from '@linode/queries';
import { Notice, Typography } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import { useLocation } from '@tanstack/react-router';
import React from 'react';

import { PENDING_MAINTENANCE_FILTER } from 'src/features/Account/Maintenance/utilities';
import { isPlatformMaintenance } from 'src/hooks/usePlatformMaintenance';

import { Link } from '../Link';

export const MaintenanceBannerV2 = () => {
  const { data: allMaintenance } = useAllAccountMaintenanceQuery(
    {},
    PENDING_MAINTENANCE_FILTER
  );
  const location = useLocation();

  const hideAccountMaintenanceLink = location.pathname === '/maintenance';

  // Filter out platform maintenance, since that is handled separately
  const linodeMaintenance =
    allMaintenance?.filter(
      (maintenance) =>
        maintenance.entity.type === 'linode' &&
        !isPlatformMaintenance(maintenance)
    ) ?? [];

  const maintenanceLinodes = new Set(
    linodeMaintenance.map((maintenance) => maintenance.entity.id)
  );

  return (
    maintenanceLinodes.size > 0 && ( 
      <Notice data-qa-maintenance-banner-v2="true" data-testid="maintenance-banner" variant="warning">
        <Typography>
          <strong>
            {pluralize('Linode', 'Linodes', maintenanceLinodes.size)}
          </strong>{' '}
          {maintenanceLinodes.size === 1 ? 'has' : 'have'} upcoming{' '}
          <strong>scheduled</strong> maintenance.
          {!hideAccountMaintenanceLink && (
            <span data-testid="maintenance-link-section">
              {' '}
              For more details, view{' '}
              <Link to="/maintenance">Account Maintenance</Link>.
            </span>
          )}
        </Typography>
      </Notice>
    )
  );
};
