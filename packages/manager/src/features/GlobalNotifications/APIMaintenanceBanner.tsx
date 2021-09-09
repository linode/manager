import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { APIMaintenance } from 'src/featureFlags';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import { useMaintenanceQuery } from 'src/queries/statusPage';
import { sanitizeHTML } from 'src/utilities/sanitize-html';

interface Props {
  apiMaintenanceEvent: APIMaintenance | undefined;
}

export const APIMaintenanceBanner: React.FC<Props> = (props) => {
  const { apiMaintenanceEvent } = props;

  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

  const { data: maintenancesData } = useMaintenanceQuery();
  const maintenances = maintenancesData?.scheduled_maintenances ?? [];

  if (!maintenances || maintenances.length === 0 || !apiMaintenanceEvent) {
    return null;
  }

  const scheduledAPIMaintenance = maintenances.find(
    (maintenance) =>
      maintenance.id === apiMaintenanceEvent?.id &&
      maintenance.status === 'scheduled'
  );

  if (!scheduledAPIMaintenance) {
    return null;
  }

  if (hasDismissedNotifications([apiMaintenanceEvent])) {
    return null;
  }

  const onDismiss = () => {
    dismissNotifications([apiMaintenanceEvent]);
  };

  const bannerTitle =
    apiMaintenanceEvent.title !== undefined && apiMaintenanceEvent.title !== ''
      ? apiMaintenanceEvent.title
      : scheduledAPIMaintenance.name;

  const mostRecentUpdate = scheduledAPIMaintenance.incident_updates.filter(
    (thisUpdate) => thisUpdate.status !== 'postmortem'
  )[0];

  const bannerBody =
    apiMaintenanceEvent.body !== undefined && apiMaintenanceEvent.body !== ''
      ? apiMaintenanceEvent.body
      : mostRecentUpdate.body;

  return (
    <Notice important warning dismissible onClose={onDismiss}>
      <Typography data-testid="scheduled-maintenance-banner">
        <Link to={scheduledAPIMaintenance.shortlink}>
          <strong data-testid="scheduled-maintenance-status">
            {bannerTitle}
          </strong>
        </Link>
      </Typography>
      <Typography
        dangerouslySetInnerHTML={{ __html: sanitizeHTML(bannerBody) }}
      />
    </Notice>
  );
};

export default React.memo(APIMaintenanceBanner);
