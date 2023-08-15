import { Notification } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { MaintenanceBanner } from 'src/components/MaintenanceBanner/MaintenanceBanner';
import { ProductNotification } from 'src/components/ProductNotification/ProductNotification';
import { useAllAccountMaintenanceQuery } from 'src/queries/accountMaintenance';
import { useNotificationsQuery } from 'src/queries/accountNotifications';
import { useLinodeQuery } from 'src/queries/linodes/linodes';

import { MigrationNotification } from './MigrationNotification';

const Notifications = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const { data: linode } = useLinodeQuery(Number(linodeId));

  const { data: notifications, refetch } = useNotificationsQuery();

  const linodeNotifications = notifications?.filter(
    (notification) =>
      notification.entity?.type === 'linode' &&
      notification.entity.id === Number(linodeId)
  );

  const { data: accountMaintenanceData } = useAllAccountMaintenanceQuery(
    {},
    { status: { '+or': ['pending, started'] } }
  );

  const maintenanceForThisLinode = accountMaintenanceData?.find(
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
      {maintenanceForThisLinode ? (
        <MaintenanceBanner
          maintenanceStart={maintenanceForThisLinode.when}
          type={maintenanceForThisLinode.type}
        />
      ) : null}
    </>
  );
};

export default Notifications;
