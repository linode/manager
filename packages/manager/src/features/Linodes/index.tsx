import React, { useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useFlags } from 'src/hooks/useFlags';
import { useAllAccountMaintenanceQuery } from 'src/queries/account/maintenance';
import { useInProgressEvents } from 'src/queries/events/events';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { addMaintenanceToLinodes } from 'src/utilities/linodes';

import { linodesInTransition } from './transitions';

const LinodesLanding = React.lazy(
  () => import('./LinodesLanding/LinodesLanding')
);
const LinodesDetail = React.lazy(() =>
  import('src/features/Linodes/LinodesDetail/LinodesDetail').then((module) => ({
    default: module.LinodeDetail,
  }))
);
const LinodesCreate = React.lazy(
  () => import('./LinodesCreate/LinodeCreateContainer')
);
const LinodesCreatev2 = React.lazy(() =>
  import('./LinodeCreatev2').then((module) => ({
    default: module.LinodeCreatev2,
  }))
);

export const LinodesRoutes = () => {
  const flags = useFlags();

  // Hold this feature flag in state so that the user's Linode creation
  // isn't interupted when the flag is toggled.
  const [isLinodeCreateV2EnabledStale] = useState(flags.linodeCreateRefactor);

  const isLinodeCreateV2Enabled = import.meta.env.DEV
    ? flags.linodeCreateRefactor
    : isLinodeCreateV2EnabledStale;

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

  const { data: linodes, error, isLoading } = useAllLinodesQuery();

  const someLinodesHaveScheduledMaintenance = accountMaintenanceData?.some(
    (thisAccountMaintenance) => thisAccountMaintenance.entity.type === 'linode'
  );

  const { data: events } = useInProgressEvents();

  const linodesData = addMaintenanceToLinodes(
    accountMaintenanceData ?? [],
    linodes ?? []
  );

  return (
    <LinodesLanding
      someLinodesHaveScheduledMaintenance={Boolean(
        someLinodesHaveScheduledMaintenance
      )}
      linodesData={linodesData}
      linodesInTransition={linodesInTransition(events ?? [])}
      linodesRequestError={error ?? undefined}
      linodesRequestLoading={isLoading}
    />
  );
});
