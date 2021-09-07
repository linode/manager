import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import { Maintenance, useMaintenanceQuery } from 'src/queries/statusPage';
import { capitalize } from 'src/utilities/capitalize';

interface Props {
  apiMaintenanceIds: string[];
}

export const APIMaintenanceBanner: React.FC<Props> = (props) => {
  const { apiMaintenanceIds } = props;

  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

  const { data: maintenancesData } = useMaintenanceQuery();
  const maintenances = maintenancesData?.scheduled_maintenances ?? [];

  const scheduledAPIMaintenances = maintenances.filter(
    (maintenance) =>
      apiMaintenanceIds.includes(maintenance.id) &&
      maintenance.status === 'scheduled'
  );

  if (!maintenances || maintenances.length === 0) {
    return null;
  }

  if (!scheduledAPIMaintenances) {
    return null;
  }

  if (hasDismissedNotifications(scheduledAPIMaintenances)) {
    return null;
  }

  const onDismiss = () => {
    dismissNotifications(scheduledAPIMaintenances);
  };

  const renderBanner = (apiMaintenance: Maintenance) => {
    const mostRecentUpdate = apiMaintenance.incident_updates.filter(
      (thisUpdate) => thisUpdate.status !== 'postmortem'
    )[0];

    return (
      <Notice important warning dismissible onClose={onDismiss}>
        <Typography data-testid="scheduled-maintenance-banner">
          <Link to={apiMaintenance.shortlink}>
            <strong data-testid="scheduled-maintenance-status">
              {apiMaintenance.name}
              {apiMaintenance.status
                ? `: ${capitalize(apiMaintenance.status)}`
                : ''}
            </strong>
          </Link>
        </Typography>
        <Typography>{mostRecentUpdate.body}</Typography>
      </Notice>
    );
  };

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {scheduledAPIMaintenances.map((scheduledAPIMaintenance) =>
        renderBanner(scheduledAPIMaintenance)
      )}
    </>
  );
};

export default React.memo(APIMaintenanceBanner);
