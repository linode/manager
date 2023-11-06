import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useAllAccountMaintenanceQuery } from 'src/queries/accountMaintenance';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { addMaintenanceToLinodes } from 'src/utilities/linodes';
import { useAccountAvailabilitiesQuery } from 'src/queries/accountAvailability';
import { usePagination } from 'src/hooks/usePagination';
import { useFlags } from 'src/hooks/useFlags';

const LinodesLanding = React.lazy(
  () => import('./LinodesLanding/LinodesLanding')
);
const LinodesDetail = React.lazy(() => import('./LinodesDetail/LinodesDetail'));
const LinodesCreate = React.lazy(
  () => import('./LinodesCreate/LinodeCreateContainer')
);

const LinodesRoutes: React.FC = () => {
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

export default LinodesRoutes;

// Light wrapper around LinodesLanding that injects "extended" Linodes (with
// plan type and maintenance information). This extra data used to come from
// mapStateToProps, but since I wanted to use a query (for accountMaintenance)
// I needed a Function Component. It seemed safer to do it this way instead of
// refactoring LinodesLanding.
const LinodesLandingWrapper = React.memo(() => {
  // See M3-7378: we are currently loading this data into the CM so that it's ready to be used
  const flags = useFlags();
  const pagination = usePagination(1);
  const { data: accountAvailability } = useAccountAvailabilitiesQuery(
    { page: pagination.page },
    {},
    flags.dcGetWell
  );

  const { data: accountMaintenanceData } = useAllAccountMaintenanceQuery(
    {},
    { status: { '+or': ['pending, started'] } }
  );

  const { data: linodes, error, isLoading } = useAllLinodesQuery();

  const someLinodesHaveScheduledMaintenance = accountMaintenanceData?.some(
    (thisAccountMaintenance) => thisAccountMaintenance.entity.type === 'linode'
  );

  const linodesData = addMaintenanceToLinodes(
    accountMaintenanceData ?? [],
    linodes ?? []
  );

  return (
    <LinodesLanding
      accountAvailabilityData={accountAvailability?.data}
      someLinodesHaveScheduledMaintenance={Boolean(
        someLinodesHaveScheduledMaintenance
      )}
      linodesData={linodesData}
      linodesRequestError={error ?? undefined}
      linodesRequestLoading={isLoading}
    />
  );
});
