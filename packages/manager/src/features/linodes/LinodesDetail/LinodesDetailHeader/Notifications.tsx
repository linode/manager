import { Notification } from '@linode/api-v4/lib/account';
import { LinodeStatus } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import MaintenanceBanner from 'src/components/MaintenanceBanner';
import ProductNotification from 'src/components/ProductNotification';
import withProfile from 'src/containers/profile.container';
import { useAccountMaintenanceQuery } from 'src/queries/accountMaintenance';
import { Maintenance } from 'src/store/linodes/linodes.helpers';
import { withNotifications } from 'src/store/notification/notification.containers';
import { withLinodeDetailContext } from '../linodeDetailContext';
import MigrationNotification from './MigrationNotification';

type CombinedProps = ProfileProps &
  ContextProps & {
    requestNotifications: () => void;
  };

const Notifications: React.FC<CombinedProps> = (props) => {
  const {
    requestNotifications,
    linodeNotifications,
    userTimezone,
    userProfileError,
    userProfileLoading,
    linodeId,
    linodeStatus,
  } = props;

  const { data: accountMaintenanceData } = useAccountMaintenanceQuery();

  const maintenanceForThisLinode = accountMaintenanceData?.find(
    (thisMaintenance) =>
      thisMaintenance.entity.type === 'linode' &&
      thisMaintenance.entity.id === linodeId
  );

  const generateNotificationBody = (notification: Notification) => {
    switch (notification.type) {
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
    // eslint-disable-next-line
    <>
      {maintenanceForThisLinode ? (
        <MaintenanceBanner
          userTimezone={userTimezone}
          userProfileLoading={userProfileLoading}
          userProfileError={userProfileError}
          maintenanceStart={maintenanceForThisLinode.when}
          type={maintenanceForThisLinode.type}
        />
      ) : null}
      {linodeNotifications.map((n, idx) => {
        return (
          <React.Fragment key={idx}>
            {generateNotificationBody(n)}
          </React.Fragment>
        );
      })}
    </>
  );
};

interface ContextProps {
  linodeNotifications: Notification[];
  linodeId: number;
  linodeStatus: LinodeStatus;
  maintenance: Maintenance;
}

interface ProfileProps {
  userProfileLoading: boolean;
  userProfileError?: APIError[];
  userTimezone?: string;
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
  })),
  withProfile<ProfileProps, {}>(
    (undefined, { profileData: profile, profileLoading, profileError }) => {
      return {
        userTimezone: profile?.timezone,
        userProfileError: profileError?.read,
        userProfileLoading: profileLoading,
      };
    }
  )
);

export default enhanced(Notifications);
