import { queryPresets, useMaintenanceQuery } from '@linode/queries';
import { Stack, Typography } from '@linode/ui';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';
import { LINODE_STATUS_PAGE_URL } from 'src/constants';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import type { Maintenance } from '@linode/queries';
import type { SuppliedMaintenanceData } from 'src/featureFlags';

interface Props {
  suppliedMaintenances: SuppliedMaintenanceData[] | undefined;
}

export const APIMaintenanceBanner = React.memo((props: Props) => {
  const { suppliedMaintenances } = props;

  const { data: maintenancesData } = useMaintenanceQuery(
    LINODE_STATUS_PAGE_URL,
    {
      ...queryPresets.oneTimeFetch,
    }
  );
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
    <>
      {scheduledAPIMaintenances.map((scheduledAPIMaintenance) =>
        renderBanner(scheduledAPIMaintenance)
      )}
    </>
  );
});
