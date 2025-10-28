import { useAllAccountMaintenanceQuery } from '@linode/queries';
import { Notice, Typography } from '@linode/ui';
import React from 'react';

import { PENDING_MAINTENANCE_FILTER } from 'src/features/Account/Maintenance/utilities';
import { isPlatformMaintenance } from 'src/hooks/usePlatformMaintenance';

import { DateTimeDisplay } from '../DateTimeDisplay';
import { Link } from '../Link';

interface Props {
  linodeId: number | undefined;
}

export const LinodeMaintenanceBanner = ({ linodeId }: Props) => {
  const { data: allMaintenance } = useAllAccountMaintenanceQuery(
    {},
    PENDING_MAINTENANCE_FILTER,
    linodeId !== undefined
  );

  const linodeMaintenance = allMaintenance?.find(
    (maintenance) =>
      maintenance.entity.type === 'linode' &&
      maintenance.entity.id === linodeId &&
      // Filter out platform maintenance, since that is handled separately
      !isPlatformMaintenance(maintenance)
  );

  const maintenanceTypeLabel = linodeMaintenance?.type.split('_').join(' ');
  const maintenanceStartTime =
    linodeMaintenance?.start_time || linodeMaintenance?.when;

  if (!linodeMaintenance) return null;

  return (
    <Notice data-qa-maintenance-banner="true" variant="warning">
      <Typography>
        Linode {linodeMaintenance.entity.label} {linodeMaintenance.description}{' '}
        maintenance {maintenanceTypeLabel} will begin{' '}
        <strong>
          {maintenanceStartTime ? (
            <>
              <DateTimeDisplay
                format="MM/dd/yyyy"
                sx={(theme) => ({
                  font: theme.font.bold,
                })}
                value={maintenanceStartTime}
              />{' '}
              at{' '}
              <DateTimeDisplay
                format="HH:mm"
                sx={(theme) => ({
                  font: theme.font.bold,
                })}
                value={maintenanceStartTime}
              />
            </>
          ) : (
            'soon'
          )}
        </strong>
        . For more details, view{' '}
        <Link
          pendoId="linode-maintenance-banner-link"
          to="/account/maintenance"
        >
          Account Maintenance
        </Link>
        .
      </Typography>
    </Notice>
  );
};
