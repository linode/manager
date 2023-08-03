import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import SuspenseLoader from 'src/components/SuspenseLoader';
import { useAllAccountMaintenanceQuery } from 'src/queries/accountMaintenance';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import {
  addMaintenanceToLinodes,
  addVPCToLinodes,
} from 'src/utilities/linodes';
import { useVPCsQuery } from 'src/queries/vpcs';

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
const LinodesLandingWrapper: React.FC = React.memo(() => {
  const { data: accountMaintenanceData } = useAllAccountMaintenanceQuery(
    {},
    { status: { '+or': ['pending, started'] } }
  );

  const { data: linodes, error, isLoading } = useAllLinodesQuery();

  const someLinodesHaveScheduledMaintenance = accountMaintenanceData?.some(
    (thisAccountMaintenance) => thisAccountMaintenance.entity.type === 'linode'
  );

  // TODO: VPC - currently the only way to know what VPC a linode is associated with is to get all
  // vpcs, and then loop through each vpc's subnets, and then through each of the subnets' linode IDs
  // to see if that subnet contains this linode id. There is some discussion about an endpoint
  // that will directly get vpcs associated with a linode ID, and if that happens, we can
  // replace this query
  // query is paginated -- does not passing in any params mean that it will get all vpcs?
  const { data: vpcs } = useVPCsQuery({}, {});

  const linodesMaintenance = addMaintenanceToLinodes(
    accountMaintenanceData ?? [],
    linodes ?? []
  );

  const linodesData = addVPCToLinodes(vpcs?.data ?? [], linodesMaintenance);

  return (
    <LinodesLanding
      someLinodesHaveScheduledMaintenance={Boolean(
        someLinodesHaveScheduledMaintenance
      )}
      linodesData={linodesData}
      linodesRequestError={error ?? undefined}
      linodesRequestLoading={isLoading}
    />
  );
});
