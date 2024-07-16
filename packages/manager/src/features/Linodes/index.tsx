import React, { useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useFlags } from 'src/hooks/useFlags';
import { useAllAccountMaintenanceQuery } from 'src/queries/account/maintenance';
import { useInProgressEvents } from 'src/queries/events/events';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { addMaintenanceToLinodes } from 'src/utilities/linodes';
import { storage } from 'src/utilities/storage';

import { linodesInTransition } from './transitions';

import type { LinodeWithMaintenance } from 'src/utilities/linodes';
import type { RegionFilter } from 'src/utilities/storage';

const LinodesLanding = React.lazy(
  () => import('./LinodesLanding/LinodesLanding')
);
const LinodesDetail = React.lazy(() => import('./LinodesDetail/LinodesDetail'));
const LinodesCreate = React.lazy(
  () => import('./LinodesCreate/LinodeCreateContainer')
);
const LinodesCreatev2 = React.lazy(() =>
  import('./LinodeCreatev2').then((module) => ({
    default: module.LinodeCreatev2,
  }))
);

const LinodesRoutes = () => {
  const flags = useFlags();

  // Hold this feature flag in state so that the user's Linode creation
  // isn't interupted when the flag is toggled.
  const [isLinodeCreateV2Enabled] = useState(flags.linodeCreateRefactor);

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route
          component={isLinodeCreateV2Enabled ? LinodesCreatev2 : LinodesCreate}
          path="/linodes/create"
        />
        <Route component={LinodesDetail} path="/linodes/:linodeId" />
        <Route component={LinodesLandingWrapper} exact path="/linodes" strict />
        <Redirect to="/linodes" />
      </Switch>
    </React.Suspense>
  );
};

export default LinodesRoutes;

// Light wrapper around LinodesLanding that injects "extended" Linodes (with
// plan type and maintenance information). This extra data used to come from
// mapStateToProps, but since I wanted to use a query (for accountMaintenance)
// I needed a Function Component. It seemed safer to do it this way instead of
// refactoring LinodesLanding.
const LinodesLandingWrapper = React.memo(() => {
  const { data: accountMaintenanceData } = useAllAccountMaintenanceQuery(
    {},
    { status: { '+or': ['pending, started'] } }
  );

  const { isGeckoGAEnabled } = useIsGeckoEnabled();

  const [regionFilter, setRegionFilter] = React.useState<
    RegionFilter | undefined
  >(storage.regionFilter.get());

  const { data: linodes, error, isLoading } = useAllLinodesQuery();

  const someLinodesHaveScheduledMaintenance = accountMaintenanceData?.some(
    (thisAccountMaintenance) => thisAccountMaintenance.entity.type === 'linode'
  );

  const { data: events } = useInProgressEvents();

  const linodesData = addMaintenanceToLinodes(
    accountMaintenanceData ?? [],
    linodes ?? []
  );

  const handleRegionFilter = (regionFilter: RegionFilter) => {
    setRegionFilter(regionFilter);
    storage.regionFilter.set(regionFilter);
  };

  let filteredData: LinodeWithMaintenance[] | null = null;
  if (
    isGeckoGAEnabled &&
    (regionFilter === 'core' || regionFilter === 'distributed')
  ) {
    filteredData = linodesData.filter(
      (linode) => linode.site_type === regionFilter
    );
  } else {
    filteredData = null;
  }

  return (
    <LinodesLanding
      someLinodesHaveScheduledMaintenance={Boolean(
        someLinodesHaveScheduledMaintenance
      )}
      filteredLinodesData={filteredData}
      handleRegionFilter={handleRegionFilter}
      linodesData={linodesData}
      linodesInTransition={linodesInTransition(events ?? [])}
      linodesRequestError={error ?? undefined}
      linodesRequestLoading={isLoading}
    />
  );
});
