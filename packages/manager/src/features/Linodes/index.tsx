import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useAllAccountMaintenanceQuery } from 'src/queries/account/maintenance';
import { useInProgressEvents } from 'src/queries/events/events';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { addMaintenanceToLinodes } from 'src/utilities/linodes';
import { storage } from 'src/utilities/storage';

import { linodesInTransition } from './transitions';

import type { RegionFilter } from 'src/utilities/storage';

const LinodesLanding = React.lazy(
  () => import('./LinodesLanding/LinodesLanding')
);
const LinodesDetail = React.lazy(() =>
  import('src/features/Linodes/LinodesDetail/LinodesDetail').then((module) => ({
    default: module.LinodeDetail,
  }))
);
const LinodesCreatev2 = React.lazy(() =>
  import('./LinodeCreatev2').then((module) => ({
    default: module.LinodeCreatev2,
  }))
);

export const LinodesRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={LinodesCreatev2} path="/linodes/create" />
        <Route component={LinodesDetail} path="/linodes/:linodeId" />
        <Route component={LinodesLandingWrapper} exact path="/linodes" strict />
        <Redirect to="/linodes" />
      </Switch>
    </React.Suspense>
  );
};

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

  const { isGeckoLAEnabled } = useIsGeckoEnabled();

  const [regionFilter, setRegionFilter] = React.useState<
    RegionFilter | undefined
  >(storage.regionFilter.get());

  // We need to grab all linodes so a filtered result of 0 does not display the empty state landing page
  const { data: allLinodes } = useAllLinodesQuery();
  const { data: filteredLinodes, error, isLoading } = useAllLinodesQuery(
    {},
    isGeckoLAEnabled ? generateLinodesXFilter(regionFilter) : {}
  );

  const someLinodesHaveScheduledMaintenance = accountMaintenanceData?.some(
    (thisAccountMaintenance) => thisAccountMaintenance.entity.type === 'linode'
  );

  const { data: events } = useInProgressEvents();

  const filteredLinodesData = addMaintenanceToLinodes(
    accountMaintenanceData ?? [],
    filteredLinodes ?? []
  );

  const handleRegionFilter = (regionFilter: RegionFilter) => {
    setRegionFilter(regionFilter);
    storage.regionFilter.set(regionFilter);
  };

  return (
    <LinodesLanding
      someLinodesHaveScheduledMaintenance={Boolean(
        someLinodesHaveScheduledMaintenance
      )}
      handleRegionFilter={handleRegionFilter}
      linodesData={filteredLinodesData}
      linodesInTransition={linodesInTransition(events ?? [])}
      linodesRequestError={error ?? undefined}
      linodesRequestLoading={isLoading}
      totalNumLinodes={allLinodes?.length ?? 0}
    />
  );
});

const generateLinodesXFilter = (regionFilter: RegionFilter | undefined) => {
  if (regionFilter === 'core' || regionFilter === 'distributed') {
    return {
      site_type: regionFilter,
    };
  }
  return {};
};
