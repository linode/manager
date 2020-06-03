import { Notification } from '@linode/api-v4/lib/account';
import { LinodeStatus } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { path } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import ProductNotification from 'src/components/ProductNotification';
import { withNotifications } from 'src/store/notification/notification.containers';
import { withLinodeDetailContext } from '../linodeDetailContext';

import MaintenanceBanner from 'src/components/MaintenanceBanner';
import withProfile from 'src/containers/profile.container';
import { Maintenance } from 'src/store/linodes/linodes.helpers';
import MigrationNotification from './MigrationNotification';

type CombinedProps = ProfileProps &
  ContextProps & {
    requestNotifications: () => void;
  };

const Notifications: React.FC<CombinedProps> = props => {
  const {
    requestNotifications,
    linodeNotifications,
    userTimezone,
    userTimezoneError,
    userTimezoneLoading,
    linodeId,
    linodeStatus
  } = props;

  const generateNotificationBody = (notification: Notification) => {
    switch (notification.type) {
      case 'maintenance':
        return (
          <MaintenanceBanner
            userTimezone={userTimezone}
            userTimezoneLoading={userTimezoneLoading}
            userTimezoneError={userTimezoneError}
            maintenanceStart={notification.when}
            maintenanceEnd={notification.until}
            type={
              notification.label.includes('reboot') ? 'reboot' : 'migration'
            }
          />
        );
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
    <>
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
  userTimezoneLoading: boolean;
  userTimezoneError?: APIError[];
  userTimezone?: string;
}

const enhanced = compose<CombinedProps, {}>(
  withLinodeDetailContext<ContextProps>(({ linode }) => ({
    linodeNotifications: linode._notifications,
    linodeId: linode.id,
    linodeStatus: linode.status,
    maintenance: linode.maintenance
  })),
  withNotifications(undefined, ({ requestNotifications }) => ({
    requestNotifications
  })),
  withProfile<ProfileProps, {}>(
    (undefined, { profileData: profile, profileLoading, profileError }) => ({
      userTimezone: path(['data', 'timezone'], profile),
      userTimezoneError: path(['read'], profileError),
      userTimezoneLoading: profileLoading
    })
  )
);

export default enhanced(Notifications);
