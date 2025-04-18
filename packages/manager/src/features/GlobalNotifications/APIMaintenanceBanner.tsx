import { Stack, Typography } from '@linode/ui';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';
import { queryPresets } from '@linode/queries';
import { useMaintenanceQuery } from 'src/queries/statusPage';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import type { SuppliedMaintenanceData } from 'src/featureFlags';
import type { Maintenance } from 'src/queries/statusPage';

interface Props {
  suppliedMaintenances: SuppliedMaintenanceData[] | undefined;
}

export const APIMaintenanceBanner = React.memo((props: Props) => {
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
        key={scheduledAPIMaintenance.id}
        preferenceKey={scheduledAPIMaintenance.id}
        variant="warning"
      >
        <Stack>
          <Typography data-testid="scheduled-maintenance-banner">
            <Link to={scheduledAPIMaintenance.shortlink}>
              <strong data-testid="scheduled-maintenance-status">
                {bannerTitle}
              </strong>
            </Link>
          </Typography>
          <Typography
            dangerouslySetInnerHTML={{
              __html: sanitizeHTML({
                sanitizingTier: 'flexible',
                text: bannerBody,
              }),
            }}
          />
        </Stack>
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
});
