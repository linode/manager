import { Notification } from '@linode/api-v4/lib/account';
import { LinodeStatus } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';
import MaintenanceBanner from 'src/components/MaintenanceBanner';
import ProductNotification from 'src/components/ProductNotification';
import { useAllAccountMaintenanceQuery } from 'src/queries/accountMaintenance';
import { Maintenance } from 'src/store/linodes/linodes.helpers';
import { withNotifications } from 'src/store/notification/notification.containers';
import { withLinodeDetailContext } from '../linodeDetailContext';
import MigrationNotification from './MigrationNotification';

type CombinedProps = ContextProps & { requestNotifications: () => void };

const Notifications: React.FC<CombinedProps> = (props) => {
  const {
    requestNotifications,
    linodeNotifications,
    linodeId,
    linodeStatus,
  } = props;

  const { data: accountMaintenanceData } = useAllAccountMaintenanceQuery();

  const maintenanceForThisLinode = accountMaintenanceData?.find(
    (thisMaintenance) =>
      thisMaintenance.entity.type === 'linode' &&
      thisMaintenance.entity.id === linodeId
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
        if (linodeStatus === 'migrating') {
          return null;
        }
        return (
          <MigrationNotification
            linodeID={linodeId}
            requestNotifications={requestNotifications}
            notificationMessage={notification.message}
            notificationType={notification.type}
            migrationTime={notification.when}
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
      {linodeNotifications.map((n, idx) => {
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

interface ContextProps {
  linodeNotifications: Notification[];
  linodeId: number;
  linodeStatus: LinodeStatus;
  maintenance: Maintenance;
}

const enhanced = compose<CombinedProps, {}>(
  withLinodeDetailContext<ContextProps>(({ linode }) => ({
    linodeNotifications: linode._notifications,
    linodeId: linode.id,
    linodeStatus: linode.status,
    maintenance: linode.maintenance,
  })),
  withNotifications(undefined, ({ requestNotifications }) => ({
    requestNotifications,
  }))
);

export default enhanced(Notifications);
