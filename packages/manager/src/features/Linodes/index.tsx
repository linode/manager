import {
  useAllAccountMaintenanceQuery,
  useAllLinodesQuery,
} from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import { createLazyRoute } from '@tanstack/react-router';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useFlags } from 'src/hooks/useFlags';
import { useInProgressEvents } from 'src/queries/events/events';
import { addMaintenanceToLinodes } from 'src/utilities/linodes';
import { storage } from 'src/utilities/storage';

import { PENDING_MAINTENANCE_FILTER } from '../Account/Maintenance/utilities';
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
const LinodesCreate = React.lazy(() =>
  import('./LinodeCreate').then((module) => ({
    default: module.LinodeCreate,
  }))
);

export const LinodesRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={LinodesCreate} path="/linodes/create" />
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
export const LinodesLandingWrapper = React.memo(() => {
  const { data: accountMaintenanceData } = useAllAccountMaintenanceQuery(
    {},
    PENDING_MAINTENANCE_FILTER
  );
  const flags = useFlags();

  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  const [regionFilter, setRegionFilter] = React.useState<
    RegionFilter | undefined
  >(storage.regionFilter.get());

  // We need to grab all linodes so a filtered result of 0 does not display the empty state landing page
  const {
    data: allLinodes,
    isLoading: allLinodesLoading,
  } = useAllLinodesQuery();
  const {
    data: filteredLinodes,
    error,
    isLoading: filteredLinodesLoading,
  } = useAllLinodesQuery(
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
      filteredLinodesLoading={filteredLinodesLoading}
      handleRegionFilter={handleRegionFilter}
      linodesData={filteredLinodesData}
      linodesInTransition={linodesInTransition(events ?? [])}
      linodesRequestError={error ?? undefined}
      linodesRequestLoading={allLinodesLoading}
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

export const linodesLandingLazyRoute = createLazyRoute('/linodes')({
  component: LinodesLandingWrapper,
});
