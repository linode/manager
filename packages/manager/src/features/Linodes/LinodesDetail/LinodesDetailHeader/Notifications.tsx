import {
  useAllAccountMaintenanceQuery,
  useLinodeQuery,
  useNotificationsQuery,
} from '@linode/queries';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { LinodeMaintenanceBanner } from 'src/components/MaintenanceBanner/LinodeMaintenanceBanner';
import { MaintenanceBanner } from 'src/components/MaintenanceBanner/MaintenanceBanner';
import { LinodePlatformMaintenanceBanner } from 'src/components/PlatformMaintenanceBanner/LinodePlatformMaintenanceBanner';
import { ProductNotification } from 'src/components/ProductNotification/ProductNotification';
import { PENDING_MAINTENANCE_FILTER } from 'src/features/Account/Maintenance/utilities';
import { useFlags } from 'src/hooks/useFlags';
import { isPlatformMaintenance } from 'src/hooks/usePlatformMaintenance';

import { MigrationNotification } from './MigrationNotification';

import type { Notification } from '@linode/api-v4';

const Notifications = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const { data: linode } = useLinodeQuery(Number(linodeId));

  const { data: notifications, refetch } = useNotificationsQuery();

  const flags = useFlags();

  const linodeNotifications = notifications?.filter(
    (notification) =>
      notification.entity?.type === 'linode' &&
      notification.entity.id === Number(linodeId)
  );

  const { data: accountMaintenanceData } = useAllAccountMaintenanceQuery(
    {},
    PENDING_MAINTENANCE_FILTER
  );

  const maintenanceForThisLinode = accountMaintenanceData
    ?.filter((maintenance) => !isPlatformMaintenance(maintenance)) // Platform maintenance is handled separately
    ?.find(
      (thisMaintenance) =>
        thisMaintenance.entity.type === 'linode' &&
        thisMaintenance.entity.id === linode?.id
    );

  const generateNotificationBody = (notification: Notification) => {
    switch (notification.type) {
      // Maintenance notifications are handled separately, based on data from
      // the `/maintenance` endpoint. We return `null` for maintenance
      // notifications to avoid duplicate messaging.
      case 'maintenance':
        return null;
      case 'migration_pending':
      case 'migration_scheduled':
        /** don't show any banner if the migration is in progress */
        if (linode?.status === 'migrating') {
          return null;
        }
        return (
          <MigrationNotification
            linodeID={Number(linode?.id)}
            migrationTime={notification.when}
            notificationMessage={notification.message}
            notificationType={notification.type}
            requestNotifications={refetch}
          />
        );
      default:
        return (
          <ProductNotification
            severity={notification.severity}
            text={notification.message}
          />
        );
    }
  };

  return (
    <>
      {linodeNotifications?.map((n, idx) => {
        return (
          <React.Fragment key={idx}>
            {generateNotificationBody(n)}
          </React.Fragment>
        );
      })}
      {linode ? (
        <LinodePlatformMaintenanceBanner linodeId={linode?.id} />
      ) : null}
      {flags.vmHostMaintenance?.enabled ? (
        <LinodeMaintenanceBanner linodeId={linode?.id} />
      ) : maintenanceForThisLinode ? (
        <MaintenanceBanner
          maintenanceStart={maintenanceForThisLinode.when}
          type={maintenanceForThisLinode.type}
        />
      ) : null}
    </>
  );
};

export default Notifications;
