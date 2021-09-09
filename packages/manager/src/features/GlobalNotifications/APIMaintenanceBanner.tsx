import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { SuppliedMaintenanceData } from 'src/featureFlags';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import { Maintenance, useMaintenanceQuery } from 'src/queries/statusPage';
import { sanitizeHTML } from 'src/utilities/sanitize-html';

interface Props {
  suppliedMaintenances: SuppliedMaintenanceData[] | undefined;
}

export const APIMaintenanceBanner: React.FC<Props> = (props) => {
  const { suppliedMaintenances } = props;

  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

  const { data: maintenancesData } = useMaintenanceQuery();
  const maintenances = maintenancesData?.scheduled_maintenances ?? [];

  if (
    !maintenances ||
    maintenances.length === 0 ||
    !suppliedMaintenances ||
    suppliedMaintenances.length === 0
  ) {
    return null;
  }

  const suppliedMaintenanceEventIDs = suppliedMaintenances.map(
    (maintenance) => maintenance.id
  );

  // Find the maintenances we want (supplied via feature flag) within the ones that Statuspage returns.
  const scheduledAPIMaintenances = maintenances.filter(
    (maintenance) =>
      suppliedMaintenanceEventIDs.includes(maintenance.id) &&
      maintenance.status === 'scheduled'
  );

  if (scheduledAPIMaintenances.length === 0) {
    return null;
  }

  if (hasDismissedNotifications(scheduledAPIMaintenances)) {
    return null;
  }

  const onDismiss = () => {
    dismissNotifications(scheduledAPIMaintenances);
  };

  const renderBanner = (scheduledAPIMaintenance: Maintenance) => {
    const mostRecentUpdate = scheduledAPIMaintenance.incident_updates.filter(
      (thisUpdate) => thisUpdate.status !== 'postmortem'
    )[0];

    const correspondingSuppliedMaintenance = suppliedMaintenances.find(
      (apiMaintenanceEvent) =>
        apiMaintenanceEvent.id === scheduledAPIMaintenance.id
    );

    const bannerTitle =
      correspondingSuppliedMaintenance?.title !== undefined &&
      correspondingSuppliedMaintenance?.title !== ''
        ? correspondingSuppliedMaintenance.title
        : scheduledAPIMaintenance.name;

    const bannerBody =
      correspondingSuppliedMaintenance?.body !== undefined &&
      correspondingSuppliedMaintenance?.body !== ''
        ? correspondingSuppliedMaintenance?.body
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
