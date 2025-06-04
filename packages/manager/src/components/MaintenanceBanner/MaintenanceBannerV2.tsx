import { useAllAccountMaintenanceQuery } from '@linode/queries';
import { Notice, Typography } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import React from 'react';
import { useLocation } from 'react-router-dom';

import { PENDING_MAINTENANCE_FILTER } from 'src/features/Account/Maintenance/utilities';
import { isPlatformMaintenance } from 'src/hooks/usePlatformMaintenance';

import { Link } from '../Link';

import type { AccountMaintenance } from '@linode/api-v4';

export const MaintenanceBannerV2 = () => {
  const { data: allMaintenance } = useAllAccountMaintenanceQuery(
    {},
    PENDING_MAINTENANCE_FILTER
  );

  const location = useLocation();

  const hideAccountMaintenanceLink =
    location.pathname === '/account/maintenance';

  // Filter out platform maintenance, since that is handled separately
  const linodeMaintenance =
    allMaintenance?.filter(
      (maintenance) =>
        maintenance.entity.type === 'linode' &&
        !isPlatformMaintenance(maintenance)
    ) ?? [];

  return (
    <>
      {renderBanner(linodeMaintenance, 'scheduled', hideAccountMaintenanceLink)}
      {renderBanner(linodeMaintenance, 'emergency', hideAccountMaintenanceLink)}
    </>
  );
};

const renderBanner = (
  maintenance: AccountMaintenance[],
  description: AccountMaintenance['description'],
  hideAccountMaintenanceLink: boolean
) => {
  const filteredMaintenance =
    maintenance?.filter(
      (maintenance) => maintenance.description === description
    ) ?? [];

  const maintenanceLinodes = new Set(
    filteredMaintenance.map((maintenance) => maintenance.entity.id)
  );

  return (
    maintenanceLinodes.size > 0 && (
      <Notice variant="warning">
        <Typography>
          <strong>
            {pluralize('Linode', 'Linodes', maintenanceLinodes.size)}
          </strong>{' '}
          {maintenanceLinodes.size === 1 ? 'has' : 'have'} upcoming{' '}
          <strong>{description}</strong> maintenance.
          {!hideAccountMaintenanceLink && (
            <>
              {' '}
              For more details, view{' '}
              <Link to="/account/maintenance">Account Maintenance</Link>.
            </>
          )}
        </Typography>
      </Notice>
    )
  );
};
