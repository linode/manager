import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { SuppliedMaintenanceData } from 'src/featureFlags';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import { queryPresets } from 'src/queries/base';
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

  const { data: maintenancesData } = useMaintenanceQuery({
    ...queryPresets.oneTimeFetch,
  });
  const maintenances = maintenancesData?.scheduled_maintenances ?? [];

  if (hasDismissedNotifications(suppliedMaintenances ?? [])) {
    return null;
  }

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

  const onDismiss = () => {
    dismissNotifications(suppliedMaintenances);
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
      correspondingSuppliedMaintenance?.title || scheduledAPIMaintenance.name;

    const bannerBody =
      correspondingSuppliedMaintenance?.body || mostRecentUpdate.body;

    return (
      <Notice
        important
        warning
        dismissible
        onClose={onDismiss}
        key={scheduledAPIMaintenance.id}
      >
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
