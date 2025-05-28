import { useAllAccountMaintenanceQuery } from '@linode/queries';
import { Notice, Typography } from '@linode/ui';
import React from 'react';

import { PENDING_MAINTENANCE_FILTER } from 'src/features/Account/Maintenance/utilities';
import { isPlatformMaintenance } from 'src/hooks/usePlatformMaintenance';

import { Link } from '../Link';

import type { AccountMaintenance } from '@linode/api-v4';

export const MaintenanceBannerV2 = () => {
  const { data: allMaintenance } = useAllAccountMaintenanceQuery(
    {},
    PENDING_MAINTENANCE_FILTER
  );

  // Filter out platform maintenance, since that is handled separately
  const linodeMaintenance =
    allMaintenance?.filter(
      (maintenance) =>
        maintenance.entity.type === 'linode' &&
        !isPlatformMaintenance(maintenance)
    ) ?? [];

  return (
    <>
      {renderBanner(linodeMaintenance, 'scheduled')}
      {renderBanner(linodeMaintenance, 'emergency')}
    </>
  );
};

const renderBanner = (
  maintenance: AccountMaintenance[],
  description: AccountMaintenance['description']
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
            {maintenanceLinodes.size} Linode
            {maintenanceLinodes.size !== 1 && 's'}
          </strong>{' '}
          {maintenanceLinodes.size === 1 ? 'has' : 'have'} upcoming{' '}
          <strong>{description}</strong> maintenance. For more details, view{' '}
          <Link to="/account/maintenance">Account Maintenance</Link>.
        </Typography>
      </Notice>
    )
  );
};
