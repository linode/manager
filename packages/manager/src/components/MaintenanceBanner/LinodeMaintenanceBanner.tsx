import { useAllAccountMaintenanceQuery } from '@linode/queries';
import { Notice, Typography } from '@linode/ui';
import React from 'react';

import { PENDING_MAINTENANCE_FILTER } from 'src/features/Account/Maintenance/utilities';
import { isPlatformMaintenance } from 'src/hooks/usePlatformMaintenance';

import { DateTimeDisplay } from '../DateTimeDisplay';
import { Link } from '../Link';

import type { Linode } from '@linode/api-v4';

interface Props {
  linodeId: Linode['id'] | undefined;
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

  return (
    linodeMaintenance && (
      <Notice variant="warning">
        <Typography>
          Linode {linodeMaintenance.entity.label}{' '}
          {linodeMaintenance.description} maintenance {maintenanceTypeLabel}{' '}
          will begin{' '}
          <DateTimeDisplay
            format="MM/dd/yyyy"
            sx={(theme) => ({
              fontWeight: theme.tokens.font.FontWeight.Semibold,
            })}
            value={linodeMaintenance.start_time}
          />{' '}
          at{' '}
          <DateTimeDisplay
            format="HH:mm"
            sx={(theme) => ({
              fontWeight: theme.tokens.font.FontWeight.Semibold,
            })}
            value={linodeMaintenance.start_time}
          />
          . For more details, view{' '}
          <Link to="/account/maintenance">Account Maintenance</Link>.
        </Typography>
      </Notice>
    )
  );
};
