import { useAllAccountMaintenanceQuery } from '@linode/queries';
import { Notice, Typography } from '@linode/ui';
import React from 'react';
import { useLocation } from 'react-router-dom';

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

  const location = useLocation();

  const linodeMaintenance = allMaintenance?.find(
    (maintenance) =>
      maintenance.entity.type === 'linode' &&
      maintenance.entity.id === linodeId &&
      // Filter out platform maintenance, since that is handled separately
      !isPlatformMaintenance(maintenance)
  );

  const maintenanceTypeLabel = linodeMaintenance?.type.split('_').join(' ');

  if (!linodeMaintenance) return null;

  const hideAccountMaintenanceLink = location.pathname?.includes(
    `/linodes/${linodeId}`
  );

  return (
    <Notice variant="warning">
      <Typography>
        Linode {linodeMaintenance.entity.label} {linodeMaintenance.description}{' '}
        maintenance {maintenanceTypeLabel} will begin{' '}
        <strong>
          <DateTimeDisplay
            format="MM/dd/yyyy"
            sx={(theme) => ({
              font: theme.font.bold,
            })}
            value={linodeMaintenance.start_time}
          />{' '}
          at{' '}
          <DateTimeDisplay
            format="HH:mm"
            sx={(theme) => ({
              font: theme.font.bold,
            })}
            value={linodeMaintenance.start_time}
          />
        </strong>
        {!hideAccountMaintenanceLink && (
          <>
            . For more details, view{' '}
            <Link to="/account/maintenance">Account Maintenance</Link>.
          </>
        )}
      </Typography>
    </Notice>
  );
};
