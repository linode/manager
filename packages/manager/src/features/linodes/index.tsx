import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useLinodes from 'src/hooks/useLinodes';
import { useTypes } from 'src/hooks/useTypes';
import { useAccountMaintenanceQuery } from 'src/queries/accountMaintenance';
import { addMaintenanceToLinodes } from 'src/store/linodes/linodes.helpers';

const LinodesLanding = React.lazy(() => import('./LinodesLanding'));
const LinodesCreate = React.lazy(
  () => import('./LinodesCreate/LinodeCreateContainer')
);
const LinodesDetail = React.lazy(() => import('./LinodesDetail'));

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
  const { data: accountMaintenanceData } = useAccountMaintenanceQuery();
  const { linodes } = useLinodes();
  const { typesMap } = useTypes();

  const linodesDataWithPlan = Object.values(linodes.itemsById).map(
    (thisLinode) => {
      return {
        ...thisLinode,
        plan: typesMap[thisLinode.type ?? '']?.label ?? 'Unknown',
      };
    }
  );

  const linodesWithMaintenance = addMaintenanceToLinodes(
    accountMaintenanceData ?? [],
    linodesDataWithPlan
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
