import * as React from 'react';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Link from 'src/components/Link';
import { SuppliedMaintenanceData } from 'src/featureFlags';
import { queryPresets } from 'src/queries/base';
import { Maintenance, useMaintenanceQuery } from 'src/queries/statusPage';
import { sanitizeHTML } from 'src/utilities/sanitize-html';

interface Props {
  suppliedMaintenances: SuppliedMaintenanceData[] | undefined;
}

export const APIMaintenanceBanner: React.FC<React.PropsWithChildren<Props>> = (
  props
) => {
  const { suppliedMaintenances } = props;

  const { data: maintenancesData } = useMaintenanceQuery({
    ...queryPresets.oneTimeFetch,
  });
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
      <DismissibleBanner
        important
        warning
        preferenceKey={scheduledAPIMaintenance.id}
        key={scheduledAPIMaintenance.id}
      >
        <>
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
        </>
      </DismissibleBanner>
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
