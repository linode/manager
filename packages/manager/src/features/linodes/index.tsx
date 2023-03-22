import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useLinodes from 'src/hooks/useLinodes';
import { useSpecificTypes } from 'src/queries/types';
import { useAllAccountMaintenanceQuery } from 'src/queries/accountMaintenance';
import { addMaintenanceToLinodes } from 'src/store/linodes/linodes.helpers';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';
import { extendTypesQueryResult } from 'src/utilities/extendType';

const LinodesLanding = React.lazy(() => import('./LinodesLanding'));
const LinodesDetail = React.lazy(() => import('./LinodesDetail'));
const LinodesCreate = React.lazy(
  () => import('./LinodesCreate/LinodeCreateContainer')
);

const LinodesRoutes: React.FC = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={LinodesCreate} path="/linodes/create" />
        <Route component={LinodesDetail} path="/linodes/:linodeId" />
        <Route component={LinodesLandingWrapper} path="/linodes" exact strict />
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
  const { linodes } = useLinodes();
  const typesQuery = useSpecificTypes(
    Object.values(linodes.itemsById)
      .map((linode) => linode.type)
      .filter(isNotNullOrUndefined)
  );

  const types = extendTypesQueryResult(typesQuery);

  const linodesDataWithFullType = Object.values(linodes.itemsById).map(
    (thisLinode) => {
      return {
        ...thisLinode,
        _type: types?.find((type) => type.id === thisLinode.type),
      };
    }
  );

  const linodesWithMaintenance = addMaintenanceToLinodes(
    accountMaintenanceData ?? [],
    linodesDataWithFullType
  );

  const someLinodesHaveScheduledMaintenance = accountMaintenanceData?.some(
    (thisAccountMaintenance) => {
      return linodes.itemsById[thisAccountMaintenance.entity.id];
    }
  );

  return (
    <LinodesLanding
      someLinodesHaveScheduledMaintenance={Boolean(
        someLinodesHaveScheduledMaintenance
      )}
      linodesData={linodesWithMaintenance}
      linodesRequestLoading={linodes.loading}
      linodesRequestError={linodes.error.read}
    />
  );
});
